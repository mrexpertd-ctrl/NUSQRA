-- Applied and verified on nusqra-development Supabase project on 2026-11-14.
-- Additive Phase A foundation. Existing data and admin tables preserved.
alter table public.jobs
  add column if not exists budget_type text,
  add column if not exists deadline date,
  add column if not exists is_remote boolean not null default false,
  add column if not exists content_language text not null default 'ar';

alter table public.proposals
  add column if not exists content_language text not null default 'ar';

alter table public.jobs
  add constraint jobs_phase_a_budget_type_valid
    check (budget_type is null or budget_type in ('fixed','hourly')),
  add constraint jobs_phase_a_content_language_valid
    check (content_language in ('ar','en'));

alter table public.proposals
  add constraint proposals_phase_a_content_language_valid
    check (content_language in ('ar','en'));

create unique index proposals_one_accepted_per_job_idx
  on public.proposals(job_id)
  where status='accepted'::public.proposal_status;

create index jobs_open_deadline_idx
  on public.jobs(deadline,created_at desc)
  where status='open'::public.job_status;
