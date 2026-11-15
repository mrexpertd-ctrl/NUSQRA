const statuses = {
  open: 'Open',
  investigating: 'Investigating',
  actioned: 'Resolved',
  dismissed: 'Dismissed',
};
const types = {account:'Account', content:'Content', project:'Project', other:'Other'};
const dateFormat = new Intl.DateTimeFormat('en-GB', {
  dateStyle:'medium', timeStyle:'short', timeZone:'Asia/Riyadh',
});

export function setupModeration(section, {api, esc, canClose}) {
  const list = section.querySelector('#caseList');
  const filter = section.querySelector('#caseStatus');
  const message = section.querySelector('#caseMessage');
  const paging = section.querySelector('#casePaging');
  const previous = section.querySelector('#casePrevious');
  const next = section.querySelector('#caseNext');
  const createForm = section.querySelector('#newCase');
  let offset = 0;
  let loadRequest = 0;

  function report(text, bad = false) {
    message.textContent = text;
    message.classList.toggle('bad', bad);
  }

  function renderCase(item) {
    const type = Object.hasOwn(types,item.case_type) ? types[item.case_type] : item.case_type;
    const status = statuses[item.status];
    const evidence = /^https?:\/\/[^\s]+$/i.test(item.evidence_url || '')
      ? `<a href="${esc(item.evidence_url)}" target="_blank" rel="noopener noreferrer">Open evidence on an external site</a>` : '';
    const actions = item.status === 'open' ? '<option value="investigating">Start investigation</option>'
      : item.status === 'investigating' && canClose ? '<option value="actioned">Resolve</option><option value="dismissed">Dismiss</option>' : '';
    return `<article class="case">
      <header class="row"><div><h3>${esc(type)}</h3><time datetime="${esc(item.created_at)}">${dateFormat.format(new Date(item.created_at))}</time></div>
        <span class="role-pill case-status" data-status="${esc(item.status)}">${esc(status)}</span></header>
      <p class="case-description">${esc(item.description)}</p>
      <dl class="case-meta"><div><dt>Case ID</dt><dd>${esc(item.id)}</dd></div>
        ${item.target_user_id ? `<div><dt>Target account</dt><dd>${esc(item.target_user_id)}</dd></div>` : ''}</dl>
      ${evidence}
      ${item.resolution_note ? `<p class="case-description"><strong>Decision</strong><br>${esc(item.resolution_note)}</p>` : ''}
      ${actions ? `<details class="case-action"><summary>Update case</summary><form data-case-id="${esc(item.id)}" data-updated-at="${esc(item.updated_at)}">
        <label>Action<select name="action">${actions}</select></label>
        <label>Reason<textarea name="note" rows="2" maxlength="2000" required></textarea></label>
        <button class="primary">Save update</button>
      </form></details>` : ''}
    </article>`;
  }

  async function load() {
    const request = ++loadRequest;
    list.setAttribute('aria-busy','true');
    list.textContent = 'Loading cases…';
    paging.hidden = true;
    try {
      const params = new URLSearchParams({status:filter.value,offset});
      const result = await api('/api/moderation/cases?' + params);
      if (request !== loadRequest) return;
      if (!result.cases.length && offset > 0) {
        offset -= 20;
        return load();
      }
      list.innerHTML = result.cases.length ? result.cases.map(renderCase).join('')
        : `<div class="queue-empty"><h3>No ${statuses[filter.value].toLowerCase()} cases</h3><p>Choose another status or open a new case.</p></div>`;
      previous.disabled = offset === 0;
      next.disabled = !result.hasMore;
      paging.hidden = previous.disabled && next.disabled;
    } catch (error) {
      if (request === loadRequest) list.textContent = error.message;
    } finally {
      if (request === loadRequest) list.removeAttribute('aria-busy');
    }
  }

  async function submit(form, body) {
    const button = form.querySelector('button');
    button.disabled = true;
    report('Saving case…');
    try {
      await api('/api/moderation/cases',{method:'POST',body:JSON.stringify(body)});
      if (body.action === 'create') {
        form.reset();
        form.closest('details').open = false;
        filter.value = 'open';
        offset = 0;
      }
      await load();
      report(body.action === 'create' ? 'Case opened.' : 'Case updated.');
      message.focus();
    } catch (error) {
      report(error.message,true);
      message.focus();
    } finally {
      button.disabled = false;
    }
  }

  createForm.addEventListener('submit',event=>{
    event.preventDefault();
    const fields = new FormData(createForm);
    submit(createForm,{action:'create',caseType:fields.get('caseType'),note:fields.get('note'),targetId:fields.get('targetId').trim()});
  });
  list.addEventListener('submit',event=>{
    event.preventDefault();
    const form = event.target;
    const fields = new FormData(form);
    submit(form,{action:fields.get('action'),note:fields.get('note'),caseId:form.dataset.caseId,updatedAt:form.dataset.updatedAt});
  });
  filter.addEventListener('change',()=>{offset=0;report('');load();});
  section.querySelector('#caseRefresh').onclick=()=>{report('');load();};
  previous.onclick=()=>{offset=Math.max(offset-20,0);load();};
  next.onclick=()=>{offset+=20;load();};
  return load;
}

export const moderationMarkup = `<section class="panel section" id="moderation" data-workspace-panel hidden aria-labelledby="moderationTitle">
  <div class="workspace-section-head"><div><h2 id="moderationTitle">Moderation queue</h2><p class="muted">Track account, content and project cases.</p></div>
    <button class="ghost smallbtn" id="caseRefresh" type="button">Refresh</button></div>
  <details class="new-case"><summary>Open a case</summary>
    <form id="newCase">
      <div class="case-form-fields">
        <label>Case type<select name="caseType">${Object.entries(types).map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select></label>
        <label>Target account ID (optional)<input name="targetId" maxlength="36" spellcheck="false"></label>
      </div>
      <label>Case details<textarea name="note" rows="3" maxlength="2000" required></textarea></label>
      <button class="primary">Create case</button>
    </form>
  </details>
  <div class="queue-toolbar"><label for="caseStatus">Case status</label><select id="caseStatus">${Object.entries(statuses).map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select></div>
  <p class="message" id="caseMessage" role="status" tabindex="-1"></p>
  <div class="case-list" id="caseList" aria-live="polite"></div>
  <nav class="case-paging" id="casePaging" aria-label="Case queue pages" hidden><button type="button" class="ghost" id="casePrevious">Previous</button><button type="button" class="ghost" id="caseNext">Next</button></nav>
</section>`;
