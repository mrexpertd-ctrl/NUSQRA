import { createClient } from '@supabase/supabase-js';

const JSON_HEADERS = { 'content-type':'application/json; charset=utf-8', 'cache-control':'no-store, private', 'x-robots-tag':'noindex, nofollow, noarchive' };
const SECURITY_HEADERS = {
  'x-content-type-options':'nosniff',
  'referrer-policy':'no-referrer',
  'x-frame-options':'DENY',
  'permissions-policy':'camera=(), microphone=(), geolocation=()',
  'content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
};
const json = (data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...JSON_HEADERS,...SECURITY_HEADERS}});
const decodeJwt = token => {
  try { const raw=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'); return JSON.parse(atob(raw)); } catch { return null; }
};
const getClients = env => {
  const publicClient=createClient(env.SUPABASE_URL,env.SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  const service=createClient(env.SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  return {publicClient,service};
};
async function authenticate(request,env,required=true){
  const token=(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');
  if(!token) throw new Error('Sign in is required.');
  const {publicClient,service}=getClients(env);
  const {data:{user},error}=await publicClient.auth.getUser(token);
  if(error||!user) throw new Error('Your session is invalid or expired.');
  const {data:aalData,error:aalError}=await publicClient.auth.mfa.getAuthenticatorAssuranceLevel(token);
  if(aalError||aalData?.currentLevel!=='aal2') throw new Error('Two-factor authentication is required.');
  const email=(user.email||'').toLowerCase();
  let {data:staff,error:staffError}=await service.from('admin_staff_directory').select('*').eq('email',email).maybeSingle();
  if(staffError) throw new Error('Staff authorization could not be checked.');
  if(!staff && email===(env.SUPREME_ADMIN_EMAIL||'').toLowerCase()){
    const {count}=await service.from('admin_staff_directory').select('*',{count:'exact',head:true}).eq('staff_role','supreme_admin').in('status',['invited','active']);
    if(count!==0) throw new Error('The Supreme Admin seat is already assigned.');
    const {data:created,error:createError}=await service.from('admin_staff_directory').insert({email,user_id:user.id,staff_role:'supreme_admin',status:'active',activated_at:new Date().toISOString()}).select('*').single();
    if(createError) throw new Error('Supreme Admin bootstrap failed.');
    staff=created;
  }
  if(!staff) throw new Error('This email has not been invited to NUSQRA Administration.');
  if(staff.status==='invited' && !staff.user_id){
    const {data:linked,error:linkError}=await service.from('admin_staff_directory').update({user_id:user.id,status:'active',activated_at:new Date().toISOString()}).eq('id',staff.id).eq('status','invited').select('*').single();
    if(linkError) throw new Error('Staff invitation could not be activated.');
    staff=linked;
  }
  if(staff.status!=='active'||(staff.user_id && staff.user_id!==user.id)) throw new Error('Your staff access is inactive.');
  const claims=decodeJwt(token);
  if(!claims?.session_id||!claims?.exp) throw new Error('Session claims are missing.');
  const now=Date.now();
  const {data:session}=await service.from('admin_sessions').select('*').eq('session_id',claims.session_id).maybeSingle();
  if(session?.revoked_at) throw new Error('This administration session has been revoked.');
  if(session && now-new Date(session.last_seen_at).getTime()>30*60*1000) {
    await service.from('admin_sessions').update({revoked_at:new Date().toISOString()}).eq('session_id',claims.session_id);
    throw new Error('Session expired after 30 minutes of inactivity. Sign in again.');
  }
  if(!session){
    const {error:sessionError}=await service.from('admin_sessions').insert({session_id:claims.session_id,user_id:user.id,last_seen_at:new Date().toISOString()});
    if(sessionError) throw new Error('Could not establish a secure administration session.');
  } else {
    await service.from('admin_sessions').update({last_seen_at:new Date().toISOString()}).eq('session_id',claims.session_id);
  }
  return {user,staff,service,claims};
}
async function audit(ctx,request,action,targetType=null,targetId=null,reason=null){
  const {error}=await ctx.service.from('admin_audit_events').insert({
    actor_user_id:ctx.user.id,actor_email:ctx.user.email,actor_role:ctx.staff.staff_role,
    action,target_type:targetType,target_id:targetId,reason,
    ip_address:request.headers.get('cf-connecting-ip')||null,
    user_agent:request.headers.get('user-agent')||null
  });
  if(error) throw new Error('The action could not be recorded in the audit log.');
}
function sameOrigin(request){
  const origin=request.headers.get('origin');
  if(!origin) return true;
  return new URL(origin).host===new URL(request.url).host;
}
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(request.method==='OPTIONS') return new Response(null,{status:204,headers:{...SECURITY_HEADERS,'allow':'GET, POST, OPTIONS','cache-control':'no-store'}});
  if(url.pathname.startsWith('/api/')){
   if(!sameOrigin(request)) return json({error:'Cross-origin request blocked.'},403);
   if(url.pathname==='/api/config'&&request.method==='GET') return json({supabaseUrl:env.SUPABASE_URL,anonKey:env.SUPABASE_ANON_KEY});
   if(url.pathname==='/api/session'&&request.method==='POST'){
    try { const ctx=await authenticate(request,env); await audit(ctx,request,'admin_session_authenticated'); return json({user:{email:ctx.user.email},role:ctx.staff.staff_role,sessionExpiresInMinutes:30}); }
    catch(e){return json({error:e.message},401);}
   }
   let ctx;
   try{ctx=await authenticate(request,env);}catch(e){return json({error:e.message},401);}
   if(url.pathname==='/api/me'&&request.method==='GET') return json({user:{email:ctx.user.email},role:ctx.staff.staff_role,sessionExpiresInMinutes:30});
   if(url.pathname==='/api/staff/invite'&&request.method==='POST'){
    if(ctx.staff.staff_role!=='supreme_admin') return json({error:'Only the Supreme Admin can manage staff.'},403);
    let body; try{body=await request.json();}catch{return json({error:'Invalid JSON.'},400);}
    const email=String(body.email||'').trim().toLowerCase(), role=body.role;
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({error:'Enter a valid email address.'},400);
    if(!['admin','moderator'].includes(role)) return json({error:'Only Admin or Moderator invitations are available.'},400);
    const {data:existing}=await ctx.service.from('admin_staff_directory').select('id,status').eq('email',email).maybeSingle();
    if(existing && !['removed','suspended'].includes(existing.status)) return json({error:'This email already has a staff invitation or account.'},409);
    const {error:inviteError}=await ctx.service.auth.admin.inviteUserByEmail(email,{data:{nusqra_admin_invite:true}});
    if(inviteError) return json({error:'Supabase could not send the invitation: '+inviteError.message},400);
    const {error:insertError}=await ctx.service.from('admin_staff_directory').upsert({email,staff_role:role,status:'invited',invited_by:ctx.user.id,user_id:null,invited_at:new Date().toISOString(),activated_at:null},{onConflict:'email'});
    if(insertError) return json({error:'Invitation sent but staff record failed. Contact the platform owner.'},500);
    await audit(ctx,request,'staff_invited','staff',email,'Role fixed at invitation: '+role);
    return json({success:true,message:'Invitation sent. Staff role is fixed as '+role+'.'});
   }
   if(url.pathname==='/api/audit'&&request.method==='GET'){
    if(ctx.staff.staff_role!=='supreme_admin') return json({error:'Only the Supreme Admin can view all audit events.'},403);
    const limit=Math.min(100,Math.max(1,Number(url.searchParams.get('limit')||50)));
    const {data,error}=await ctx.service.from('admin_audit_events').select('id,actor_email,actor_role,action,target_type,target_id,reason,ip_address,created_at').order('created_at',{ascending:false}).limit(limit);
    if(error) return json({error:'Audit events could not be loaded.'},500);
    return json({events:data||[]});
   }
   return json({error:'Not found.'},404);
  }
  if(request.method==='GET'){
    const response=await env.ASSETS.fetch(request);
    const headers=new Headers(response.headers);
    for(const [k,v] of Object.entries(SECURITY_HEADERS)) headers.set(k,v);
    headers.set('x-robots-tag','noindex, nofollow, noarchive');
    headers.set('cache-control','no-store, private');
    return new Response(response.body,{status:response.status,headers});
  }
  return json({error:'Method not allowed.'},405);
 }
};
