-- Let a customer create a conversation only with the exact professional who submitted a proposal to that customer's job.
drop policy if exists "Customer may open conversation with a professional who bid" on public.conversations;
create policy "Customer may open conversation for own job proposal"
on public.conversations
for insert
to authenticated
with check (
  customer_id = (select auth.uid())
  and exists (
    select 1
    from public.jobs j
    join public.proposals p on p.job_id = j.id
    where j.id = conversations.job_id
      and j.customer_id = (select auth.uid())
      and p.professional_id = conversations.professional_id
      and p.status in ('submitted'::public.proposal_status, 'accepted'::public.proposal_status)
  )
);

-- A job has at most one conversation for each customer/professional pair.
create unique index if not exists conversations_job_customer_professional_uidx
on public.conversations(job_id, customer_id, professional_id);

-- Only the owner of a job may decide proposals submitted to it.
drop policy if exists "Customers decide proposals on own jobs" on public.proposals;
create policy "Customers decide proposals on own jobs"
on public.proposals
for update
to authenticated
using (
  exists (select 1 from public.jobs j where j.id = proposals.job_id and j.customer_id = (select auth.uid()))
)
with check (
  exists (select 1 from public.jobs j where j.id = proposals.job_id and j.customer_id = (select auth.uid()))
);

create or replace function public.nusqra_guard_proposal_update()
returns trigger
language plpgsql
as $$
begin
  if new.job_id is distinct from old.job_id
     or new.professional_id is distinct from old.professional_id
     or new.cover_letter is distinct from old.cover_letter
     or new.proposed_price is distinct from old.proposed_price
     or new.currency is distinct from old.currency
     or new.delivery_days is distinct from old.delivery_days
     or new.created_at is distinct from old.created_at then
    raise exception 'Proposal details cannot be edited during a decision.';
  end if;

  if new.status is distinct from old.status then
    if old.status <> 'submitted'::public.proposal_status
       or new.status not in ('accepted'::public.proposal_status, 'rejected'::public.proposal_status) then
      raise exception 'Only submitted proposals can be accepted or rejected.';
    end if;
    if not exists (
      select 1 from public.jobs j
      where j.id = old.job_id
        and j.customer_id = (select auth.uid())
        and j.status = 'open'::public.job_status
    ) then
      raise exception 'Only the owner of an open job can decide a proposal.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists nusqra_guard_proposal_update on public.proposals;
create trigger nusqra_guard_proposal_update
before update on public.proposals
for each row execute function public.nusqra_guard_proposal_update();

create or replace function public.nusqra_after_proposal_decision()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'accepted'::public.proposal_status
     and old.status is distinct from new.status then
    update public.proposals
      set status = 'rejected'::public.proposal_status,
          updated_at = now()
      where job_id = new.job_id
        and id <> new.id
        and status = 'submitted'::public.proposal_status;

    update public.jobs
      set status = 'in_progress'::public.job_status,
          updated_at = now()
      where id = new.job_id
        and status = 'open'::public.job_status;
  end if;
  return new;
end;
$$;

drop trigger if exists nusqra_after_proposal_decision on public.proposals;
create trigger nusqra_after_proposal_decision
after update of status on public.proposals
for each row execute function public.nusqra_after_proposal_decision();

create or replace function public.nusqra_guard_job_status()
returns trigger
language plpgsql
as $$
begin
  if new.customer_id is distinct from old.customer_id then
    raise exception 'A job owner cannot be changed.';
  end if;

  if new.status is distinct from old.status then
    if old.customer_id <> (select auth.uid()) then
      raise exception 'Only the job owner can change its status.';
    end if;

    if not (
      (old.status = 'open'::public.job_status and new.status in ('closed'::public.job_status, 'cancelled'::public.job_status))
      or (old.status = 'closed'::public.job_status and new.status in ('open'::public.job_status, 'cancelled'::public.job_status))
      or (old.status = 'in_progress'::public.job_status and new.status = 'completed'::public.job_status)
    ) then
      raise exception 'This job status transition is not allowed.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists nusqra_guard_job_status on public.jobs;
create trigger nusqra_guard_job_status
before update on public.jobs
for each row execute function public.nusqra_guard_job_status();

-- Enable participant-scoped live message updates through Supabase Realtime.
alter publication supabase_realtime add table public.messages;
