alter table public.messages
add constraint messages_body_length_check
check (char_length(body) between 1 and 4000);
