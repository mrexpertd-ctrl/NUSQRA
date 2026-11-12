# Authentication status

The public Admin dashboard preview has been removed. Login, registration, and staff sign-in are interface placeholders only. All credential fields are disabled until a real backend is implemented. Do not use client-side passwords, public environment variables, or a hardcoded admin account.

## Required before activation
1. Configure a trusted server-side authentication provider or audited authentication backend.
2. Invite the project owner at mrexpertd@gmail.com using a one-time activation link; owner chooses their own password privately.
3. Enforce role-based authorization for every admin API and page; require MFA for admins.
4. Set up email verification, password reset, rate limiting, secure session cookies, audit logs, and CSRF protection where applicable.
5. Add separate admin route and protect it server-side; remove the staff access link from public footer if private URL is desired.
6. Test registration, login, logout, authorization and security before enabling forms.
