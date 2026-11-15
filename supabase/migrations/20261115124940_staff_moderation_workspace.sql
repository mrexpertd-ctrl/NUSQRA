create or replace function public.staff_write_moderation_case(
  actor_id uuid,
  operation text,
  details text,
  case_id uuid,
  expected_updated_at timestamptz,
  new_case_type text,
  new_target_id uuid,
  client_ip inet,
  client_agent text
) returns text
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  actor public.admin_staff_directory%rowtype;
  saved_case_id uuid;
  reason text := btrim(details);
  required_status text;
  event_action text;
begin
  select * into actor
  from public.admin_staff_directory
  where user_id = actor_id and status = 'active'
  for share;

  if not found or actor.staff_role not in ('supreme_admin', 'admin', 'moderator') then
    return 'forbidden';
  end if;

  if reason is null or length(reason) not between 1 and 2000 then
    raise exception 'Invalid case details' using errcode = '22023';
  end if;

  case operation
    when 'create' then
      if new_case_type is null or new_case_type not in ('account', 'content', 'project', 'other') then
        raise exception 'Invalid case type' using errcode = '22023';
      end if;
      insert into public.moderation_cases (case_type, description, target_user_id)
      values (new_case_type, reason, new_target_id)
      returning id into saved_case_id;
      event_action := 'moderation_case_created';
    when 'investigating', 'actioned', 'dismissed' then
      if operation in ('actioned', 'dismissed') and actor.staff_role = 'moderator' then
        return 'forbidden';
      end if;

      required_status := case when operation = 'investigating' then 'open' else 'investigating' end;
      update public.moderation_cases
      set status = operation,
          assigned_to = coalesce(assigned_to, actor_id),
          resolution_note = case when operation = 'investigating' then null else reason end,
          updated_at = clock_timestamp()
      where id = case_id and status = required_status and updated_at = expected_updated_at
      returning id into saved_case_id;

      if not found then
        return 'conflict';
      end if;
      event_action := 'moderation_case_' || operation;
    else
      raise exception 'Invalid moderation action' using errcode = '22023';
  end case;

  insert into public.admin_audit_events
    (actor_user_id, actor_email, actor_role, action, target_type, target_id, reason, ip_address, user_agent)
  values
    (actor_id, actor.email, actor.staff_role, event_action, 'moderation_case', saved_case_id::text,
     case when operation = 'create' then null else reason end, client_ip, client_agent);

  return 'ok';
end;
$function$;

revoke all on function public.staff_write_moderation_case(uuid, text, text, uuid, timestamptz, text, uuid, inet, text)
  from public, anon, authenticated;
grant execute on function public.staff_write_moderation_case(uuid, text, text, uuid, timestamptz, text, uuid, inet, text)
  to service_role;
