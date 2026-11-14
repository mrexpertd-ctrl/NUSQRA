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
The public Supabase anon key and project URL are configured as non-secret Worker variables. Keep only the service-role key and Supreme Admin email as Worker secrets. From this directory, run:
```sh
npx wrangler login
npx wrangler secret put SUPREME_ADMIN_EMAIL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```
Each command prompts locally. Enter the value only into that terminal prompt. Do not paste it into ChatGPT or commit it.
Paste each value only into Wrangler's interactive terminal prompt. Never place secrets in Git, chat, source files, or frontend environment variables.

The SUPABASE_URL is the project URL in wrangler.jsonc and is not secret.

## Deploy
```sh
cd admin-dashboard
npm install
npm run build
npx wrangler deploy
```

The initial Worker uses its isolated workers.dev hostname. Wrangler prints the exact URL after deployment. Before opening that URL for the first time, add it to Supabase Authentication → URL Configuration → Redirect URLs (include the Worker URL with /**). This ensures invitation links return to the private dashboard rather than the public site. Confirm Supabase Auth email delivery/SMTP is configured. To attach admin.example.com later, first add a domain zone to this Cloudflare account, then add a custom domain in the Worker’s Domains & Routes settings. Cloudflare Access can then be enabled for that hostname.

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


## Phase 1 role acceptance tests
After secrets, TOTP and deployment are configured:

- **Supreme Admin:** sign in, complete TOTP, view staff list and audit events, invite Admin/Moderator, change staff role, suspend/remove staff. Verify Admin seats display x/3.
- **Admin:** sign in with TOTP. Direct requests to GET /api/staff, POST /api/staff/invite, POST /api/staff/manage and GET /api/audit must return 403.
- **Moderator:** sign in with TOTP. The same staff-management and audit requests must return 403.
- **All roles:** without a verified TOTP factor, protected API requests must return 401. After 30 minutes without an authenticated API request, the session must be rejected.
- **Database:** anon and authenticated have no table privileges; explicit deny-all RLS policies protect all three admin tables. PostgreSQL tests verified a fourth Admin seat and a second Supreme Admin are rejected, and audit UPDATE/DELETE are blocked.

The repository workflows build both applications. Once the Cloudflare GitHub Actions secret is configured and the Worker secrets below are set, run the **Admin dashboard build** workflow manually from GitHub Actions to deploy the admin Worker. The public frontend workflow can also be manually run to publish the public-site removal of the old admin UI.

Add a repository Actions secret named `CLOUDFLARE_API_TOKEN` (Cloudflare token with Workers Scripts Edit permission for the NUSQRA account). Do not put it in chat. The deployment steps are skipped until that secret exists.

## Live Overview analytics (Phase 2)
- Supreme Admin and Admin roles can view live install and completed-task counts; Moderators cannot.
- The public PWA install endpoint records a single UUID per browser device and stores only the platform, install timestamp, and nullable authenticated user ID.
- The Overview API returns aggregate counts and timestamp-only activity feed entries. The browser subscribes to Supabase Realtime and falls back to 3-second polling if disconnected.
- Completed tasks use the existing `public.jobs.status = 'completed'` value. The migration adds `completed_at` for accurate future date buckets and a minimal `job_completion_events` table for private realtime notifications.
- Counts are based on real rows only. App-store installs are not included.
- The separate admin Worker requires the GitHub Actions secrets `SUPABASE_SERVICE_ROLE_KEY` and `SUPREME_ADMIN_EMAIL`, in addition to `CLOUDFLARE_API_TOKEN`. Never paste the service-role key into chat or commit it.
