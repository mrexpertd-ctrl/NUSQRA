# NUSQRA — bilingual Gulf services marketplace

Responsive React/Vite frontend connected to the NUSQRA Supabase development project.

## Run locally

```bash
npm install
cp .env.example .env.local
# Add the Supabase publishable key to .env.local
npm run dev
```

Build:

```bash
npm run build
```

## Supabase configuration

Set these Vite environment variables in local development and your hosting provider:

- `VITE_SUPABASE_URL` — project URL.
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase publishable key (or legacy anon key while migrating).

The browser client must use only a publishable/anon key. Never put a service-role or secret key in Vite variables, frontend files, GitHub commits, or browser code.

In Supabase Dashboard → Authentication → URL Configuration, set the Site URL to the exact frontend URL you are testing. For local Vite testing, use `http://localhost:5173`; add `http://localhost:5173/**` to the Redirect URLs allow list. When a real domain is selected, replace the Site URL with that domain and add its callback/redirect paths as well.

## Accounts

- Email/password registration and sign-in through Supabase Auth.
- Customer accounts are created by the database signup trigger.
- Professional registration also creates the professional role and professional profile.
- Signed-in users can edit their own basic profile; professionals can edit their professional details.
- Email confirmation may be required depending on the Supabase Auth project settings.
- Password reset, phone OTP, social login, admin/staff portal, and MFA are not part of this first account release.

## Data and launch notes

The Supabase database migrations are in `../supabase/migrations/`. Keep real customer data out of development until privacy, Saudi PDPL, and cross-border transfer requirements have been reviewed. Singapore is the current development database region.

## First-release payment model

NUSQRA connects customers and professionals. They arrange payment independently; the platform does not collect or distribute payments in the first release.

## Marketplace actions

- Customers can publish open jobs with a category, description, optional budget range, currency, and city.
- Professionals can browse open jobs and submit one proposal per job with a cover letter, optional price, and delivery estimate.
- Customers can review proposals submitted to their own job posts.
- Database Row Level Security enforces customer ownership, professional role membership, open-job eligibility, and one proposal per professional per job.
- Payments remain independently arranged between customers and professionals; this release does not collect or hold funds.
