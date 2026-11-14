# NUSQRA Administration — Phase 1

Independent Cloudflare Worker application. It is not part of the public NUSQRA frontend.

## Phase 1 features
- Separate Worker and static bundle.
- Supabase Auth email/password sign-in.
- Mandatory TOTP: the Worker rejects every request unless Supabase verifies AAL2.
- Staff roles: supreme_admin, admin, moderator.
- Supreme Admin bootstrap by SUPREME_ADMIN_EMAIL secret; no password stored by this app.
- Supreme-only staff invitations; role fixed at invitation.
- Maximum three Admin seats and exactly one Supreme Admin enforced in PostgreSQL.
- Append-only audit events with IP, user agent, actor, action, target and reason.
- 30-minute inactivity timeout on Worker-authenticated requests.
- noindex/nofollow/noarchive and security headers on every response.
- Dark mobile-first interface.

## Required secrets
From this directory, run:
```sh
npx wrangler secret put SUPREME_ADMIN_EMAIL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put SUPABASE_ANON_KEY
```
Paste each value only into Wrangler's interactive terminal prompt. Never place secrets in Git, chat, source files, or frontend environment variables.

The SUPABASE_URL is the project URL in wrangler.jsonc and is not secret.

## Deploy
```sh
cd admin-dashboard
npm install
npm run build
npx wrangler deploy
```

The initial Worker uses its isolated workers.dev hostname. To attach admin.example.com later, configure a Cloudflare zone you control and add a custom domain in this Worker’s Domains & Routes settings or add a custom_domain route to wrangler.jsonc. Cloudflare Access can then be enabled for that hostname.

## Important setup notes
1. Enable TOTP MFA in Supabase Auth settings. The Worker enforces AAL2 for every protected API route.
2. Set SUPREME_ADMIN_EMAIL to the owner's exact email. On first dashboard visit, the Worker reserves the unique Supreme Admin seat and sends a Supabase invitation. If the email already has an Auth user, that account is authorized instead.
3. Open the invitation link on the separate Worker hostname. New invitees set their own password in the dashboard, then enroll and verify TOTP. The application never stores or logs passwords.
4. Invite Admins and Moderators from the Supreme Admin dashboard. Supabase sends the invite email. Their role is stored server-side and cannot be chosen by the invitee.
5. Admin API database tables are inaccessible to anon/authenticated roles; the Worker uses the service-role secret only on the server.

## Phase 1 limitations / follow-up hardening
- Email delivery depends on configured Supabase Auth SMTP.
- Idle expiry is checked on authenticated API calls; Supabase JWT expiry remains the hard upper bound.
- Cloudflare zone was not present in the connected account when this was created, so the custom admin hostname cannot yet be attached. Use workers.dev until a zone is available.
- TOTP must be enabled in the Supabase project Auth configuration before production access.
