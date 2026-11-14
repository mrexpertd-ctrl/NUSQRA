-- Server-only aggregate RPC for the NUSQRA admin Overview dashboard.
create or replace function public.admin_live_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_today date := (now() at time zone 'Asia/Riyadh')::date;
  v_today_start timestamptz := ((now() at time zone 'Asia/Riyadh')::date::timestamp at time zone 'Asia/Riyadh');
  v_week_start timestamptz := (((now() at time zone 'Asia/Riyadh')::date - 6)::timestamp at time zone 'Asia/Riyadh');
  v_install_total bigint;
  v_install_today bigint;
  v_install_week bigint;
  v_task_total bigint;
  v_task_today bigint;
  v_task_week bigint;
  v_install_chart jsonb;
  v_task_chart jsonb;
  v_feed jsonb;
begin
  select count(*) into v_install_total from public.app_installs;
  select count(*) into v_install_today from public.app_installs where installed_at >= v_today_start;
  select count(*) into v_install_week from public.app_installs where installed_at >= v_week_start;

  select count(*) into v_task_total from public.jobs where status = 'completed';
  select count(*) into v_task_today from public.jobs where status = 'completed' and completed_at >= v_today_start;
  select count(*) into v_task_week from public.jobs where status = 'completed' and completed_at >= v_week_start;

  select coalesce(jsonb_agg(jsonb_build_object('label',to_char(d.day,'DD Mon'),'count',coalesce(x.total,0)) order by d.day),'[]'::jsonb)
  into v_install_chart
  from generate_series(0,6) as n(i)
  cross join lateral (select (v_today - 6 + n.i)::date as day) d
  left join lateral (
    select count(*) as total from public.app_installs i
    where i.installed_at >= (d.day::timestamp at time zone 'Asia/Riyadh')
      and i.installed_at < ((d.day + 1)::timestamp at time zone 'Asia/Riyadh')
  ) x on true;

  select coalesce(jsonb_agg(jsonb_build_object('label',to_char(d.day,'DD Mon'),'count',coalesce(x.total,0)) order by d.day),'[]'::jsonb)
  into v_task_chart
  from generate_series(0,6) as n(i)
  cross join lateral (select (v_today - 6 + n.i)::date as day) d
  left join lateral (
    select count(*) as total from public.jobs j
    where j.status = 'completed'
      and j.completed_at >= (d.day::timestamp at time zone 'Asia/Riyadh')
      and j.completed_at < ((d.day + 1)::timestamp at time zone 'Asia/Riyadh')
  ) x on true;

  select coalesce(jsonb_agg(jsonb_build_object('type',e.event_type,'at',e.event_at) order by e.event_at desc),'[]'::jsonb)
  into v_feed
  from (
    (select 'New install'::text as event_type, i.installed_at as event_at
     from public.app_installs i order by i.installed_at desc limit 10)
    union all
    (select 'Task completed'::text as event_type, c.completed_at as event_at
     from public.job_completion_events c order by c.completed_at desc limit 10)
  ) e;

  return jsonb_build_object(
    'installs',jsonb_build_object('total',v_install_total,'today',v_install_today,'last_7_days',v_install_week,'chart',v_install_chart),
    'completed_tasks',jsonb_build_object('total',v_task_total,'today',v_task_today,'last_7_days',v_task_week,'chart',v_task_chart),
    'feed',v_feed,
    'updated_at',v_now
  );
end;
$$;
revoke all on function public.admin_live_stats() from public, anon, authenticated;
grant execute on function public.admin_live_stats() to service_role;
comment on function public.admin_live_stats() is 'Server-only aggregate for staff-authorized NUSQRA dashboard. Returns aggregate counts and event timestamps only; never returns personal data.';
