create table public.profile_distinctions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  verified boolean not null default false,
  stars smallint check (stars between 1 and 5),
  tier text check (tier in ('gold','emerald','diamond')),
  updated_at timestamptz not null default now()
);
alter table public.profile_distinctions enable row level security;
revoke all on public.profile_distinctions from public, anon, authenticated;
grant select on public.profile_distinctions to authenticated;
create policy "Read distinctions on visible profiles" on public.profile_distinctions
for select to authenticated using (exists (
  select 1 from public.profiles p where p.id = user_id and (p.is_public or p.id = (select auth.uid()))
));

create table private.member_visits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_visited_at timestamptz not null
);
alter table private.member_visits enable row level security;
revoke all on private.member_visits from public, anon, authenticated;
create index member_visits_recent_idx on private.member_visits (last_visited_at desc, user_id);

create function private.record_member_visit() returns void
language sql security definer set search_path = '' as $$
  insert into private.member_visits as v (user_id,last_visited_at)
  select u.id, now() from auth.users u where u.id = auth.uid() and u.deleted_at is null
  on conflict (user_id) do update set last_visited_at = excluded.last_visited_at
  where v.last_visited_at < excluded.last_visited_at - interval '5 minutes';
$$;
create function public.record_member_visit() returns void
language sql set search_path = '' as $$ select private.record_member_visit(); $$;
revoke execute on function private.record_member_visit(), public.record_member_visit() from public, anon;
grant execute on function private.record_member_visit(), public.record_member_visit() to authenticated;

create function private.require_account_operator(actor_id uuid) returns text
language plpgsql stable set search_path = '' as $$
declare owner_email text;
begin
  select d.email into owner_email from public.admin_staff_directory d
  where d.user_id = actor_id and d.status = 'active' and d.staff_role = 'supreme_admin';
  if owner_email is null then
    raise exception 'Super Admin permission required.' using errcode = '42501';
  end if;
  return owner_email;
end;
$$;
revoke execute on function private.require_account_operator(uuid) from public, anon, authenticated;

create function public.staff_marketplace_accounts(actor_id uuid, search_term text, recent_visits boolean, page_offset integer)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare result jsonb;
begin
  perform private.require_account_operator(actor_id);
  if page_offset is null or page_offset < 0 or char_length(search_term) > 120 then
    raise exception 'Invalid account filters.' using errcode = '22023';
  end if;

  select coalesce(jsonb_agg(to_jsonb(a) order by a.sort_time desc, a.id), '[]'::jsonb) into result
  from (
    select u.id, u.email, u.created_at, u.email_confirmed_at, p.id is not null as has_profile,
      coalesce(nullif(p.display_name,''), p.full_name) as display_name, pro.headline as profession,
      pro.verification_status as professional_status, v.last_visited_at,
      coalesce((select array_agg(r.role order by r.role) from public.user_roles r where r.user_id = u.id), '{}') as roles,
      coalesce(d.verified,false) as verified, d.stars, d.tier, d.updated_at as distinction_updated_at,
      exists(select 1 from public.admin_staff_directory s
        where s.user_id = u.id or (s.user_id is null and s.email = lower(u.email))) as staff_account,
      case when recent_visits then v.last_visited_at else u.created_at end as sort_time
    from auth.users u
    left join public.profiles p on p.id = u.id
    left join public.professional_profiles pro on pro.user_id = u.id
    left join public.profile_distinctions d on d.user_id = u.id
    left join private.member_visits v on v.user_id = u.id
    where u.deleted_at is null and not u.is_anonymous
      and (not recent_visits or v.last_visited_at is not null)
      and (coalesce(search_term,'') = '' or position(lower(search_term) in
        lower(concat_ws(' ', u.email, p.display_name, p.full_name, pro.headline))) > 0)
    order by sort_time desc, u.id limit 21 offset page_offset
  ) a;
  return result;
end;
$$;

