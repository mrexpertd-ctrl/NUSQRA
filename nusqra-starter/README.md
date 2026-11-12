# NUSQRA — First website prototype

A responsive React/Vite frontend for NUSQRA, a Saudi-first services marketplace.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite. To make a production bundle run `npm run build`.

## Included
- Responsive premium homepage (emerald, purple, gold, smoke black)
- Arabic/English language toggle with RTL layout
- Feature overview, marketplace flow, professional subscription introduction
- Interactive Super Admin **demo** dashboard using clearly marked example numbers

## Not yet implemented
- Authentication, user registration, persistent data, jobs, bids, payments, verification, actual admin authorization, API integrations, mobile apps.
- Logo is a temporary typographic treatment; the selected promotional art has not been bundled.
- The Neon project is separate; this frontend does **not** connect to it yet.

## Deployment
Connect this source to a new frontend service after placing it in a repository you control. Build: `npm install && npm run build`; output: `dist` for static hosting.

## Security
Do not treat this dashboard as a protected admin interface. It is only a visual preview and contains no private data.
