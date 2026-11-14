-- Explicitly deny browser roles access to the isolated administration data.
drop policy if exists admin_staff_deny_client_access on public.admin_staff_directory;
create policy admin_staff_deny_client_access on public.admin_staff_directory
for all to anon, authenticated using (false) with check (false);
drop policy if exists admin_sessions_deny_client_access on public.admin_sessions;
create policy admin_sessions_deny_client_access on public.admin_sessions
for all to anon, authenticated using (false) with check (false);
drop policy if exists admin_audit_deny_client_access on public.admin_audit_events;
create policy admin_audit_deny_client_access on public.admin_audit_events
for all to anon, authenticated using (false) with check (false);
