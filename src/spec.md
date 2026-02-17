# Specification

## Summary
**Goal:** Complete the Rollout 21.7 build/upgrade deployment, run the prescribed post-upgrade smoke tests for admin and non-admin users, and record the results.

**Planned changes:**
- Execute the Rollout 21.7 build/upgrade deployment per `frontend/ROLLOUT_STEPS.md` Step 9.5, preserving canister state and ensuring the pipeline completes without the platform error “Unable to create your app”.
- Run the smoke test checklist in `frontend/SMOKE_TEST_21_7.md` twice (admin and non-admin approved member), validating landing page load, gated navigation, five portal detail routes, “Edit Links” dialogs, and absence of frontend/backend runtime errors.
- Update `frontend/UPGRADE_LINKING_VERIFICATION_RESULTS.md` under “Rollout 21.7 Smoke Test Results” with outcomes and required details (date, tester, environment, principals, entity IDs, and failure notes if any).

**User-visible outcome:** The upgraded app deploys successfully without data loss, key portal routes and dialogs function for both admin and member roles, and the Rollout 21.7 smoke test results are documented.
