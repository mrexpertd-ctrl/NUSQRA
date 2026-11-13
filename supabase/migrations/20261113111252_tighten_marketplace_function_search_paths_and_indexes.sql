alter function public.nusqra_guard_proposal_update() set search_path = '';
alter function public.nusqra_after_proposal_decision() set search_path = '';
alter function public.nusqra_guard_job_status() set search_path = '';

-- The table already had an equivalent unique constraint; keep only its index.
drop index if exists public.conversations_job_customer_professional_uidx;

create index if not exists messages_sender_id_idx
on public.messages(sender_id);
