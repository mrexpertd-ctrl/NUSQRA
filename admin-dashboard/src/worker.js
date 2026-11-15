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
const staffRoles = ['supreme_admin', 'admin', 'moderator'];
const caseStatuses = ['open', 'investigating', 'actioned', 'dismissed'];
const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const decodeJwt = token => {
  try { const raw=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'); return JSON.parse(atob(raw)); } catch { return null; }
};
const getClients = env => {
  const publicClient=createClient(env.SUPABASE_URL,env.SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  const service=createClient(env.SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  return {publicClient,service};
};
async function authenticate(request,env,{touch=true}={}){
  const token=(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');
  if(!token) throw new Error('Sign in is required.');
  const {publicClient,service}=getClients(env);
  const {data:{user},error}=await publicClient.auth.getUser(token);
  if(error||!user) throw new Error('Your session is invalid or expired.');
  const {data:aalData,error:aalError}=await publicClient.auth.mfa.getAuthenticatorAssuranceLevel(token);
  if(aalError||aalData?.currentLevel!=='aal2') throw new Error('Two-factor authentication is required.');
  if (!user.email || !user.email_confirmed_at) throw new Error('A verified staff email is required.');
  const email=user.email.toLowerCase();
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
  if(staff.staff_role==='supreme_admin' && email!==(env.SUPREME_ADMIN_EMAIL||'').toLowerCase()) throw new Error('The configured Supreme Admin identity does not match this account.');
  if(staff.status==='invited' && !staff.user_id){
    const {data:linked,error:linkError}=await service.from('admin_staff_directory').update({user_id:user.id,status:'active',activated_at:new Date().toISOString()}).eq('id',staff.id).eq('status','invited').select('*').single();
    if(linkError) throw new Error('Staff invitation could not be activated.');
    staff=linked;
  }
  if(staff.status!=='active'||staff.user_id!==user.id||!staffRoles.includes(staff.staff_role)) throw new Error('Your staff access is inactive.');
  const claims=decodeJwt(token);
  if(!claims?.session_id||!claims?.exp) throw new Error('Session claims are missing.');
  const now=Date.now();
  const {data:session,error:sessionLookupError}=await service.from('admin_sessions').select('*').eq('session_id',claims.session_id).maybeSingle();
  if(sessionLookupError || (session && session.user_id!==user.id)) throw new Error('Your staff session could not be checked.');
  if(session?.revoked_at) throw new Error('This administration session has been revoked.');
  if(session && now-new Date(session.last_seen_at).getTime()>30*60*1000) {
    await service.from('admin_sessions').update({revoked_at:new Date().toISOString()}).eq('session_id',claims.session_id);
    throw new Error('Session expired after 30 minutes of inactivity. Sign in again.');
  }
  if(!session){
    const {error:sessionError}=await service.from('admin_sessions').insert({session_id:claims.session_id,user_id:user.id,last_seen_at:new Date().toISOString()});
    if(sessionError) throw new Error('Could not establish a secure administration session.');
  } else if(touch) {
    const {error:sessionUpdateError}=await service.from('admin_sessions').update({last_seen_at:new Date().toISOString()}).eq('session_id',claims.session_id);
    if(sessionUpdateError) throw new Error('Your staff session could not be updated.');
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
 return origin===new URL(request.url).origin;
}

async function moderate(request, url, ctx) {
  if (request.method === 'GET') {
    const status = url.searchParams.get('status') || 'open';
    const offset = Number(url.searchParams.get('offset') || 0);
    if (!caseStatuses.includes(status) || !Number.isSafeInteger(offset) || offset < 0) return json({error:'Invalid case filter.'},400);
    const {data,error} = await ctx.service.from('moderation_cases')
      .select('id,case_type,description,status,created_at,updated_at,target_user_id,evidence_url,resolution_note')
      .eq('status',status).order('created_at',{ascending:false}).order('id',{ascending:false}).range(offset,offset+20);
    if (error) return json({error:'Moderation cases could not be loaded.'},500);
    return json({cases:data.slice(0,20),hasMore:data.length>20});
  }
  if (request.method !== 'POST') return json({error:'Method not allowed.'},405);
  const body = await request.json().catch(()=>null);
  const action = body?.action;
  const note = typeof body?.note === 'string' ? body.note.trim() : '';
  if (!['create','investigating','actioned','dismissed'].includes(action) || !note || note.length>2000) {
    return json({error:'Enter case details or a reason of up to 2,000 characters.'},400);
  }
  if (action === 'create') {
    if (!['account','content','project','other'].includes(body.caseType) || (body.targetId && !uuid.test(body.targetId))) {
      return json({error:'Choose a case type and enter a valid target account ID if provided.'},400);
    }
  } else if (!uuid.test(body.caseId || '') || typeof body.updatedAt !== 'string' || !Number.isFinite(Date.parse(body.updatedAt))) {
    return json({error:'Select a valid case and refresh it before submitting.'},400);
  }
  if (ctx.staff.staff_role === 'moderator' && ['actioned','dismissed'].includes(action)) {
    return json({error:'An Admin or Super Admin must close this case.'},403);
  }
  const {data,error} = await ctx.service.rpc('staff_write_moderation_case',{
    actor_id:ctx.user.id, operation:action, details:note,
    case_id:action==='create'?null:body.caseId,
    expected_updated_at:action==='create'?null:body.updatedAt,
    new_case_type:action==='create'?body.caseType:null,
    new_target_id:action==='create'?(body.targetId||null):null,
    client_ip:request.headers.get('cf-connecting-ip')||null,
    client_agent:request.headers.get('user-agent')?.slice(0,500)||null,
  });
  if (error?.code === '42501' || data === 'forbidden') return json({error:'This action requires an active staff account with permission.'},403);
  if (error) return json({error:error.code==='23503'?'The target account could not be found.':'The case could not be saved.'},error.code==='23503'?400:500);
  if (data === 'conflict') return json({error:'This case changed. Refresh the queue and try again.'},409);
  return json({success:true},action==='create'?201:200);
}
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(request.method==='OPTIONS') return new Response(null,{status:204,headers:{...SECURITY_HEADERS,'allow':'GET, POST, OPTIONS','cache-control':'no-store'}});
  if(url.pathname.startsWith('/api/')){
   if(!sameOrigin(request)) return json({error:'Cross-origin request blocked.'},403);
   if (url.pathname === '/api/config' && request.method === 'GET') {
     if (!env.SUPABASE_SERVICE_ROLE_KEY || !env.SUPREME_ADMIN_EMAIL) return json({error:'Staff sign-in is unavailable until the Worker is configured.'},503);
     return json({supabaseUrl:env.SUPABASE_URL,anonKey:env.SUPABASE_ANON_KEY});
   }
   if(url.pathname==='/api/session'&&request.method==='POST'){
    try { const ctx=await authenticate(request,env); await audit(ctx,request,'admin_session_authenticated'); return json({user:{email:ctx.user.email},role:ctx.staff.staff_role,sessionExpiresInMinutes:30}); }
    catch(e){return json({error:e.message},401);}
   }
   let ctx;
   try{ctx=await authenticate(request,env,{touch:url.pathname!=='/api/overview/stats'});}catch(e){return json({error:e.message},401);}
   if(url.pathname==='/api/me'&&request.method==='GET') return json({user:{email:ctx.user.email},role:ctx.staff.staff_role,sessionExpiresInMinutes:30});
   if(url.pathname==='/api/moderation/cases') return moderate(request,url,ctx);
   if(url.pathname==='/api/overview/stats'&&request.method==='GET'){
    if(!['supreme_admin','admin'].includes(ctx.staff.staff_role)) return json({error:'Live analytics are available to Admins and the Supreme Admin only.'},403);
    const {data,error}=await ctx.service.rpc('admin_live_stats');
    if(error) return json({error:'Live analytics could not be loaded.'},500);
    return json(data);
   }
   if(url.pathname==='/api/staff/invite'&&request.method==='POST'){
    if(ctx.staff.staff_role!=='supreme_admin') return json({error:'Only the Supreme Admin can manage staff.'},403);
    let body; try{body=await request.json();}catch{return json({error:'Invalid JSON.'},400);}
    const email=String(body.email||'').trim().toLowerCase(), role=body.role;
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({error:'Enter a valid email address.'},400);
    if(!['admin','moderator'].includes(role)) return json({error:'Only Admin or Moderator invitations are available.'},400);
    const {data:existing}=await ctx.service.from('admin_staff_directory').select('id,status').eq('email',email).maybeSingle();
    if(existing && !['removed','suspended'].includes(existing.status)) return json({error:'This email already has a staff invitation or account.'},409);
    const {error:insertError}=await ctx.service.from('admin_staff_directory').upsert({email,staff_role:role,status:'invited',invited_by:ctx.user.id,user_id:null,invited_at:new Date().toISOString(),activated_at:null},{onConflict:'email'});
    if(insertError) return json({error:'Staff seat could not be reserved. The three-seat limit may have been reached.'},409);
    const {error:inviteError}=await ctx.service.auth.admin.inviteUserByEmail(email,{redirectTo:new URL('/',request.url).toString(),data:{nusqra_admin_invite:true}});
    if(inviteError){await ctx.service.from('admin_staff_directory').delete().eq('email',email).eq('status','invited');return json({error:'Supabase could not send the invitation: '+inviteError.message},400);}
    await audit(ctx,request,'staff_invited','staff',email,'Role fixed at invitation: '+role);
    return json({success:true,message:'Invitation sent. Staff role is fixed as '+role+'.'});
   }
   if(url.pathname==='/api/staff'&&request.method==='GET'){
    if(ctx.staff.staff_role!=='supreme_admin') return json({error:'Only the Supreme Admin can view staff management.'},403);
    const {data,error}=await ctx.service.from('admin_staff_directory').select('id,email,user_id,staff_role,status,invited_at,activated_at').order('invited_at',{ascending:false});
    if(error) return json({error:'Staff directory could not be loaded.'},500);
    const adminSeats=(data||[]).filter(x=>x.staff_role==='admin'&&['invited','active'].includes(x.status)).length;
    return json({staff:data||[],adminSeats,maxAdminSeats:3});
   }
   if(url.pathname==='/api/staff/manage'&&request.method==='POST'){
    if(ctx.staff.staff_role!=='supreme_admin') return json({error:'Only the Supreme Admin can manage staff.'},403);
    let body;try{body=await request.json();}catch{return json({error:'Invalid JSON.'},400);}
    const staffId=String(body.staffId||''),action=body.action,reason=String(body.reason||'').trim();
    if(!reason) return json({error:'A reason is required for every staff-management action.'},400);
    const {data:target,error:targetError}=await ctx.service.from('admin_staff_directory').select('*').eq('id',staffId).maybeSingle();
    if(targetError||!target) return json({error:'Staff member not found.'},404);
    if(target.staff_role==='supreme_admin') return json({error:'The Supreme Admin seat cannot be changed or removed through staff management.'},403);
    if(action==='change_role'){
      if(!['admin','moderator'].includes(body.role)) return json({error:'Choose Admin or Moderator.'},400);
      const {error}=await ctx.service.from('admin_staff_directory').update({staff_role:body.role,updated_at:new Date().toISOString()}).eq('id',staffId);
      if(error) return json({error:'Role change failed. The Admin seat limit may have been reached.'},409);
      await audit(ctx,request,'staff_role_changed','staff',target.email,reason+' (new role: '+body.role+')');
    }else if(action==='suspend'||action==='remove'){
      const status=action==='suspend'?'suspended':'removed';
      const {error}=await ctx.service.from('admin_staff_directory').update({status,updated_at:new Date().toISOString()}).eq('id',staffId);
      if(error) return json({error:'Staff status change failed.'},500);
      if(target.user_id) await ctx.service.from('admin_sessions').update({revoked_at:new Date().toISOString()}).eq('user_id',target.user_id).is('revoked_at',null);
      await audit(ctx,request,action==='suspend'?'staff_suspended':'staff_removed','staff',target.email,reason);
    }else return json({error:'Unsupported staff action.'},400);
    return json({success:true,message:'Staff record updated.'});
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
