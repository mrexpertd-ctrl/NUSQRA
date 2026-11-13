-- NUSQRA marketplace foundation
create schema if not exists private;

create type public.nusqra_role as enum ('customer', 'professional', 'admin');
create type public.service_status as enum ('draft', 'published', 'paused');
create type public.job_status as enum ('draft', 'open', 'in_progress', 'completed', 'closed', 'cancelled');
create type public.proposal_status as enum ('submitted', 'withdrawn', 'accepted', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  display_name text,
  country_code text check (country_code is null or country_code in ('SA','AE','BH','KW','OM','QA')),
  preferred_language text not null default 'ar' check (preferred_language in ('ar','en')),
  bio text,
  avatar_url text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.nusqra_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name_en text not null unique,
  name_ar text not null unique,
  slug text not null unique,
  description_en text,
  description_ar text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table public.professional_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  headline text,
  about text,
  years_experience integer check (years_experience is null or years_experience between 0 and 60),
  city text,
  country_code text not null check (country_code in ('SA','AE','BH','KW','OM','QA')),
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.services (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null check (char_length(title) between 5 and 140),
  description text not null check (char_length(description) between 20 and 5000),
  price_from numeric(12,2) check (price_from is null or price_from >= 0),
  currency char(3) not null default 'SAR' check (currency in ('SAR','AED','BHD','KWD','OMR','QAR')),
  delivery_days integer check (delivery_days is null or delivery_days between 1 and 365),
  country_code text not null check (country_code in ('SA','AE','BH','KW','OM','QA')),
  status public.service_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null check (char_length(title) between 5 and 160),
  description text not null check (char_length(description) between 20 and 8000),
  budget_min numeric(12,2) check (budget_min is null or budget_min >= 0),
  budget_max numeric(12,2) check (budget_max is null or budget_max >= 0),
  currency char(3) not null default 'SAR' check (currency in ('SAR','AED','BHD','KWD','OMR','QAR')),
  country_code text not null check (country_code in ('SA','AE','BH','KW','OM','QA')),
  city text,
  status public.job_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jobs_budget_range check (budget_min is null or budget_max is null or budget_max >= budget_min)
);
create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  professional_id uuid not null references public.profiles(id) on delete cascade,
  cover_letter text not null check (char_length(cover_letter) between 20 and 5000),
  proposed_price numeric(12,2) check (proposed_price is null or proposed_price >= 0),
  currency char(3) not null default 'SAR' check (currency in ('SAR','AED','BHD','KWD','OMR','QAR')),
  delivery_days integer check (delivery_days is null or delivery_days between 1 and 365),
  status public.proposal_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, professional_id)
);
create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles(id) on delete cascade,
  country_code text not null check (country_code in ('SA','AE','BH','KW','OM','QA')),
  verification_type text not null check (verification_type in ('identity','business','qualification')),
  notes text,
  status text not null default 'pending' check (status in ('pending','under_review','approved','rejected')),
  reviewer_notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewee_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 2000),
  created_at timestamptz not null default now(),
  unique (job_id, reviewer_id),
  check (reviewer_id <> reviewee_id)
);

create index services_public_search_idx on public.services (country_code, category_id, created_at desc) where status = 'published';
create index jobs_open_search_idx on public.jobs (country_code, category_id, created_at desc) where status = 'open';
create index proposals_job_idx on public.proposals (job_id, created_at desc);
create index proposals_professional_idx on public.proposals (professional_id, created_at desc);
create index reviews_reviewee_idx on public.reviews (reviewee_id, created_at desc);
create index verification_requests_professional_idx on public.verification_requests (professional_id, created_at desc);

create function private.set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$ begin new.updated_at := now(); return new; end; $$;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function private.set_updated_at();
create trigger professional_profiles_set_updated_at before update on public.professional_profiles for each row execute function private.set_updated_at();
create trigger services_set_updated_at before update on public.services for each row execute function private.set_updated_at();
create trigger jobs_set_updated_at before update on public.jobs for each row execute function private.set_updated_at();
create trigger proposals_set_updated_at before update on public.proposals for each row execute function private.set_updated_at();

create function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_user_meta_data ->> 'display_name', ''));
  insert into public.user_roles (user_id, role) values (new.id, 'customer');
  return new;
end;
$$;
revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.professional_profiles enable row level security;
alter table public.services enable row level security;
alter table public.jobs enable row level security;
alter table public.proposals enable row level security;
alter table public.verification_requests enable row level security;
alter table public.reviews enable row level security;

