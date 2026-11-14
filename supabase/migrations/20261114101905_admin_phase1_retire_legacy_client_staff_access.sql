-- Remove legacy browser-side staff access; admin staff will use the isolated Worker.
drop policy if exists "Users and staff can view account controls" on public.account_controls;
create policy "Users can view own account controls" on public.account_controls
for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Super admins can read audit log" on public.admin_audit_log;
revoke all on public.admin_audit_log from anon, authenticated;
drop policy if exists "Super admins and Class 2 admins review moderation cases" on public.moderation_cases;
drop policy if exists "Super admins and Class 2 admins update moderation cases" on public.moderation_cases;
drop policy if exists "Admins can view professional categories" on public.professional_categories;
drop policy if exists "Staff can view professional category mappings" on public.professional_categories;
drop policy if exists "Admins review professional credentials" on public.professional_credentials;
drop policy if exists "Super admins and moderators read credentials" on public.professional_credentials;
drop policy if exists "Super admins and moderators update credential review" on public.professional_credentials;
drop policy if exists "Professionals view own credentials" on public.professional_credentials;
create policy "Professionals view own credentials" on public.professional_credentials
for select to authenticated using (professional_user_id = (select auth.uid()));
drop policy if exists "Admins moderate portfolio" on public.professional_portfolio;
drop policy if exists "Staff can view professional portfolio" on public.professional_portfolio;
drop policy if exists "Staff review portfolio case studies" on public.professional_portfolio;
drop policy if exists "Admins can review professional profiles" on public.professional_profiles;
drop policy if exists "Admins update professional verification" on public.professional_profiles;
drop policy if exists "Super admins and moderators review professional profiles" on public.professional_profiles;
drop policy if exists "Super admins and moderators update professional verification" on public.professional_profiles;
drop policy if exists "Staff can review profile records" on public.profiles;
drop policy if exists "Staff can view own staff role or super admins view all" on public.staff_roles;
revoke all on public.staff_roles from anon, authenticated;
drop policy if exists "Ticket owner and support staff send support messages" on public.support_messages;
drop policy if exists "Ticket participants and support moderators read messages" on public.support_messages;
create policy "Ticket owners send public support messages" on public.support_messages
for insert to authenticated with check (
  sender_id = (select auth.uid()) and is_internal_note = false
  and exists (select 1 from public.support_tickets t where t.id = support_messages.ticket_id and t.requester_id = (select auth.uid()))
);
create policy "Ticket owners read public support messages" on public.support_messages
for select to authenticated using (
  is_internal_note = false
  and exists (select 1 from public.support_tickets t where t.id = support_messages.ticket_id and t.requester_id = (select auth.uid()))
);
drop policy if exists "Only moderators and super admins update support tickets" on public.support_tickets;
drop policy if exists "Requester or support moderators can view tickets" on public.support_tickets;
create policy "Requesters can view own support tickets" on public.support_tickets
for select to authenticated using (requester_id = (select auth.uid()));
