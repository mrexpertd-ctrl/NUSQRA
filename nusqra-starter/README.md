# NUSQRA — Website prototype

Responsive React/Vite frontend for the NUSQRA Gulf marketplace.

## Run locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Included
- Responsive bilingual (Arabic/English) homepage with RTL layout
- Marketplace positioning and professional growth information
- Prototype login and registration dialogs (not connected to authentication yet)

## Backend status

The development database is Supabase project `nusqra-development`. Its schema and migrations are maintained in the repository at `../supabase/migrations/`.

The frontend does not yet connect to Supabase. Authentication, live profiles, services, job listings, proposals and messaging UI remain to be implemented.

## First-release payment model

NUSQRA connects customers and professionals. They arrange payment independently; the platform does not collect or distribute payments in the first release.

## Security notes

- Do not add a Supabase service-role or secret key to frontend code.
- Use only a publishable key in browser code, supplied through local environment variables.
- Keep real customer data out of the development database until privacy, cross-border transfer and hosting requirements are reviewed.
- The staff-access link is a prototype only, not a secured admin portal.
