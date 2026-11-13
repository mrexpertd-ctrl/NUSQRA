create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz,
  unique (job_id, customer_id, professional_id),
  check (customer_id <> professional_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);

create index conversations_customer_idx on public.conversations(customer_id, last_message_at desc);
create index conversations_professional_idx on public.conversations(professional_id, last_message_at desc);
create index messages_conversation_created_idx on public.messages(conversation_id, created_at);

create function private.touch_conversation_after_message()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
  return new;
end;
$$;
revoke all on function private.touch_conversation_after_message() from public, anon, authenticated;
create trigger message_updates_conversation after insert on public.messages
for each row execute function private.touch_conversation_after_message();

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Conversation participants can view" on public.conversations for select to authenticated
using (customer_id = (select auth.uid()) or professional_id = (select auth.uid()));

create policy "Customer may open conversation with a professional who bid" on public.conversations for insert to authenticated
with check (
  customer_id = (select auth.uid())
  and exists (
    select 1 from public.jobs j join public.proposals p on p.job_id = j.id
    where j.id = job_id and j.customer_id = (select auth.uid())
      and p.professional_id = professional_id
      and p.status in ('submitted'::public.proposal_status, 'accepted'::public.proposal_status)
  )
);

create policy "Conversation participants can read messages" on public.messages for select to authenticated
using (exists (
  select 1 from public.conversations c where c.id = conversation_id
    and (c.customer_id = (select auth.uid()) or c.professional_id = (select auth.uid()))
));

create policy "Participants can send messages" on public.messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1 from public.conversations c where c.id = conversation_id
      and (c.customer_id = (select auth.uid()) or c.professional_id = (select auth.uid()))
  )
);

grant select, insert on public.conversations to authenticated;
grant select, insert on public.messages to authenticated;
