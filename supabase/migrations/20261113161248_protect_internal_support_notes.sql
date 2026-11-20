-- Prevent ticket customers from reading or creating internal support notes.
drop policy if exists "Ticket participants and support moderators read messages"
  on public.support_messages;
create policy "Ticket participants and support moderators read messages"
  on public.support_messages
  for select to authenticated
  using (
    (
      not is_internal_note
      and exists (
        select 1 from public.support_tickets t
        where t.id = support_messages.ticket_id
          and t.requester_id = (select auth.uid())
      )
    )
    or private.has_staff_role(array['super_admin','moderator'])
  );

drop policy if exists "Ticket owner and support staff send support messages"
  on public.support_messages;
create policy "Ticket owner and support staff send support messages"
  on public.support_messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and (
      (
        not is_internal_note
        and exists (
          select 1 from public.support_tickets t
          where t.id = support_messages.ticket_id
            and t.requester_id = (select auth.uid())
        )
      )
      or private.has_staff_role(array['super_admin','moderator'])
    )
  );
