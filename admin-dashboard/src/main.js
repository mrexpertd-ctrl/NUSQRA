import { createClient } from '@supabase/supabase-js';
import './style.css';

const root=document.querySelector('#app');
let supabase,session,staffRole;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shell=(content)=>{root.innerHTML=content;};
const api=async(path,options={})=>{
 const token=session?.access_token;
 const res=await fetch(path,{...options,headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{}),...(options.headers||{})}});
 const data=await res.json();
 if(!res.ok) throw new Error(data.error||'Request failed');
 return data;
};
async function boot(){
 try{
  const cfg=await api('/api/config');
  supabase=createClient(cfg.supabaseUrl,cfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const {data}=await supabase.auth.getSession(); session=data.session;
  if(session){
   if(session.user?.user_metadata?.nusqra_admin_invite && session.user?.user_metadata?.admin_password_initialized!==true){renderSetPassword();return;}
   await continueAuth();
  }else renderLogin();
 }catch(e){renderError(e.message);}
}
function renderLogin(){
 shell(`<main class="auth-wrap"><section class="brand"><div class="mark">N</div><p class="eyebrow">PRIVATE OPERATIONS</p><h1>NUSQRA<br><span>Administration</span></h1><p class="muted">Secure staff access. Two-factor authentication is mandatory.</p></section><section class="panel"><h2>Staff sign in</h2><form id="login"><label>Email address<input name="email" type="email" autocomplete="username" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><button class="primary">Continue securely</button><p id="msg" class="message" aria-live="polite"></p></form></section><p class="foot">Restricted system · All actions are audited</p></main>`);
 document.querySelector('#login').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);message('Signing in…');const {data,error}=await supabase.auth.signInWithPassword({email:f.get('email'),password:f.get('password')});if(error){message(error.message,true);return;}session=data.session;await continueAuth();};
}
function message(t,bad=false){const el=document.querySelector('#msg');if(el){el.textContent=t;el.className='message '+(bad?'bad':'');}}
async function continueAuth(){
 if(!session){renderLogin();return;}
 const {data,error}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
 if(error){renderError(error.message);return;}
 if(data.currentLevel!=='aal2'){
  const {data:factors}=await supabase.auth.mfa.listFactors();
  const verified=factors?.totp?.find(x=>x.status==='verified');
  if(verified){renderMfaChallenge(verified.id);return;}
  renderMfaEnroll();return;
 }
 try{const info=await api('/api/session',{method:'POST'});staffRole=info.role;renderDashboard(info);}catch(e){renderError(e.message);}
}
function renderSetPassword(){
 shell(`<main class="auth-wrap"><section class="brand"><div class="mark">N</div><p class="eyebrow">FIRST SIGN-IN</p><h1>Create your <span>password</span></h1><p class="muted">Choose your own private password. NUSQRA Administration never stores or sees it.</p></section><section class="panel"><form id="setPassword"><label>New password<input name="password" type="password" autocomplete="new-password" minlength="12" required></label><label>Confirm password<input name="confirm" type="password" autocomplete="new-password" minlength="12" required></label><button class="primary">Save password securely</button></form><p id="msg" class="message" aria-live="polite"></p></section></main>`);
 document.querySelector('#setPassword').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);if(f.get('password')!==f.get('confirm')){message('Passwords do not match.',true);return;}const {data,error}=await supabase.auth.updateUser({password:f.get('password'),data:{admin_password_initialized:true}});if(error){message(error.message,true);return;}session=(await supabase.auth.getSession()).data.session;await continueAuth();};
}
function renderMfaEnroll(){
 shell(`<main class="auth-wrap"><section class="brand"><div class="mark">N</div><p class="eyebrow">SECURITY SETUP</p><h1>Enable <span>Authenticator</span></h1><p class="muted">Scan the QR code with an authenticator app, then enter its six-digit code.</p></section><section class="panel"><button id="enroll" class="primary">Set up authenticator</button><div id="factor"></div><p id="msg" class="message" aria-live="polite"></p><button id="logout" class="ghost">Sign out</button></section></main>`);
 document.querySelector('#enroll').onclick=async()=>{
  try{const {data,error}=await supabase.auth.mfa.enroll({factorType:'totp',friendlyName:'NUSQRA Administration'});if(error)throw error;
   document.querySelector('#factor').innerHTML=`<img class="qr" alt="Authenticator QR code" src="${esc(data.totp.qr_code)}"><p class="muted">Manual key: <code>${esc(data.totp.secret)}</code></p><form id="verify"><label>Six-digit authenticator code<input name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required></label><button class="primary">Verify and activate 2FA</button></form>`;
   document.querySelector('#verify').onsubmit=async e=>{e.preventDefault();const code=new FormData(e.currentTarget).get('code');const ch=await supabase.auth.mfa.challenge({factorId:data.id});if(ch.error){message(ch.error.message,true);return;}const v=await supabase.auth.mfa.verify({factorId:data.id,challengeId:ch.data.id,code});if(v.error){message(v.error.message,true);return;}const s=await supabase.auth.getSession();session=s.data.session;await continueAuth();};
  }catch(e){message(e.message,true);}
 };
 document.querySelector('#logout').onclick=()=>supabase.auth.signOut().then(()=>{session=null;renderLogin();});
}
function renderMfaChallenge(factorId){
 shell(`<main class="auth-wrap"><section class="brand"><div class="mark">N</div><p class="eyebrow">SECOND FACTOR</p><h1>Verify <span>identity</span></h1><p class="muted">Enter the current code from your authenticator app.</p></section><section class="panel"><form id="verify"><label>Authenticator code<input name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required></label><button class="primary">Verify and continue</button></form><p id="msg" class="message" aria-live="polite"></p><button id="logout" class="ghost">Sign out</button></section></main>`);
 document.querySelector('#verify').onsubmit=async e=>{e.preventDefault();const code=new FormData(e.currentTarget).get('code');const ch=await supabase.auth.mfa.challenge({factorId});if(ch.error){message(ch.error.message,true);return;}const v=await supabase.auth.mfa.verify({factorId,challengeId:ch.data.id,code});if(v.error){message(v.error.message,true);return;}const s=await supabase.auth.getSession();session=s.data.session;await continueAuth();};
 document.querySelector('#logout').onclick=()=>supabase.auth.signOut().then(()=>{session=null;renderLogin();});
}
function renderDashboard(info){
 const supreme=info.role==='supreme_admin';
 shell(`<main class="app-shell"><header class="top"><div class="brandline"><div class="mark small">N</div><div><b>NUSQRA</b><span>ADMINISTRATION</span></div></div><button id="signout" class="ghost smallbtn">Sign out</button></header><section class="welcome"><p class="eyebrow">SECURE OPERATIONS</p><h1>Administration</h1><p class="muted">Signed in as <b>${esc(info.user.email)}</b></p><span class="role-pill">${esc(info.role.replace('_',' ').toUpperCase())}</span></section><section class="grid"><article class="tile purple"><span>PHASE 01</span><h2>Identity & access</h2><p>Authentication, mandatory TOTP and server-side staff authorization.</p><b class="status">ACTIVE</b></article><article class="tile green"><span>SECURITY</span><h2>Audit protection</h2><p>Append-only audit records. Administrative actions are recorded by the Worker.</p><b class="status">ENABLED</b></article><article class="tile"><span>SESSION POLICY</span><h2>30-minute idle limit</h2><p>Sessions expire after 30 minutes without an authenticated request.</p><b class="status">ENFORCED</b></article></section>${supreme?`<section class="panel section"><h2>Invite staff</h2><p class="muted">Only the Supreme Admin can invite staff. Role is fixed when invited. Admin seats are limited to three.</p><form id="invite"><label>Staff email<input name="email" type="email" required placeholder="colleague@example.com"></label><label>Role<select name="role"><option value="admin">Admin</option><option value="moderator">Moderator</option></select></label><button class="primary">Send invitation</button></form><p id="inviteMsg" class="message" aria-live="polite"></p></section><section class="panel section"><div class="row"><h2>Audit log</h2><button id="refresh" class="ghost">Refresh</button></div><div id="audit" class="audit muted">Loading audit events…</div></section>`:''}<footer>Private NUSQRA system · English interface · Arabic RTL readiness planned</footer></main>`);
 document.querySelector('#signout').onclick=async()=>{await supabase.auth.signOut();session=null;renderLogin();};
 if(supreme){document.querySelector('#invite').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const el=document.querySelector('#inviteMsg');try{const r=await api('/api/staff/invite',{method:'POST',body:JSON.stringify({email:f.get('email'),role:f.get('role')})});el.textContent=r.message;e.currentTarget.reset();}catch(err){el.textContent=err.message;el.className='message bad';}};document.querySelector('#refresh').onclick=loadAudit;loadAudit();}
}
async function loadAudit(){const el=document.querySelector('#audit');try{const r=await api('/api/audit?limit=50');el.innerHTML=r.events.length?r.events.map(x=>`<div class="event"><b>${esc(x.action)}</b><span>${esc(x.actor_email)} · ${esc(x.actor_role)}</span><time>${new Date(x.created_at).toLocaleString()}</time>${x.reason?`<p>${esc(x.reason)}</p>`:''}</div>`).join(''):'No audit events yet.';}catch(e){el.textContent=e.message;}}
function renderError(msg){shell(`<main class="auth-wrap"><section class="brand"><div class="mark">N</div><h1>Access <span>restricted</span></h1><p class="muted">The administration system could not authorize this session.</p></section><section class="panel"><p class="message bad">${esc(msg)}</p><button id="back" class="primary">Return to sign in</button></section></main>`);document.querySelector('#back').onclick=async()=>{await supabase?.auth.signOut();session=null;renderLogin();};}
supabase?.auth.onAuthStateChange((_event,s)=>{if(s){session=s;setTimeout(()=>continueAuth(),0);}else if(session){session=null;renderLogin();}});
boot();
