create table private.project_payment_confirmations (
  job_id uuid not null references public.jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (job_id, user_id)
);

alter table private.project_payment_confirmations enable row level security;
revoke all on private.project_payment_confirmations from public, anon, authenticated;

create function private.set_project_payment_confirmation(project_id uuid, confirmed boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare requester uuid := auth.uid();
begin
  if requester is null or not exists (
    select 1 from public.jobs j join public.proposals p on p.job_id = j.id
    where j.id = project_id and j.status = 'completed' and p.status = 'accepted'
      and j.customer_id <> p.professional_id
      and requester in (j.customer_id, p.professional_id)
  ) then
    raise exception 'This project is unavailable for payment confirmation.' using errcode = '42501';
  end if;

  if confirmed then
    insert into private.project_payment_confirmations (job_id, user_id)
    values (project_id, requester) on conflict do nothing;
  else
    delete from private.project_payment_confirmations
    where job_id = project_id and user_id = requester;
  end if;
end;
$$;

create function private.my_reputation_projects()
returns table (job_id uuid, title text, as_customer boolean, confirmed_by_me boolean, confirmed_by_other boolean)
language sql stable security definer set search_path = '' as $$
  select j.id, j.title, j.customer_id = auth.uid(), mine.user_id is not null, other.user_id is not null
  from public.jobs j join public.proposals p on p.job_id = j.id and p.status = 'accepted'
  left join private.project_payment_confirmations mine on mine.job_id = j.id and mine.user_id = auth.uid()
  left join private.project_payment_confirmations other on other.job_id = j.id
    and other.user_id = case when j.customer_id = auth.uid() then p.professional_id else j.customer_id end
  where auth.uid() in (j.customer_id, p.professional_id)
    and j.customer_id <> p.professional_id and j.status = 'completed'
  order by j.completed_at desc nulls last, j.id;
$$;

create function private.profile_reputation(profile_ids uuid[])
returns table (profile_id uuid, completed_projects bigint, confirmed_paid_projects bigint, skill_rating numeric, rating_count bigint)
language sql stable security definer set search_path = '' as $$
  with visible as (
    select pr.id, pro.user_id is not null as show_professional
    from public.profiles pr
    left join public.professional_profiles pro on pro.user_id = pr.id and (pro.is_public or pr.id = auth.uid())
    where auth.uid() is not null and cardinality(profile_ids) between 1 and 60
      and pr.id = any(profile_ids) and (pr.is_public or pr.id = auth.uid())
  )
  select v.id,
    case when v.show_professional then completed.total else 0 end,
    paid.total,
    case when v.show_professional then ratings.average end,
    case when v.show_professional then ratings.total else 0 end
  from visible v
  cross join lateral (
    select count(distinct j.id) as total
    from public.proposals p join public.jobs j on j.id = p.job_id
    where p.professional_id = v.id and p.status = 'accepted' and j.status = 'completed'
  ) completed
  cross join lateral (
    select count(distinct j.id) as total
    from public.jobs j join public.proposals p on p.job_id = j.id and p.status = 'accepted'
    join private.project_payment_confirmations client on client.job_id = j.id and client.user_id = j.customer_id
    join private.project_payment_confirmations provider on provider.job_id = j.id and provider.user_id = p.professional_id
    where j.customer_id = v.id and j.status = 'completed' and j.customer_id <> p.professional_id
  ) paid
  cross join lateral (
    select round(avg(r.rating), 1) as average, count(*) as total
    from public.professional_skill_ratings r
    where r.professional_id = v.id
  ) ratings;
$$;

create function public.set_project_payment_confirmation(project_id uuid, confirmed boolean)
returns void language sql set search_path = '' as $$
  select private.set_project_payment_confirmation(project_id, confirmed);
$$;
create function public.my_reputation_projects()
returns table (job_id uuid, title text, as_customer boolean, confirmed_by_me boolean, confirmed_by_other boolean)
language sql stable set search_path = '' as $$
  select * from private.my_reputation_projects();
$$;
create function public.profile_reputation(profile_ids uuid[])
returns table (profile_id uuid, completed_projects bigint, confirmed_paid_projects bigint, skill_rating numeric, rating_count bigint)
language sql stable set search_path = '' as $$
  select * from private.profile_reputation(profile_ids);
$$;

revoke execute on function private.set_project_payment_confirmation(uuid, boolean), private.my_reputation_projects(), private.profile_reputation(uuid[]) from public, anon;
revoke execute on function public.set_project_payment_confirmation(uuid, boolean), public.my_reputation_projects(), public.profile_reputation(uuid[]) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.set_project_payment_confirmation(uuid, boolean), private.my_reputation_projects(), private.profile_reputation(uuid[]) to authenticated;
grant execute on function public.set_project_payment_confirmation(uuid, boolean), public.my_reputation_projects(), public.profile_reputation(uuid[]) to authenticated;
