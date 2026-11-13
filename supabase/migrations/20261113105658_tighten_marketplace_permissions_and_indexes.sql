-- Harden proposal and verification writes; add foreign-key indexes.
drop policy "Professionals may withdraw their submitted proposals" on public.proposals;
revoke update on public.proposals from authenticated;

drop policy "Professionals submit verification requests" on public.verification_requests;
create policy "Professionals submit pending verification requests"
on public.verification_requests for insert to authenticated
with check (
  professional_id = (select auth.uid())
  and status = 'pending'
  and reviewer_notes is null
  and reviewed_at is null
  and exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role = 'professional'::public.nusqra_role
  )
);
revoke all privileges on table public.verification_requests from authenticated;
grant select on public.verification_requests to authenticated;
grant insert (professional_id, country_code, verification_type, notes)
on public.verification_requests to authenticated;

create index jobs_category_id_idx on public.jobs(category_id);
create index jobs_customer_id_idx on public.jobs(customer_id);
create index reviews_reviewer_id_idx on public.reviews(reviewer_id);
create index services_category_id_idx on public.services(category_id);
create index services_professional_id_idx on public.services(professional_id);
