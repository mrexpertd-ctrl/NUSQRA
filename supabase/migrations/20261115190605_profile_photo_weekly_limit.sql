alter table public.profiles
  add column if not exists avatar_changed_at timestamptz;

create or replace function public.enforce_profile_photo_weekly_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.avatar_url is distinct from old.avatar_url then
    if auth.uid() = old.id
      and old.avatar_url is not null
      and old.avatar_changed_at is not null
      and old.avatar_changed_at > statement_timestamp() - interval '7 days' then
      raise exception using
        errcode = 'P0001',
        message = 'Profile photo can only be changed once every 7 days';
    end if;

    new.avatar_changed_at := statement_timestamp();
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_profile_photo_weekly_limit() from public, anon, authenticated;

drop trigger if exists enforce_profile_photo_weekly_limit on public.profiles;
create trigger enforce_profile_photo_weekly_limit
before update of avatar_url on public.profiles
for each row
execute function public.enforce_profile_photo_weekly_limit();
