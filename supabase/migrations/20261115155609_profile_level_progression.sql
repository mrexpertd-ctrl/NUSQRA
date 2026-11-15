-- Keep the existing reputation RPC available to previously deployed clients.
create function private.profile_reputation_with_progress(profile_ids uuid[])
returns table (
  profile_id uuid,
  completed_projects bigint,
  confirmed_paid_projects bigint,
  skill_rating numeric,
  rating_count bigint,
  completed_tasks bigint
)
language sql stable security definer set search_path = '' as $$
  select reputation.*, participation.completed_tasks
  from private.profile_reputation(profile_ids) reputation
  cross join lateral (
    select count(*) as completed_tasks
    from (
      select j.id
      from public.jobs j
      join public.proposals p on p.job_id = j.id and p.status = 'accepted'
      where j.customer_id = reputation.profile_id
        and j.status = 'completed'
        and j.customer_id <> p.professional_id
      union
      select j.id
      from public.proposals p
      join public.jobs j on j.id = p.job_id and j.status = 'completed'
      where p.professional_id = reputation.profile_id
        and p.status = 'accepted'
        and j.customer_id <> p.professional_id
    ) completed_jobs
  ) participation;
$$;

create function public.profile_reputation_with_progress(profile_ids uuid[])
returns table (
  profile_id uuid,
  completed_projects bigint,
  confirmed_paid_projects bigint,
  skill_rating numeric,
  rating_count bigint,
  completed_tasks bigint
)
language sql stable security invoker set search_path = '' as $$
  select * from private.profile_reputation_with_progress(profile_ids);
$$;

revoke execute on function private.profile_reputation_with_progress(uuid[]),
  public.profile_reputation_with_progress(uuid[]) from public, anon;
grant execute on function private.profile_reputation_with_progress(uuid[]),
  public.profile_reputation_with_progress(uuid[]) to authenticated;

-- New submissions must enter the normal workflow before they can count as a completion.
create policy "New marketplace jobs start before assignment"
on public.jobs as restrictive for insert to authenticated
with check (status in ('draft', 'open'));

create policy "New marketplace proposals await a decision"
on public.proposals as restrictive for insert to authenticated
with check (status = 'submitted');
