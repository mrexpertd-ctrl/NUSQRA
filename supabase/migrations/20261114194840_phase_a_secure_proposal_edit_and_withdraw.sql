-- Executed on NUSQRA development Supabase as migration 20261114194840.
-- Preserve existing AFTER decision trigger and proposal status enum.
create or replace function public.nusqra_guard_proposal_update()
returns trigger language plpgsql set search_path = '' as $$
declare v_actor uuid := (select auth.uid());
declare v_owner uuid;
declare v_job_status public.job_status;
begin
 if new.id is distinct from old.id or new.job_id is distinct from old.job_id
 or new.professional_id is distinct from old.professional_id
 or new.created_at is distinct from old.created_at then
  raise exception 'Proposal identity cannot be modified';
 end if;
 select customer_id,status into v_owner,v_job_status from public.jobs where id=old.job_id for update;
 if not found then raise exception 'Job not found'; end if;
 if old.status='submitted'::public.proposal_status
 and new.status='rejected'::public.proposal_status
 and pg_trigger_depth()>1 and v_actor=v_owner
 and new.cover_letter is not distinct from old.cover_letter
 and new.proposed_price is not distinct from old.proposed_price
 and new.currency is not distinct from old.currency
 and new.delivery_days is not distinct from old.delivery_days
 and new.content_language is not distinct from old.content_language then
  return new;
 end if;
 if v_job_status<>'open'::public.job_status then
  raise exception 'Only proposals on open jobs can change';
 end if;
 if v_actor=old.professional_id then
  if not private.account_can('can_submit_proposals') then
   raise exception 'Account cannot update proposals';
  end if;
  if old.status<>'submitted'::public.proposal_status
    or new.status not in ('submitted'::public.proposal_status,'withdrawn'::public.proposal_status) then
   raise exception 'Only submitted proposals can be edited or withdrawn';
  end if;
 elsif v_actor=v_owner then
  if old.status<>'submitted'::public.proposal_status
    or new.status not in ('accepted'::public.proposal_status,'rejected'::public.proposal_status)
    or new.cover_letter is distinct from old.cover_letter
    or new.proposed_price is distinct from old.proposed_price
    or new.currency is distinct from old.currency
    or new.delivery_days is distinct from old.delivery_days
    or new.content_language is distinct from old.content_language then
   raise exception 'Job owner may only accept or reject a submitted proposal';
  end if;
 else
  raise exception 'Unauthorized proposal update';
 end if;
 return new;
end $$;
create policy "Professionals edit or withdraw own submitted proposals"
on public.proposals for update to authenticated
using (
 professional_id=(select auth.uid())
 and status='submitted'::public.proposal_status
 and private.account_can('can_submit_proposals')
 and exists (select 1 from public.jobs j where j.id=proposals.job_id and j.status='open'::public.job_status)
)
with check (
 professional_id=(select auth.uid())
 and status in ('submitted'::public.proposal_status,'withdrawn'::public.proposal_status)
 and private.account_can('can_submit_proposals')
);
