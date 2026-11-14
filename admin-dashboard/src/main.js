import { createClient } from '@supabase/supabase-js';
import './style.css';

const root=document.querySelector('#app');
let supabase,session,staffRole;
let liveStatsChannel=null,liveStatsPoll=null,liveStatsTicker=null,liveStatsLastUpdated=null,liveStatsInFlight=false;
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
  supabase.auth.onAuthStateChange((event,nextSession)=>{
   if(nextSession) session=nextSession;
   else if(event==='SIGNED_OUT'&&session){session=null;renderLogin();}
  });
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
 stopLiveStats();
 const supreme=info.role==='supreme_admin';
 const adminAnalytics=['supreme_admin','admin'].includes(info.role);
 shell(`<main class="app-shell"><header class="top"><div class="brandline"><div class="mark small">N</div><div><b>NUSQRA</b><span>ADMINISTRATION</span></div></div><button id="signout" class="ghost smallbtn">Sign out</button></header><section class="welcome"><p class="eyebrow">SECURE OPERATIONS</p><h1>Administration</h1><p class="muted">Signed in as <b>${esc(info.user.email)}</b></p><span class="role-pill">${esc(info.role.replace('_',' ').toUpperCase())}</span></section><section class="grid"><article class="tile purple"><span>PHASE 01</span><h2>Identity & access</h2><p>Authentication, mandatory TOTP and server-side staff authorization.</p><b class="status">ACTIVE</b></article><article class="tile green"><span>SECURITY</span><h2>Audit protection</h2><p>Append-only audit records. Administrative actions are recorded by the Worker.</p><b class="status">ENABLED</b></article><article class="tile"><span>SESSION POLICY</span><h2>30-minute idle limit</h2><p>Sessions expire after 30 minutes without an authenticated request.</p><b class="status">ENFORCED</b></article></section>${adminAnalytics?`<section class="panel section analytics-panel" id="liveAnalytics">
 <div class="analytics-heading"><div><p class="eyebrow">LIVE OVERVIEW</p><h2>App installs & completed tasks</h2></div><div class="analytics-live-status"><span id="statsConnectionDot" class="connection-dot reconnecting"></span><span id="statsConnectionText">Connecting</span><span id="statsUpdated">Updated just now</span></div></div>
 <p class="muted install-count-note">Counts installs made through the browser's Add to Home Screen / Install button. App-store installs are not included.</p>
 <div class="analytics-grid">
  <article class="analytics-card"><div class="analytics-card-top"><div><p>APP INSTALLS</p><strong id="installTotal" class="analytics-total" data-value="0">0</strong></div><span class="analytics-icon purple-icon">↗</span></div><div class="analytics-periods"><span>Today <b id="installToday">0</b></span><span>Last 7 days <b id="installWeek">0</b></span></div><p id="installEmpty" class="analytics-empty">No installs yet</p><div id="installChart" class="analytics-chart" aria-label="App installs over the last 7 days"></div></article>
  <article class="analytics-card"><div class="analytics-card-top"><div><p>COMPLETED TASKS</p><strong id="taskTotal" class="analytics-total" data-value="0">0</strong></div><span class="analytics-icon green-icon">✓</span></div><div class="analytics-periods"><span>Today <b id="taskToday">0</b></span><span>Last 7 days <b id="taskWeek">0</b></span></div><p id="taskEmpty" class="analytics-empty">No completed tasks yet</p><div id="taskChart" class="analytics-chart" aria-label="Completed tasks over the last 7 days"></div></article>
 </div>
 <div class="analytics-feed"><div class="row"><h3>Live activity</h3><span class="muted">Latest events · no personal data</span></div><div id="liveFeed" class="audit muted">Waiting for activity…</div></div>
</section>`:''}${supreme?`<section class="panel section"><h2>Invite staff</h2><p class="muted">Only the Supreme Admin can invite staff. Role is fixed when invited. Admin seats are limited to three.</p><form id="invite"><label>Staff email<input name="email" type="email" required placeholder="colleague@example.com"></label><label>Role<select name="role"><option value="admin">Admin</option><option value="moderator">Moderator</option></select></label><button class="primary">Send invitation</button></form><p id="inviteMsg" class="message" aria-live="polite"></p></section><section class="panel section"><div class="row"><h2>Staff management</h2><span id="seats" class="role-pill">0 / 3 Admin seats</span></div><p class="muted">Supreme Admin only. Admin and Moderator roles are enforced by the Worker and database.</p><div id="staffList" class="audit muted">Loading staff…</div></section><section class="panel section"><div class="row"><h2>Audit log</h2><button id="refresh" class="ghost">Refresh</button></div><div id="audit" class="audit muted">Loading audit events…</div></section>`:''}<footer>Private NUSQRA system · English interface · Arabic RTL readiness planned</footer></main>`);
 document.querySelector('#signout').onclick=async()=>{stopLiveStats();await supabase.auth.signOut();session=null;renderLogin();};
 if(adminAnalytics) startLiveStats();
 if(supreme){document.querySelector('#invite').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const el=document.querySelector('#inviteMsg');try{const r=await api('/api/staff/invite',{method:'POST',body:JSON.stringify({email:f.get('email'),role:f.get('role')})});el.textContent=r.message;e.currentTarget.reset();}catch(err){el.textContent=err.message;el.className='message bad';}};document.querySelector('#refresh').onclick=loadAudit;loadAudit();loadStaff();}
}
function renderAnalyticsChart(rows,barColor){
 const values=Array.isArray(rows)?rows:[];
 const max=Math.max(1,...values.map(x=>Number(x.count)||0));
 const barWidth=22,gap=15,startX=8,baseY=76,chartHeight=54;
 return `<svg viewBox="0 0 280 104" role="img" aria-hidden="true" focusable="false"><line x1="4" y1="77" x2="276" y2="77" stroke="#555660" stroke-width="1"/>${values.map((item,index)=>{const value=Number(item.count)||0;const height=Math.max(value?4:2,(value/max)*chartHeight);const x=startX+index*(barWidth+gap);const y=baseY-height;return `<rect x="${x}" y="${y}" width="${barWidth}" height="${height}" rx="4" fill="${barColor}" opacity=".92"><title>${esc(item.label)}: ${value}</title></rect><text x="${x+barWidth/2}" y="94" text-anchor="middle" fill="#c5c6cf" font-size="9">${esc(item.label)}</text>`;}).join('')}</svg>`;
}
function animateAnalyticsNumber(id,value){
 const el=document.getElementById(id);if(!el)return;
 const target=Math.max(0,Number(value)||0),from=Number(el.dataset.value||0);
 el.dataset.value=String(target);
 if(from===target){el.textContent=target.toLocaleString();return;}
 const start=performance.now(),duration=420;
 const frame=now=>{const progress=Math.min(1,(now-start)/duration);const eased=1-Math.pow(1-progress,3);el.textContent=Math.round(from+(target-from)*eased).toLocaleString();if(progress<1)requestAnimationFrame(frame);};
 requestAnimationFrame(frame);
}
function formatFeedTime(value){
 try{return new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Riyadh',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(value));}
 catch{return '--:--:--';}
}
function updateAnalyticsAge(){
 const el=document.getElementById('statsUpdated');if(!el||!liveStatsLastUpdated)return;
 const seconds=Math.max(0,Math.floor((Date.now()-liveStatsLastUpdated)/1000));
 el.textContent=seconds<2?'Updated just now':`Updated ${seconds}s ago`;
}
async function loadLiveStats(){
 if(liveStatsInFlight||!document.getElementById('liveAnalytics'))return;
 liveStatsInFlight=true;
 try{
  const data=await api('/api/overview/stats');
  animateAnalyticsNumber('installTotal',data.installs?.total);
  animateAnalyticsNumber('installToday',data.installs?.today);
  animateAnalyticsNumber('installWeek',data.installs?.last_7_days);
  animateAnalyticsNumber('taskTotal',data.completed_tasks?.total);
  animateAnalyticsNumber('taskToday',data.completed_tasks?.today);
  animateAnalyticsNumber('taskWeek',data.completed_tasks?.last_7_days);
  const installTotal=Number(data.installs?.total)||0,taskTotal=Number(data.completed_tasks?.total)||0;
  document.querySelector('#installEmpty').hidden=installTotal!==0;
  document.querySelector('#taskEmpty').hidden=taskTotal!==0;
  document.querySelector('#installChart').innerHTML=renderAnalyticsChart(data.installs?.chart,'#8f62d0');
  document.querySelector('#taskChart').innerHTML=renderAnalyticsChart(data.completed_tasks?.chart,'#19c37d');
  const feed=document.querySelector('#liveFeed');
  const events=Array.isArray(data.feed)?data.feed:[];
  feed.innerHTML=events.length?events.slice(0,10).map(item=>`<div class="analytics-event"><b>${esc(item.type)}</b><time>${formatFeedTime(item.at)}</time></div>`).join(''):'No activity yet.';
  liveStatsLastUpdated=Date.now();updateAnalyticsAge();
 }catch(e){
  const feed=document.querySelector('#liveFeed');if(feed&&feed.textContent==='Waiting for activity…')feed.textContent=e.message;
 }finally{liveStatsInFlight=false;}
}
function setAnalyticsConnection(connected){
 const dot=document.querySelector('#statsConnectionDot'),label=document.querySelector('#statsConnectionText');
 if(!dot||!label)return;
 dot.classList.toggle('connected',connected);dot.classList.toggle('reconnecting',!connected);
 label.textContent=connected?'Live updates connected':'Reconnecting';
}
function startAnalyticsPolling(){
 if(liveStatsPoll||!document.getElementById('liveAnalytics'))return;
 liveStatsPoll=window.setInterval(loadLiveStats,3000);
}
function stopAnalyticsPolling(){
 if(liveStatsPoll){clearInterval(liveStatsPoll);liveStatsPoll=null;}
}
function startLiveStats(){
 if(!supabase||!document.getElementById('liveAnalytics'))return;
 loadLiveStats();
 if(liveStatsTicker)clearInterval(liveStatsTicker);
 liveStatsTicker=window.setInterval(updateAnalyticsAge,1000);
 try{
  liveStatsChannel=supabase.channel('nusqra-admin-live-overview')
   .on('postgres_changes',{event:'*',schema:'public',table:'app_installs'},()=>loadLiveStats())
   .on('postgres_changes',{event:'*',schema:'public',table:'job_completion_events'},()=>loadLiveStats())
   .subscribe(status=>{
    if(status==='SUBSCRIBED'){setAnalyticsConnection(true);stopAnalyticsPolling();}
    else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED'){setAnalyticsConnection(false);startAnalyticsPolling();}
   });
 }catch{setAnalyticsConnection(false);startAnalyticsPolling();}
}
function stopLiveStats(){
 stopAnalyticsPolling();
 if(liveStatsTicker){clearInterval(liveStatsTicker);liveStatsTicker=null;}
 if(liveStatsChannel&&supabase){supabase.removeChannel(liveStatsChannel);liveStatsChannel=null;}
 liveStatsLastUpdated=null;liveStatsInFlight=false;
}
async function loadStaff(){
 const el=document.querySelector('#staffList');if(!el)return;
 try{const r=await api('/api/staff');document.querySelector('#seats').textContent=r.adminSeats+' / '+r.maxAdminSeats+' Admin seats';el.innerHTML=r.staff.length?r.staff.map(x=>`<div class="event"><b>${esc(x.email)}</b><span>${esc(x.staff_role)} · ${esc(x.status)}</span><div class="staff-actions"><select data-role="${esc(x.id)}"><option value="admin" ${x.staff_role==='admin'?'selected':''}>Admin</option><option value="moderator" ${x.staff_role==='moderator'?'selected':''}>Moderator</option></select><button class="ghost" data-change="${esc(x.id)}">Change role</button><button class="ghost" data-suspend="${esc(x.id)}">Suspend</button><button class="danger" data-remove="${esc(x.id)}">Remove</button></div></div>`).join(''):'No staff members yet.';
 el.querySelectorAll('[data-change]').forEach(b=>b.onclick=()=>manageStaff(b.dataset.change,'change_role',el.querySelector('[data-role="'+b.dataset.change+'"]').value));
 el.querySelectorAll('[data-suspend]').forEach(b=>b.onclick=()=>manageStaff(b.dataset.suspend,'suspend'));
 el.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{if(confirm('Remove this staff member? Their administration sessions will be revoked.'))manageStaff(b.dataset.remove,'remove');});
 }catch(e){el.textContent=e.message;}
}
async function manageStaff(staffId,action,role){
 const reason=prompt('Enter the reason for this staff action:');if(!reason||!reason.trim())return;
 try{await api('/api/staff/manage',{method:'POST',body:JSON.stringify({staffId,action,role,reason:reason.trim()})});await loadStaff();}catch(e){alert(e.message);}
}
async function loadAudit(){const el=document.querySelector('#audit');try{const r=await api('/api/audit?limit=50');el.innerHTML=r.events.length?r.events.map(x=>`<div class="event"><b>${esc(x.action)}</b><span>${esc(x.actor_email)} · ${esc(x.actor_role)}</span><time>${new Date(x.created_at).toLocaleString()}</time>${x.reason?`<p>${esc(x.reason)}</p>`:''}</div>`).join(''):'No audit events yet.';}catch(e){el.textContent=e.message;}}
function renderError(msg){shell(`<main class="auth-wrap"><section class="brand"><div class="mark">N</div><h1>Access <span>restricted</span></h1><p class="muted">The administration system could not authorize this session.</p></section><section class="panel"><p class="message bad">${esc(msg)}</p><button id="back" class="primary">Return to sign in</button></section></main>`);document.querySelector('#back').onclick=async()=>{await supabase?.auth.signOut();session=null;renderLogin();};}
boot();
