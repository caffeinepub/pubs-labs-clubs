# Specification

## Summary
**Goal:** Execute the Rollout 21.7 build and canister upgrade for Higgins Music Hub, then run the prescribed post-upgrade smoke tests and record results.

**Planned changes:**
- Produce the next build and deploy via canister upgrade for Rollout 21.7 while preserving existing canister state and avoiding deployment pipeline failure (“Unable to create your app”).
- Ensure frontend and backend builds complete successfully (no TypeScript errors; no Motoko compiler errors) and the app starts post-upgrade without runtime traps.
- Execute the smoke test checklist in `frontend/SMOKE_TEST_21_7.md` using both an admin user and a non-admin approved member user, including landing page, gated navigation, five portal detail routes, and “Edit Links” dialog checks.
- Record smoke test outcomes in `frontend/UPGRADE_LINKING_VERIFICATION_RESULTS.md` under “Rollout 21.7 Smoke Test Results,” including environment/user principal fields and detailed notes for any failures (route, role, exact error text).

**User-visible outcome:** The upgraded Rollout 21.7 deployment runs without startup/runtime crashes, key portal routes and dialogs are verified for both roles, and the smoke test results are documented for review.
