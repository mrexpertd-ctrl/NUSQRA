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
      or (
        old.status = 'open'::public.job_status
        and new.status = 'in_progress'::public.job_status
        and exists (
          select 1 from public.proposals p
          where p.job_id = old.id and p.status = 'accepted'::public.proposal_status
        )
      )
    ) then
      raise exception 'This job status transition is not allowed.';
    end if;
  end if;
  return new;
end;
$$;
