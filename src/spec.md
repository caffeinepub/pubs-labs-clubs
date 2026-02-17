# Specification

## Summary
**Goal:** Execute Rollout 21.7 Step 9.5 build/upgrade process and capture evidence, then complete the post-upgrade smoke test for admin and approved member roles and record results in the provided templates.

**Planned changes:**
- Run pre-deployment frontend sanity checks from `frontend/` (`npm run typescript-check`, `npm run build`) and ensure they complete successfully.
- Build the backend with no Motoko compiler errors.
- Perform a canister **upgrade** (not reinstall) per `frontend/ROLLOUT_STEPS.md` Step 9.5, preserving all existing canister state and completing the deployment pipeline successfully.
- Execute the post-upgrade smoke test checklist in `frontend/SMOKE_TEST_21_7.md` twice (admin + non-admin approved member), covering `/`, AuthGate/ApprovalGate behavior, all five portal detail routes, and opening the “Edit Links” dialog on each.
- Record build/upgrade evidence and QA outcomes in `frontend/ROLL_OUT_21_7_EXECUTION_LOG.md` and the “Rollout 21.7 Smoke Test Results” section of `frontend/UPGRADE_LINKING_VERIFICATION_RESULTS.md`, including principals, entity IDs tested, timestamps, command outputs, and any error details (exact text/stack trace when available).

**User-visible outcome:** The application is upgraded to Rollout 21.7 without data loss, starts cleanly, and the key portal routes and “Edit Links” dialogs are verified to work for both admin and approved member users with documented execution evidence and smoke test results.
