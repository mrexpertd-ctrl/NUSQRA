export const accountsMarkup = `<section class="panel section" id="accounts" data-workspace-panel hidden aria-labelledby="accountsTitle">
  <div class="workspace-section-head"><div><h2 id="accountsTitle">Marketplace accounts</h2>
  <p class="muted">Review registrations, signed-in visits and profile distinctions.</p></div></div>
  <form id="accountSearch" class="account-filters">
    <label>Search accounts<input name="q" type="search" maxlength="120" placeholder="Name, email or profession"></label>
    <label>Show<select name="view"><option value="accounts">Newest registrations</option><option value="visits">Recent signed-in visits</option></select></label>
    <button class="ghost">Search</button>
  </form>
  <p class="message" data-account-message role="status"></p>
  <div class="account-results" data-account-results></div>
  <div class="account-pagination"><button class="ghost" data-previous type="button" hidden>Previous</button><button class="ghost" data-next type="button" hidden>Next</button></div>
</section>`;

export function setupAccounts(panel,{api,esc}) {
  const search=panel.querySelector('#accountSearch');
  const results=panel.querySelector('[data-account-results]');
  const message=panel.querySelector('[data-account-message]');
  const previous=panel.querySelector('[data-previous]');
  const next=panel.querySelector('[data-next]');
  const date=new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Riyadh'});
  const format=value=>value ? date.format(new Date(value)) : '—';
  let offset=0;
  let requestNumber=0;
  const options=(values, selected)=>values.map(([value,label])=>`<option value="${value}"${value===String(selected??'')?' selected':''}>${label}</option>`).join('');

  function card(account) {
    const email=esc(account.email || '');
    const confirmWith=email || esc(account.id);
    return `<article class="account-card">
      <div><h3>${esc(account.display_name || account.email || 'Unnamed account')}${account.verified?'<span class="account-blue-tick" aria-label="Verified by NUSQRA"> ✓</span>':''}</h3>
      <p>${email || 'No email on file'} · ${esc(account.roles.join(', ') || 'No marketplace role')}</p>
      <p>${esc(account.profession || 'No profession listed')}</p></div>
      <dl><div><dt>Registered</dt><dd>${format(account.created_at)}</dd></div><div><dt>Last recorded visit</dt><dd>${format(account.last_visited_at)}</dd></div>
      <div><dt>Email</dt><dd>${account.email_confirmed_at?'Confirmed':'Unconfirmed'}</dd></div>
      ${account.professional_status?`<div><dt>Professional review</dt><dd>${esc(account.professional_status.replaceAll('_',' '))}</dd></div>`:''}</dl>
      ${account.has_profile?`<details><summary>Edit blue tick, stars and frame</summary>
        <form data-action="distinctions" data-id="${account.id}">
          <label class="account-check"><input name="verified" type="checkbox"${account.verified?' checked':''}> Award verified blue tick</label>
          <label>Staff stars<select name="stars">${options([['','None'],...Array.from({length:5},(_,i)=>[String(i+1),String(i+1)])],account.stars)}</select></label>
          <label>Profile frame<select name="tier">${options([['','Use earned frame'],['gold','Gold'],['emerald','Emerald'],['diamond','Diamond']],account.tier)}</select></label>
          ${account.professional_status?`<label>Professional review<select name="professionalReview">${options([['','Keep current status'],['pending_review','Pending review'],['verified','Verified professional'],['rejected','Rejected']],null)}</select></label>`:''}
          <label>Reason<input name="reason" required maxlength="1000"></label>
          <button class="primary">Save profile changes</button><p class="message" role="status"></p>
        </form></details>`:''}
      ${account.staff_account?'':`<details><summary class="account-delete">Delete account</summary>
        <form data-action="delete" data-id="${account.id}">
          <p>Permanent. Removes the account and may remove its uploads, projects, proposals and conversations.</p>
          <label>Type ${confirmWith} to confirm<input name="confirmation" required maxlength="254" autocomplete="off"></label>
          <label>Reason<input name="reason" required maxlength="1000"></label>
          <button class="ghost account-delete">Permanently delete account</button><p class="message" role="status"></p>
        </form></details>`}
    </article>`;
  }

  async function load() {
    const ticket=++requestNumber;
    const query=new URLSearchParams(new FormData(search));
    query.set('offset',offset);
    previous.disabled=true;
    next.disabled=true;
    results.setAttribute('aria-busy','true');
    try {
      const {accounts,hasMore}=await api('/api/accounts?'+query);
      if(ticket!==requestNumber)return;
      if(!accounts.length && offset>0){offset=Math.max(0,offset-20);return load();}
      results.innerHTML=accounts.length?accounts.map(card).join(''):'<p class="muted">No matching accounts.</p>';
      previous.hidden=offset===0;
      next.hidden=!hasMore;
      const byId=new Map(accounts.map(account=>[account.id,account]));
      for(const form of results.querySelectorAll('form')) {
        form.onsubmit=async event=>{
          event.preventDefault();
          const fields=new FormData(form);
          const account=byId.get(form.dataset.id);
          const action=form.dataset.action;
          const status=form.querySelector('[role="status"]');
          const button=form.querySelector('button');
          const payload={action,targetId:account.id,reason:fields.get('reason')};
          if(action==='delete'){
            payload.confirmedAccount=fields.get('confirmation');
            if(payload.confirmedAccount.trim().toLowerCase()!==(account.email||account.id).toLowerCase()){
              status.textContent='Type the exact email or ID shown above.';
              return;
            }
          }else{
            Object.assign(payload,{verified:fields.has('verified'),stars:Number(fields.get('stars'))||null,tier:fields.get('tier')||null,professionalReview:fields.get('professionalReview')||null,updatedAt:account.distinction_updated_at});
          }
          button.disabled=true;
          message.textContent='';
          try {
            await api('/api/accounts',{method:'POST',body:JSON.stringify(payload)});
            message.textContent=action==='delete'?'Account deleted.':'Profile changes saved.';
            await load();
          } catch(error){status.textContent=error.message;status.classList.add('bad');}
          finally{button.disabled=false;}
        };
      }
    }catch(error){
      if(ticket===requestNumber){results.textContent=error.message;previous.hidden=true;next.hidden=true;}
    }finally{
      if(ticket===requestNumber){results.removeAttribute('aria-busy');previous.disabled=false;next.disabled=false;}
    }
  }
  search.onsubmit=event=>{event.preventDefault();offset=0;message.textContent='';load();};
  search.elements.view.onchange=()=>search.requestSubmit();
  previous.onclick=()=>{offset=Math.max(0,offset-20);load();};
  next.onclick=()=>{offset+=20;load();};
  return load;
}
