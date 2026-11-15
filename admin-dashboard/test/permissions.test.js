import assert from 'node:assert/strict';
import { test } from 'node:test';
import worker from '../src/worker.js';

const userId = '1155dce7-9907-48ac-9f62-5c43ea57249a';
const sessionId = '92cfe46d-7ca4-4677-82e1-979cd0001972';
const caseId = '080fa28a-64c9-4e2a-830c-328b7d92b27d';
const email = 'test@example.com';
const origin = 'https://staff.test';
const env = {
  SUPABASE_URL:'https://test.supabase.co', SUPABASE_ANON_KEY:'test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY:'test-service-key', SUPREME_ADMIN_EMAIL:email,
};
const makeToken = aal => [
  Buffer.from(JSON.stringify({typ:'JWT',alg:'HS256'})).toString('base64url'),
  Buffer.from(JSON.stringify({sub:userId, session_id:sessionId, exp:Math.floor(Date.now()/1000)+3600, aal})).toString('base64url'),
  'c2ln',
].join('.');

test('Worker checks staff identity and role before accessing case data', async t => {
  let staff;
  let touched = 0;
  let writes = 0;
  let expired = false;
  let revoked = false;
  let forbidden = false;
  let accountDeletes = 0;
  let removedFiles = 0;
  t.mock.method(globalThis,'fetch',async (resource,options)=>{
    const url = new URL(typeof resource === 'string' ? resource : resource.url);
    if(url.pathname==='/auth/v1/user') return Response.json({id:userId,email,email_confirmed_at:'2026-11-15T00:00:00Z',factors:[]});
    if(url.pathname.endsWith('/admin_staff_directory')) return Response.json(staff ? [staff] : []);
    if(url.pathname.endsWith('/admin_sessions')) {
      if(options.method==='PATCH'){
        if(JSON.parse(options.body).last_seen_at)touched++;
        return new Response(null,{status:204});
      }
      return Response.json([{
        user_id:userId,last_seen_at:new Date(Date.now()-(expired?31:0)*60000).toISOString(),
        revoked_at:revoked?new Date().toISOString():null,
      }]);
    }
    if(url.pathname.endsWith('/moderation_cases')) return Response.json([{id:caseId}]);
    if(url.pathname.endsWith('/rpc/staff_write_moderation_case')){
      const body=JSON.parse(options.body);
      assert.equal(body.actor_id,userId);
      writes++;
      return Response.json(forbidden?'forbidden':'ok');
    }
    if(url.pathname.endsWith('/rpc/admin_live_stats')) return Response.json({installs:{total:0}});
    if(url.pathname.endsWith('/rpc/staff_marketplace_accounts')){
      const body=JSON.parse(options.body);
      assert.equal(body.actor_id,userId);
      assert.equal(body.recent_visits,true);
      return Response.json([{id:caseId}]);
    }
    if(url.pathname.endsWith('/rpc/staff_save_profile_distinctions')){
      const body=JSON.parse(options.body);
      assert.equal(body.actor_id,userId);
      assert.equal(body.new_stars,5);
      return Response.json('conflict');
    }
    if(url.pathname.endsWith('/rpc/staff_delete_marketplace_account')){
      assert.equal(JSON.parse(options.body).confirmed_account,'member@example.com');
      return Response.json(++accountDeletes===1?{status:'storage',files:[{bucket_id:'profile-media',name:'target/avatar.jpg'}]}:{status:'deleted'});
    }
    if(url.pathname.endsWith('/object/profile-media')){
      assert.equal(options.method,'DELETE');
      assert.deepEqual(JSON.parse(options.body),{prefixes:['target/avatar.jpg']});
      removedFiles++;
      return Response.json([]);
    }
    if(url.pathname.endsWith('/admin_audit_events')) return Response.json([]);
    throw new Error('Unexpected backend request: '+url.pathname);
  });
  const call = (path, {aal = 'aal2', body, skipToken = false, crossOrigin} = {}) => worker.fetch(new Request(origin+path,{
    method:body?'POST':'GET', headers:{
      ...(skipToken?{}:{Authorization:'Bearer '+makeToken(aal)}),
      ...(crossOrigin?{Origin:crossOrigin}:{}),
    }, ...(body?{body:JSON.stringify(body)}:{}),
  }),env);
  const moderate='/api/moderation/cases';
  const accounts='/api/accounts?view=visits';
  const deleteAccount={action:'delete',targetId:caseId,confirmedAccount:'member@example.com',reason:'Test deletion'};
  assert.equal((await call(accounts,{skipToken:true})).status,401);
  const body={action:'actioned',caseId,updatedAt:'2026-11-15T00:00:00Z',note:'Reviewed the case'};
  assert.equal((await call(moderate,{skipToken:true})).status,401);
  assert.equal((await call('/api/bootstrap',{skipToken:true,body:{}})).status,401);
  assert.equal((await call(moderate,{aal:'aal1'})).status,401);
  staff={staff_role:'customer',user_id:userId,status:'active'};
  assert.equal((await call(moderate)).status,401);
  staff={staff_role:'moderator',user_id:userId,status:'suspended'};
  assert.equal((await call(moderate)).status,401);
  staff={staff_role:'moderator',user_id:userId,status:'active'};
  assert.equal((await call(moderate,{crossOrigin:'http://staff.test'})).status,403);
  assert.equal((await call(moderate)).status,200);
  assert.equal((await call(moderate,{body})).status,403);
  assert.equal(writes,0);
  assert.equal((await call(moderate,{body:{...body,action:'investigating'}})).status,200);
  assert.equal((await call('/api/overview/stats')).status,403);
  assert.equal((await call('/api/staff')).status,403);
  assert.equal((await call(accounts)).status,403);
  assert.equal((await call('/api/audit')).status,403);
  staff.staff_role='admin';
  assert.equal((await call(accounts,{body:deleteAccount})).status,403);
  assert.equal(accountDeletes,0);
  assert.equal((await call(moderate,{body})).status,200);
  assert.equal((await call('/api/audit')).status,403);
  const beforePoll=touched;
  assert.equal((await call('/api/overview/stats')).status,200);
  assert.equal(touched,beforePoll);
  forbidden=true;
  assert.equal((await call(moderate,{body})).status,403);
  staff.staff_role='supreme_admin';
  assert.equal((await call(accounts,{aal:'aal1'})).status,401);
  assert.equal((await call(accounts)).status,200);
  const distinctions={action:'distinctions',targetId:caseId,verified:true,stars:5,tier:'gold',professionalReview:null,updatedAt:null,reason:'Confirmed'};
  assert.equal((await call(accounts,{body:{...distinctions,stars:6}})).status,400);
  assert.equal((await call(accounts,{body:distinctions})).status,409);
  assert.equal((await call(accounts,{body:deleteAccount})).status,200);
  assert.equal(accountDeletes,2);
  assert.equal(removedFiles,1);
  assert.equal((await call('/api/audit')).status,200);
  revoked=true;
  assert.equal((await call(moderate)).status,401);
  revoked=false;
  expired=true;
  assert.equal((await call('/api/overview/stats')).status,401);
});
