# Phase A SQL draft — security review (2026-11-14)

**Status: BLOCKED — do not execute the original draft.**

The additive DDL section has already been executed as migration
`20261114194151_phase_a_additive_job_fields_and_proposal_uniqueness`.
The original draft must NOT be run again: its named constraints already exist.

## Verified against connected Supabase project
- `public.jobs` has budget_type, deadline, is_remote, content_language.
- `public.proposals` has content_language.
- Unique accepted-proposal index and open-job deadline index exist.
- Proposal UPDATE policies currently include `Customers decide proposals on own jobs`.
- The existing `nusqra_guard_proposal_update` and `nusqra_after_proposal_decision` triggers are active.
- Existing proposal INSERT RLS checks `private.account_can('can_submit_proposals')`.

## Blocking issues in the unexecuted trigger/policy draft
1. The closed-job branch permits `submitted -> rejected` without checking the actor. It relies on a broad implicit internal-trigger exception; a direct client UPDATE could exploit it where RLS allows the row.
2. The proposed professional UPDATE policy omits `private.account_can('can_submit_proposals')`, potentially allowing restricted professionals to modify proposals.
3. The draft replaces the existing guard without reconciling the AFTER decision trigger, its update behavior, and concurrent acceptance.
4. The professional update path must explicitly restrict mutable columns (including content_language), reject edits after acceptance, and prevent role/ownership bypass.
5. UPDATE also needs SELECT visibility, which exists for participants; test with actual authenticated roles.
6. New DDL cannot be replayed safely because named constraints already exist.

## Next implementation
Write a separate, minimal migration for proposal updates only, after inspecting the complete definitions of existing guard/after-decision functions and account restriction helper. Test submitted edit/withdraw, customer accept/reject, simultaneous accepts, rejected updates, banned professional, and internal cascade behavior in a transaction or isolated development environment. Keep admin design and existing data unchanged.

This file replaces the unsafe executable draft with a review record.
