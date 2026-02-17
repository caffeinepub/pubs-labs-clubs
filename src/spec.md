# Specification

## Summary
**Goal:** Execute the Rollout 21.7 build/upgrade deployment for Higgins Music Hub, then run and record post-upgrade smoke-test results.

**Planned changes:**
- Execute the Rollout 21.7 build/upgrade deployment per `frontend/ROLLOUT_STEPS.md` Step 9.5, preserving all existing canister state and ensuring the pipeline completes without platform errors.
- Verify build health: run frontend TypeScript check and production build, and confirm backend builds with no Motoko compiler errors.
- After upgrade, execute the smoke test checklist in `frontend/SMOKE_TEST_21_7.md` as both an admin user and a non-admin approved member user.
- Record outcomes in `frontend/UPGRADE_LINKING_VERIFICATION_RESULTS.md` under “Rollout 21.7 Smoke Test Results”, including required metadata and detailed failure notes (route, role, exact error text) if applicable.

**User-visible outcome:** The application is upgraded to Rollout 21.7 with existing state preserved, and the documented smoke-test results confirm whether core routes and dialogs work for both admin and non-admin users.