create function public.staff_save_profile_distinctions(
  actor_id uuid, target_id uuid, new_verified boolean, new_stars smallint,
  new_tier text, professional_review text, expected_updated_at timestamptz, reason text
) returns text language plpgsql security definer set search_path = '' as $$
declare owner_email text; previous public.profile_distinctions%rowtype;
begin
  owner_email := private.require_account_operator(actor_id);
  if new_verified is null or new_stars not between 1 and 5
    or new_tier not in ('gold','emerald','diamond')
    or professional_review not in ('pending_review','verified','rejected')
    or coalesce(char_length(btrim(reason)),0) not between 1 and 1000 then
    raise exception 'Invalid distinction or reason.' using errcode = '22023';
  end if;
  perform 1 from public.profiles where id = target_id for update;
  if not found then return 'missing'; end if;
  select * into previous from public.profile_distinctions where user_id = target_id;
  if previous.updated_at is distinct from expected_updated_at then return 'conflict'; end if;

  if professional_review is not null then
    update public.professional_profiles set verification_status = professional_review
    where user_id = target_id;
    if not found then return 'missing'; end if;
  end if;

  insert into public.profile_distinctions (user_id,verified,stars,tier)
  values (target_id,new_verified,new_stars,new_tier)
  on conflict (user_id) do update set
    verified = excluded.verified, stars = excluded.stars, tier = excluded.tier, updated_at = clock_timestamp();

  insert into public.admin_audit_events (actor_user_id,actor_email,actor_role,action,target_type,target_id,reason)
  values (actor_id,owner_email,'supreme_admin','profile_distinctions_updated','account',target_id::text,
    format('%s [blue tick %s → %s, stars %s → %s, frame %s → %s, professional review %s]', btrim(reason),
      coalesce(previous.verified,false),new_verified,coalesce(previous.stars::text,'none'),coalesce(new_stars::text,'none'),
      coalesce(previous.tier,'automatic'),coalesce(new_tier,'automatic'),coalesce(professional_review,'unchanged')));
  return 'saved';
end;
$$;

create function public.staff_delete_marketplace_account(actor_id uuid, target_id uuid, confirmed_account text, reason text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare owner_email text; target_email text; files jsonb;
begin
  owner_email := private.require_account_operator(actor_id);
  if target_id = actor_id or coalesce(char_length(btrim(reason)),0) not between 1 and 1000 then
    raise exception 'This account cannot be deleted.' using errcode = '42501';
  end if;
  select u.email into target_email from auth.users u where u.id = target_id and u.deleted_at is null for update;
  if not found then return jsonb_build_object('status','missing'); end if;
  if lower(coalesce(target_email, target_id::text)) is distinct from lower(btrim(confirmed_account)) then
    return jsonb_build_object('status','mismatch');
  end if;
  if exists(select 1 from public.admin_staff_directory d
    where d.user_id = target_id or (d.user_id is null and d.email = lower(target_email))) then
    raise exception 'Staff accounts are protected from marketplace deletion.' using errcode = '42501';
  end if;

  select jsonb_agg(to_jsonb(f)) into files from (
    select bucket_id, name from storage.objects
    where owner_id = target_id::text or owner = target_id
    order by bucket_id,name limit 100
  ) f;
  if files is not null then
    if not exists(select 1 from public.admin_audit_events
      where admin_audit_events.action = 'marketplace_deletion_files_started'
        and admin_audit_events.target_id = staff_delete_marketplace_account.target_id::text) then
      insert into public.admin_audit_events (actor_user_id,actor_email,actor_role,action,target_type,target_id,reason)
      values (actor_id,owner_email,'supreme_admin','marketplace_deletion_files_started','account',target_id::text,btrim(reason));
    end if;
    return jsonb_build_object('status','storage','files',files);
  end if;

  delete from auth.users where id = target_id;
  insert into public.admin_audit_events (actor_user_id,actor_email,actor_role,action,target_type,target_id,reason)
  values (actor_id,owner_email,'supreme_admin','marketplace_account_deleted','account',target_id::text,btrim(reason));
  return jsonb_build_object('status','deleted');
end;
$$;

revoke execute on function public.staff_marketplace_accounts(uuid,text,boolean,integer),
 public.staff_save_profile_distinctions(uuid,uuid,boolean,smallint,text,text,timestamptz,text),
 public.staff_delete_marketplace_account(uuid,uuid,text,text) from public, anon, authenticated;
grant execute on function public.staff_marketplace_accounts(uuid,text,boolean,integer),
 public.staff_save_profile_distinctions(uuid,uuid,boolean,smallint,text,text,timestamptz,text),
 public.staff_delete_marketplace_account(uuid,uuid,text,text) to service_role;
