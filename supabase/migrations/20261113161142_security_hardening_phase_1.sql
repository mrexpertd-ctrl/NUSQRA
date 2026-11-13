-- NUSQRA security hardening phase 1
-- Preserve contact data privately, then clear it from publicly readable profiles.
create table if not exists private.profile_contacts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phone_number text,
  updated_at timestamptz not null default now()
);
alter table private.profile_contacts enable row level security;
alter table private.profile_contacts force row level security;
drop policy if exists "Users can view own private contact" on private.profile_contacts;
create policy "Users can view own private contact"
  on private.profile_contacts for select to authenticated
  using (user_id = (select auth.uid()));

insert into private.profile_contacts(user_id, phone_number)
select id, phone_number from public.profiles
where phone_number is not null
on conflict (user_id) do update
set phone_number = excluded.phone_number, updated_at = now();

create or replace function private.clear_public_phone_number()
returns trigger
language plpgsql
set search_path = pg_catalog
as $function$
begin
  new.phone_number := null;
  return new;
end;
$function$;
revoke all on function private.clear_public_phone_number() from public, anon, authenticated;
drop trigger if exists profiles_clear_public_phone_number on public.profiles;
create trigger profiles_clear_public_phone_number
before insert or update of phone_number on public.profiles
for each row execute function private.clear_public_phone_number();

update public.profiles set phone_number = null where phone_number is not null;

-- Anonymous visitors only need public reads; remove unnecessary write privileges.
revoke insert, update, delete, truncate, references, trigger
  on all tables in schema public from anon;
revoke create on schema public from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke insert, update, delete, truncate, references, trigger on tables from anon;

-- Correct the rating policy so a rating must match the exact completed job
-- and the professional with the accepted proposal.
drop policy if exists "Customers rate skills after completed work"
  on public.professional_skill_ratings;
create policy "Customers rate skills after completed work"
  on public.professional_skill_ratings
  for insert to authenticated
  with check (
    reviewer_id = (select auth.uid())
    and exists (
      select 1
      from public.jobs j
      join public.proposals p on p.job_id = j.id
      where j.id = professional_skill_ratings.job_id
        and j.customer_id = (select auth.uid())
        and j.status = 'completed'::public.job_status
        and p.professional_id = professional_skill_ratings.professional_id
        and p.status = 'accepted'::public.proposal_status
    )
  );

-- Prevent browser clients from invoking the embedded admin RPCs.
-- Admin operations will be reintroduced through a separately authenticated backend.
revoke execute on function public.admin_assign_staff_role(uuid, text) from public, anon, authenticated;
revoke execute on function public.admin_dashboard_metrics() from public, anon, authenticated;
revoke execute on function public.admin_list_accounts() from public, anon, authenticated;
revoke execute on function public.admin_revoke_staff_role(uuid) from public, anon, authenticated;
revoke execute on function public.admin_set_account_control(uuid, text, jsonb, text) from public, anon, authenticated;

-- Defense in depth: NULL role must never pass an allow-list check.
create or replace function public.admin_set_account_control(
  target_user_id uuid,
  new_status text,
  new_restrictions jsonb default '{}'::jsonb,
  action_reason text default null
)
returns void
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'private', 'auth'
as $function$
declare
  actor_role text;
  target_role text;
begin
  select staff_role into actor_role
  from public.staff_roles
  where user_id = auth.uid() and is_active = true;

  if actor_role is null or actor_role not in ('super_admin','class2_admin') then
    raise exception 'Insufficient permission to control accounts' using errcode = '42501';
  end if;

  if new_status not in ('active','restricted','banned','deletion_requested') then
    raise exception 'Invalid account status';
  end if;

  select staff_role into target_role
  from public.staff_roles
  where user_id = target_user_id and is_active = true;

  if actor_role = 'class2_admin' and (new_status <> 'banned' or target_role is not null) then
    raise exception 'Class 2 Admin may only ban regular accounts' using errcode = '42501';
  end if;

  if target_user_id = auth.uid() then
    raise exception 'Staff cannot change their own account status';
  end if;

  insert into public.account_controls(user_id, account_status, restrictions, reason, updated_by, updated_at)
  values (target_user_id, new_status, coalesce(new_restrictions,'{}'::jsonb), action_reason, auth.uid(), now())
  on conflict (user_id) do update
    set account_status = excluded.account_status,
        restrictions = excluded.restrictions,
        reason = excluded.reason,
        updated_by = auth.uid(),
        updated_at = now();

  insert into public.admin_audit_log(actor_id, action, target_user_id, details)
  values (auth.uid(), 'account_control_changed', target_user_id,
    jsonb_build_object('status',new_status,'restrictions',coalesce(new_restrictions,'{}'::jsonb),'reason',action_reason));
end;
$function$;
revoke execute on function public.admin_set_account_control(uuid, text, jsonb, text) from public, anon, authenticated;
