-- Phase A / step 1: extend existing marketplace schema; no data deletion.
-- REVIEW ONLY until validated against the actual Supabase migration state.
-- Existing public.jobs/public.proposals are reused rather than duplicated.

alter table public.jobs
  add column if not exists budget_type text,
  add column if not exists deadline date,
  add column if not exists is_remote boolean not null default false,
  add column if not exists content_language text not null default 'ar';

alter table public.proposals
  add column if not exists content_language text not null default 'ar';

alter table public.jobs
  add constraint jobs_phase_a_budget_type_valid
    check (budget_type is null or budget_type in ('fixed', 'hourly')),
  add constraint jobs_phase_a_content_language_valid
    check (content_language in ('ar','en'));

alter table public.proposals
  add constraint proposals_phase_a_content_language_valid
    check (content_language in ('ar','en'));

-- Enforce one winner even under concurrent requests.
-- If legacy data has multiple accepted proposals for a job, index creation
-- intentionally fails rather than silently deleting or changing user data.
create unique index proposals_one_accepted_per_job_idx
  on public.proposals(job_id)
  where status = 'accepted'::public.proposal_status;

create index jobs_open_deadline_idx
  on public.jobs(deadline, created_at desc)
  where status = 'open'::public.job_status;

-- Existing guard used to disallow all proposal edits. Allow the professional
-- to edit their own submitted proposal while the job remains open, or withdraw.
-- Only the job owner can accept/reject a submitted proposal.
-- Other lifecycle side effects remain governed by the existing triggers.
create or replace function public.nusqra_guard_proposal_update()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_owner uuid;
  v_job_status public.job_status;
begin
  if new.id is distinct from old.id
     or new.job_id is distinct from old.job_id
     or new.professional_id is distinct from old.professional_id
     or new.created_at is distinct from old.created_at then
    raise exception 'Proposal identity fields cannot be changed';
  end if;

  select j.customer_id, j.status into v_owner, v_job_status
  from public.jobs j where j.id = old.job_id;

  if v_job_status is distinct from 'open'::public.job_status then
    -- Internal rejection of other pending proposals after acceptance is
    -- handled by the existing after-decision trigger.
    if not (old.status = 'submitted'::public.proposal_status
      and new.status = 'rejected'::public.proposal_status
      and new.cover_letter is not distinct from old.cover_letter
      and new.proposed_price is not distinct from old.proposed_price
      and new.currency is not distinct from old.currency
      and new.delivery_days is not distinct from old.delivery_days
      and new.content_language is not distinct from old.content_language) then
      raise exception 'Proposal cannot be changed after job closes';
    end if;
  elsif v_actor = old.professional_id then
    if old.status <> 'submitted'::public.proposal_status
      or new.status not in ('submitted'::public.proposal_status, 'withdrawn'::public.proposal_status) then
      raise exception 'Only submitted proposals may be edited or withdrawn';
    end if;
  elsif v_actor = v_owner then
    if old.status <> 'submitted'::public.proposal_status
      or new.status not in ('accepted'::public.proposal_status, 'rejected'::public.proposal_status)
      or new.cover_letter is distinct from old.cover_letter
      or new.proposed_price is distinct from old.proposed_price
      or new.currency is distinct from old.currency
      or new.delivery_days is distinct from old.delivery_days
      or new.content_language is distinct from old.content_language then
      raise exception 'Job owner may only decide a submitted proposal';
    end if;
  else
    raise exception 'Not authorized to update this proposal';
  end if;

  return new;
end;
$$;

-- The original RLS update policy only authorizes customers.
-- Add professional-specific update permission for their own submitted proposals.
create policy "Professionals edit or withdraw own submitted proposals"
on public.proposals
for update to authenticated
using (
  professional_id = (select auth.uid())
  and status = 'submitted'::public.proposal_status
  and exists (
    select 1 from public.jobs j
    where j.id = proposals.job_id and j.status = 'open'::public.job_status
  )
)
with check (
  professional_id = (select auth.uid())
  and status in ('submitted'::public.proposal_status, 'withdrawn'::public.proposal_status)
);

-- IMPORTANT: Existing customer update policy and internal rejection trigger
-- require a further hardening pass before this migration is executed.
