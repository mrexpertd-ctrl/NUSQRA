-- NUSQRA administration Phase 1: isolated staff identities, sessions and immutable audit.
create table if not exists public.admin_staff_directory (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  user_id uuid unique references auth.users(id) on delete set null,
  staff_role text not null check (staff_role in ('supreme_admin','admin','moderator')),
  status text not null default 'invited' check (status in ('invited','active','suspended','removed')),
  invited_by uuid references auth.users(id) on delete set null,
  invited_at timestamptz not null default now(),
  activated_at timestamptz,
  updated_at timestamptz not null default now()
);
create unique index if not exists admin_staff_one_supreme on public.admin_staff_directory ((staff_role)) where staff_role='supreme_admin' and status in ('invited','active');
create index if not exists admin_staff_role_status_idx on public.admin_staff_directory(staff_role,status);
create or replace function public.enforce_admin_staff_seats()
returns trigger language plpgsql set search_path='' as $$
declare admin_count integer;
begin
  perform pg_advisory_xact_lock(hashtext('nusqra_admin_staff_seats'));
  if new.staff_role='admin' and new.status in ('invited','active') then
    select count(*) into admin_count from public.admin_staff_directory
      where staff_role='admin' and status in ('invited','active')
      and id is distinct from new.id;
    if admin_count >= 3 then
      raise exception 'Maximum of three Admin seats reached' using errcode='23514';
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists admin_staff_seat_guard on public.admin_staff_directory;
create trigger admin_staff_seat_guard before insert or update of staff_role,status
on public.admin_staff_directory for each row execute function public.enforce_admin_staff_seats();
create table if not exists public.admin_sessions (
  session_id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
create index if not exists admin_sessions_user_idx on public.admin_sessions(user_id);
create table if not exists public.admin_audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_email text not null,
  actor_role text not null check (actor_role in ('supreme_admin','admin','moderator')),
  action text not null,
  target_type text,
  target_id text,
  reason text,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists admin_audit_events_created_idx on public.admin_audit_events(created_at desc);
create index if not exists admin_audit_events_actor_idx on public.admin_audit_events(actor_user_id,created_at desc);
create or replace function public.reject_admin_audit_mutation()
returns trigger language plpgsql set search_path='' as $$
begin
  raise exception 'Admin audit events are append-only' using errcode='42501';
end; $$;
drop trigger if exists admin_audit_no_update on public.admin_audit_events;
create trigger admin_audit_no_update before update or delete on public.admin_audit_events
for each row execute function public.reject_admin_audit_mutation();
drop trigger if exists admin_audit_no_truncate on public.admin_audit_events;
create trigger admin_audit_no_truncate before truncate on public.admin_audit_events
for each statement execute function public.reject_admin_audit_mutation();
alter table public.admin_staff_directory enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.admin_audit_events enable row level security;
revoke all on public.admin_staff_directory, public.admin_sessions, public.admin_audit_events from anon, authenticated;
grant all on public.admin_staff_directory, public.admin_sessions, public.admin_audit_events to service_role;
grant usage, select on sequence public.admin_audit_events_id_seq to service_role;