create policy "Public profiles or own profile are visible" on public.profiles for select to anon, authenticated using (is_public = true or id = (select auth.uid()));
create policy "Users create their own profile" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy "Users update their own profile" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "Users view their own roles" on public.user_roles for select to authenticated using (user_id = (select auth.uid()));
create policy "Users may add only customer or professional roles to themselves" on public.user_roles for insert to authenticated with check (user_id = (select auth.uid()) and role in ('customer'::public.nusqra_role, 'professional'::public.nusqra_role));

create policy "Active categories are public" on public.categories for select to anon, authenticated using (is_active = true);

create policy "Public professional profiles are visible" on public.professional_profiles for select to anon, authenticated using (is_public = true or user_id = (select auth.uid()));
create policy "Users create their own professional profile" on public.professional_profiles for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'professional'::public.nusqra_role));
create policy "Users update their own professional profile" on public.professional_profiles for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'professional'::public.nusqra_role));

create policy "Published services and own services are visible" on public.services for select to anon, authenticated using (status = 'published'::public.service_status or professional_id = (select auth.uid()));
create policy "Professionals create their own services" on public.services for insert to authenticated with check (professional_id = (select auth.uid()) and exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'professional'::public.nusqra_role));
create policy "Professionals update their own services" on public.services for update to authenticated using (professional_id = (select auth.uid())) with check (professional_id = (select auth.uid()) and exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'professional'::public.nusqra_role));
create policy "Professionals delete their own services" on public.services for delete to authenticated using (professional_id = (select auth.uid()) and exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'professional'::public.nusqra_role));

create policy "Open jobs and own jobs are visible" on public.jobs for select to anon, authenticated using (status = 'open'::public.job_status or customer_id = (select auth.uid()));
create policy "Customers create their own jobs" on public.jobs for insert to authenticated with check (customer_id = (select auth.uid()) and exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'customer'::public.nusqra_role));
create policy "Customers update their own jobs" on public.jobs for update to authenticated using (customer_id = (select auth.uid())) with check (customer_id = (select auth.uid()) and exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'customer'::public.nusqra_role));

create policy "Proposal visible only to professional and job owner" on public.proposals for select to authenticated using (professional_id = (select auth.uid()) or exists (select 1 from public.jobs j where j.id = job_id and j.customer_id = (select auth.uid())));
create policy "Professionals submit proposals to open jobs" on public.proposals for insert to authenticated with check (professional_id = (select auth.uid()) and exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'professional'::public.nusqra_role) and exists (select 1 from public.jobs j where j.id = job_id and j.status = 'open'::public.job_status and j.customer_id <> (select auth.uid())));

create policy "Professionals view their own verification requests" on public.verification_requests for select to authenticated using (professional_id = (select auth.uid()));
create policy "Professionals submit pending verification requests" on public.verification_requests for insert to authenticated with check (professional_id = (select auth.uid()) and status = 'pending' and reviewer_notes is null and reviewed_at is null and exists (select 1 from public.user_roles ur where ur.user_id = (select auth.uid()) and ur.role = 'professional'::public.nusqra_role));

create policy "Reviews are public" on public.reviews for select to anon, authenticated using (true);
create policy "Customers review professionals after completed accepted work" on public.reviews for insert to authenticated with check (
  reviewer_id = (select auth.uid()) and exists (
    select 1 from public.jobs j join public.proposals p on p.job_id = j.id
    where j.id = job_id and j.customer_id = (select auth.uid()) and j.status = 'completed'::public.job_status
      and p.professional_id = reviewee_id and p.status = 'accepted'::public.proposal_status
  )
);

grant select on public.categories to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant select on public.user_roles to authenticated;
grant insert on public.user_roles to authenticated;
grant select on public.professional_profiles to anon, authenticated;
grant insert, update on public.professional_profiles to authenticated;
grant select on public.services to anon, authenticated;
grant insert, update, delete on public.services to authenticated;
grant select on public.jobs to anon, authenticated;
grant insert, update on public.jobs to authenticated;
grant select, insert, update on public.proposals to authenticated;
grant select, insert on public.verification_requests to authenticated;
grant select on public.reviews to anon, authenticated;
grant insert on public.reviews to authenticated;

insert into public.categories (name_en, name_ar, slug, sort_order) values
('Web & Technology','الويب والتقنية','web-technology',1),
('Design & Creative','التصميم والإبداع','design-creative',2),
('Marketing & Sales','التسويق والمبيعات','marketing-sales',3),
('Business Services','خدمات الأعمال','business-services',4),
('Automotive Services','خدمات السيارات','automotive-services',5),
('Education & Training','التعليم والتدريب','education-training',6),
('Home & Maintenance','المنزل والصيانة','home-maintenance',7),
('Writing & Translation','الكتابة والترجمة','writing-translation',8);
