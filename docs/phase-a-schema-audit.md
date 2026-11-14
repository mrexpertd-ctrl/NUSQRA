# NUSQRA Phase A — schema reconciliation and implementation gate

Status: DRAFT, no SQL executed. Branch: `feature/phase-a-foundation`.

## Existing schema verified

Existing migrations already define `profiles`, `user_roles`, `categories`, `jobs`, `proposals`, `reviews`, `services`, `professional_profiles`, `conversations`, and `messages`. Do **not** recreate these tables under different names.

- `public.nusqra_role`: customer, professional, admin. A user can hold customer and professional roles simultaneously.
- `public.job_status`: draft, open, in_progress, completed, closed, cancelled.
- `public.proposal_status`: submitted, withdrawn, accepted, rejected.
- Existing `proposals` already has `unique(job_id, professional_id)`.
- Existing client-side Supabase client reads `account_controls`; account restriction enforcement must be server-side, including existing write policies.
- Existing admin tables are isolated and must not be modified as part of this feature.

## Gaps relative to approved Phase A

1. `jobs`: add `budget_type`, `deadline`, `is_remote`, `content_language` and appropriate indexes/constraints; reuse existing `country_code`, `city`, `budget_min/max`, `currency`.
2. `proposals`: add `content_language`; add an owner-controlled shortlist state or separate shortlist relation. Allow owner of proposal to edit/withdraw **only while submitted and job open**. Existing trigger `nusqra_guard_proposal_update` currently prohibits changing proposal details.
3. Proposal acceptance: atomic server-side transaction, lock parent job, ensure only one accepted proposal per job; do not trust direct client updates. Existing `nusqra_after_proposal_decision` and `nusqra_guard_job_status` must be reconciled rather than duplicated.
4. Engagements: introduce a participant-scoped engagement row linked to one accepted proposal and job, with two independent completion confirmations. Never permit review until both confirm.
5. Reviews: existing RLS allows a customer review when job is marked completed; replace with mutually confirmed engagement gate, allowing each participant one review of the other. No synthetic ratings.
6. Reports: user reports on job, proposal, profile, review; private to reporter and authorized moderation service. Reuse existing moderation mechanisms where appropriate.
7. Attachments: private Supabase Storage bucket, type/size limits, server-enforced ownership/visibility, safe access paths.
8. Basic engagement messages: reuse existing conversation/message infrastructure where safe; allow participants after acceptance, enforce account restrictions on server. Expanded chat belongs to Phase D.
9. Every new table: enable RLS, explicit policies, least-privilege grants, server-side enforcement of banned/restricted users; do not rely on UI flags.
10. Bilingual: per-item `content_language` ('ar'/'en') and direction, existing interface language switch; test both at 360px and 390px.

## Pre-migration safety checks

- Confirm which migrations are applied in the connected Supabase database. Git history alone does not prove deployment.
- Inspect remaining migrations for `account_controls`, moderation, messaging, storage, and any existing acceptance or completion functions.
- Review all existing policies, triggers, grants and SECURITY DEFINER search paths.
- Produce a forward-only additive migration with rollback plan and explicit RLS regression tests.
- Validate against a non-production database first. Do not execute against production until review.
- No changes to admin dashboard, checkout, wallet, escrow or payouts.

## Phase A test identities (no fake production users)

Test with controlled test accounts only: client, professional, restricted/banned user, admin. Verify one proposal per professional/job, concurrent accept race, withdrawal/edit boundaries, owner-only shortlist, dual completion, no premature review, private reports, language direction, and unauthorized direct REST/RPC requests.

## Delivery gate

No preview URL, screenshot, build result or successful migration may be claimed until independently verified. Stop after Phase A and wait for the owner's approval before Phase B.
