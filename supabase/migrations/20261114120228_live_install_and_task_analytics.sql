-- NUSQRA live install and completed-task analytics.
-- The existing public.jobs table already has job_status including 'completed'.
-- completed_at records the actual transition time going forward; unknown historical
-- completion times are deliberately left NULL rather than inferred.

create table if not exists private.app_install_endpoint_secret (
  id boolean primary key default true check (id = true),
  secret_value text not null,
  created_at timestamptz not null default now()
);
revoke all on private.app_install_endpoint_secret from public, anon, authenticated;

create table if not exists public.app_installs (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null unique,
  installed_at timestamptz not null default now(),
  platform text not null check (platform in ('Android','iOS','Windows','macOS','Linux','ChromeOS','Unknown')),
  user_id uuid references auth.users(id) on delete set null
);
create index if not exists app_installs_installed_at_idx on public.app_installs(installed_at desc);
alter table public.app_installs enable row level security;
revoke all on public.app_installs from anon, authenticated;
grant select on public.app_installs to authenticated;

create or replace function private.is_admin_analytics_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
    and coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
    and exists (
      select 1
      from public.admin_staff_directory s
      where s.user_id = auth.uid()
        and s.status = 'active'
        and s.staff_role in ('supreme_admin','admin')
    );
$$;
revoke all on function private.is_admin_analytics_staff() from public, anon;
grant execute on function private.is_admin_analytics_staff() to authenticated;

drop policy if exists app_installs_admin_analytics_read on public.app_installs;
create policy app_installs_admin_analytics_read
on public.app_installs for select to authenticated
using (private.is_admin_analytics_staff());

create or replace function public.record_app_install(
  p_device_id uuid,
  p_platform text,
  p_user_id uuid,
  p_secret text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_rows integer;
begin
  if p_secret is null or not exists (
    select 1 from private.app_install_endpoint_secret s
    where s.id = true and s.secret_value = p_secret
  ) then
    raise exception 'Unauthorized install tracking request' using errcode = '42501';
  end if;
  if p_device_id is null then
    raise exception 'A valid device UUID is required' using errcode = '22023';
  end if;
  if p_platform not in ('Android','iOS','Windows','macOS','Linux','ChromeOS','Unknown') then
    raise exception 'Unsupported platform' using errcode = '22023';
  end if;
  if p_user_id is not null and not exists (select 1 from auth.users u where u.id = p_user_id) then
    p_user_id := null;
  end if;

  insert into public.app_installs(device_id, platform, user_id)
  values (p_device_id, p_platform, p_user_id)
  on conflict (device_id) do nothing;

  get diagnostics inserted_rows = row_count;
  return inserted_rows = 1;
end;
$$;
revoke all on function public.record_app_install(uuid,text,uuid,text) from public, authenticated;
grant execute on function public.record_app_install(uuid,text,uuid,text) to anon;

alter table public.jobs add column if not exists completed_at timestamptz;
create index if not exists jobs_completed_at_idx on public.jobs(completed_at desc) where status = 'completed';

create table if not exists public.job_completion_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  completed_at timestamptz not null default now()
);
create index if not exists job_completion_events_completed_at_idx on public.job_completion_events(completed_at desc);
alter table public.job_completion_events enable row level security;
revoke all on public.job_completion_events from anon, authenticated;
grant select on public.job_completion_events to authenticated;

drop policy if exists job_completion_events_admin_analytics_read on public.job_completion_events;
create policy job_completion_events_admin_analytics_read
on public.job_completion_events for select to authenticated
using (private.is_admin_analytics_staff());

create or replace function private.set_job_completed_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'completed' then
    if tg_op = 'INSERT' or old.status is distinct from 'completed' then
      new.completed_at := now();
    else
      new.completed_at := old.completed_at;
    end if;
  else
    new.completed_at := null;
  end if;
  return new;
end;
$$;
revoke all on function private.set_job_completed_at() from public, anon, authenticated;
drop trigger if exists jobs_set_completed_at on public.jobs;
create trigger jobs_set_completed_at
before insert or update of status on public.jobs
for each row execute function private.set_job_completed_at();

create or replace function private.emit_job_completion_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'completed' and (tg_op = 'INSERT' or old.status is distinct from 'completed') then
    insert into public.job_completion_events(job_id, completed_at)
    values (new.id, coalesce(new.completed_at, now()));
  end if;
  return new;
end;
$$;
revoke all on function private.emit_job_completion_event() from public, anon, authenticated;
drop trigger if exists jobs_emit_completion_event on public.jobs;
create trigger jobs_emit_completion_event
after insert or update of status on public.jobs
for each row execute function private.emit_job_completion_event();

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'app_installs'
  ) then
    alter publication supabase_realtime add table public.app_installs;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'job_completion_events'
  ) then
    alter publication supabase_realtime add table public.job_completion_events;
  end if;
end;
$$;

comment on table public.app_installs is 'PWA installs recorded once per browser device UUID. No names, emails, or device fingerprints are stored.';
comment on table public.job_completion_events is 'Minimal realtime events emitted when a NUSQRA job/request transitions to completed; contains no personal details.';
comment on column public.jobs.completed_at is 'Timestamp of the latest transition into completed; NULL when not currently completed or for legacy rows with unknown completion time.';
