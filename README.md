# NUSQRA | نُسقرا

NUSQRA is a bilingual (Arabic/English) Gulf-focused marketplace connecting customers, independent professionals, and businesses. The first release is a **connection marketplace**: customers and professionals arrange payment independently. NUSQRA does not collect, hold, split, or pay out funds in this release.

## Current implementation status

### Frontend
- React 19 + Vite 6 starter website in `nusqra-starter/`
- Arabic/English interface and RTL layout
- Responsive marketing homepage and prototype account screens
- Authentication and live marketplace UI are not yet connected

### Backend development project
- Supabase project: `nusqra-development`
- Project reference: `oybodlncqgerucwwkqvp`
- Region: Singapore
- PostgreSQL 17
- Development project only; do not store real customer identity documents or sensitive personal data here.

### Database foundation deployed
- Profiles and user roles
- Gulf country-aware professional profiles
- Bilingual service categories
- Services and job listings
- Proposals
- Verification request workflow (metadata only; no identity documents stored)
- Reviews
- Job-based conversations and messages

All 11 public tables have Row Level Security enabled. Public browsing is limited to published services, open jobs, public profiles, active categories, and reviews. Proposals and conversations are restricted to their relevant users. Admin role assignment is not self-service.

## Database migrations

Applied to the development project and committed under `supabase/migrations/`:

1. `20261113105643_nusqra_marketplace_foundation.sql`
2. `20261113105658_tighten_marketplace_permissions_and_indexes.sql`
3. `20261113105754_add_secure_job_conversations_and_messages.sql`

The SQL migrations are the source-controlled record of the database foundation. Apply them to a separate environment only after reviewing the environment and migration history.

## Local frontend development

```bash
cd nusqra-starter
npm install
npm run dev
```

Build the frontend:

```bash
npm run build
```

## Not yet implemented

- Supabase client connection and working email registration/sign-in
- Marketplace search and listing screens connected to live data
- Job posting, proposal submission and acceptance workflow in the UI
- Messaging UI and realtime updates
- Admin review console and server-enforced admin permissions
- File storage, notification delivery, abuse reporting and moderation
- Domain, hosting and production deployment
- Legal/business registration, country-by-country launch review, privacy notice and terms

## Security and launch notes

- Never commit Supabase secret/service-role keys. Only a publishable key may be used in browser code.
- Keep all real customer information out of this development project until Saudi PDPL, international data transfer requirements, hosting location and retention controls have been assessed.
- Verification documents must not be uploaded until private storage buckets, access policies, retention and reviewer access are implemented.
- NUSQRA does not process customer payments in the first release.
- Do not treat the prototype staff-access entry as a protected admin system.
- Production readiness requires functional tests, RLS testing with separate test accounts, dependency/secret scanning, backups, monitoring and a legal review for each launch country.
