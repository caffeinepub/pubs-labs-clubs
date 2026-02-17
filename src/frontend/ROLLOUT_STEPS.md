# Higgins Music Hub — Rollout Steps

This document serves as the single source of truth for the remaining rollout steps for the Higgins Music Hub application. Each step is numbered and named for easy reference during the development and deployment process.

## Completed Steps

- **Step 1–7**: Initial development, core features, authorization, approval workflows, entity management, cross-linking functionality, and upgrade-safe array normalization.
- **Step 8**: Create named rollout step documentation (this document).

## Remaining Steps

### Step 9 — Verify Upgrade-Safe Related-Record Linking (Manual QA)

**Description**: Perform comprehensive manual verification of the "Edit Links" functionality across all five entity detail pages (Membership, Publishing Work, Release, Recording Project, Artist Development) for both admin and non-admin member roles after a canister upgrade. This step ensures that the upgrade-safe array normalization implemented in previous steps works correctly in production scenarios.

**Portal Routes Tested**:
- `/portal/memberships/$id` — Membership Detail
- `/portal/publishing/$id` — Publishing Work Detail
- `/portal/releases/$id` — Release Detail
- `/portal/recordings/$id` — Recording Project Detail
- `/portal/artists/$id` — Artist Development Detail

**Entity Category Labels in UI**:
- **Memberships** — Member profiles and accounts
- **Artist Development** — Artist CRM and development plans
- **Publishing Works** — Songs, compositions, and publishing catalog
- **Releases** — Albums, EPs, singles, and label releases
- **Recording Projects** — Studio sessions and recording projects

**How to Verify**:
- **Perform a canister upgrade before beginning testing**
- Follow the detailed checklist in `frontend/UPGRADE_LINKING_VERIFICATION.md`
- Record all test results in `frontend/UPGRADE_LINKING_VERIFICATION_RESULTS.md`
- Test with both admin and non-admin member accounts
- Verify that all "Edit Links" dialogs open without errors
- Confirm pre-existing links are correctly pre-selected
- Test save operations and verify immediate UI updates
- **Refresh pages to confirm link persistence** (critical acceptance criterion)
- Check that non-admin members see only their own entities in dialogs
- Ensure no runtime errors occur when loading detail pages post-upgrade

**Acceptance Criteria**:
- A canister upgrade is performed prior to testing, and no runtime traps occur on startup after upgrade
- All checklist items in `UPGRADE_LINKING_VERIFICATION.md` pass for both admin and member roles
- No runtime errors or crashes occur during any linking operations
- Related Records sections display correctly after upgrade
- Links persist correctly across page refreshes
- All test results are documented in `UPGRADE_LINKING_VERIFICATION_RESULTS.md`

---

### Step 9.1 — Rollout 21.1–21.2 Build/Upgrade Readiness

**Description**: Prepare the frontend for the next build/upgrade deployment by adding router-level error handling and documenting explicit rollout 21.1–21.2 verification steps. This ensures that unexpected render/runtime errors in routed pages are surfaced as stable in-app error screens instead of crashing the entire SPA during/after upgrade validation.

**Frontend Changes**:
- Add router-level error handling to `App.tsx` with `ErrorComponent` for root route and individual routes
- Create `SMOKE_TEST_21_1_21_2.md` with concise post-upgrade smoke test checklist
- Update `ROLLOUT_STEPS.md` to include rollout 21.1–21.2 build/upgrade verification notes
- Update `UPGRADE_LINKING_VERIFICATION.md` to cross-reference rollout 21.1–21.2 smoke test expectations
- Update `UPGRADE_LINKING_VERIFICATION_RESULTS.md` to capture rollout 21.1–21.2 post-upgrade smoke outcomes

**How to Verify**:
- A new build completes successfully for both frontend and backend without errors
- A canister upgrade deployment completes successfully and preserves existing canister state (no data loss)
- The deployment process does not fail with the platform error "Unable to create your app"
- Router-level error boundaries catch and display errors gracefully instead of crashing the app
- All documentation files are updated with rollout 21.1–21.2 references

**Acceptance Criteria**:
- Build completes without errors
- Canister upgrade succeeds without data loss
- No platform deployment errors occur
- Error handling prevents full app crashes
- Documentation is complete and accurate

---

### Step 9.2 — Rollout 21.1–21.2 Post-Deploy Smoke Verification

**Description**: Execute the post-upgrade smoke test checklist to verify that the landing page, the five portal detail routes, and the "Edit Links" dialog open successfully for authorized users after the rollout 21.1–21.2 upgrade.

**Smoke Test Focus**:
- Landing page (`/`) loads successfully in the browser
- Authenticated portal navigation works via AuthGate and ApprovalGate
- All five detail routes load without runtime errors:
  - `/portal/memberships/$id`
  - `/portal/publishing/$id`
  - `/portal/releases/$id`
  - `/portal/recordings/$id`
  - `/portal/artists/$id`
- "Edit Links" dialog opens successfully on each of the five detail routes for authorized users (admin or record owner)

**How to Verify**:
- Follow the smoke test checklist in `frontend/SMOKE_TEST_21_1_21_2.md`
- Test with both admin and non-admin approved member accounts
- Record all test outcomes in `frontend/UPGRADE_LINKING_VERIFICATION_RESULTS.md` under "Rollout 21.1–21.2 Smoke Test Results"
- Verify no runtime traps occur on startup after upgrade
- Confirm all portal routes render without crashes
- Ensure "Edit Links" dialogs initialize without errors

**Acceptance Criteria**:
- No runtime traps occur on startup after the upgrade
- Landing page loads successfully
- Authenticated portal navigation works correctly
- All five portal detail routes load without runtime errors
- "Edit Links" dialog opens successfully on all five detail routes for authorized users
- All smoke test results are documented in the results template

---

### Step 9.3 — Rollout 21.3–21.4 Build/Upgrade Execution

**Description**: Execute the rollout 21.3–21.4 build/upgrade deployment and perform post-upgrade smoke verification to confirm the application loads correctly and all key routes function without runtime crashes.

**Build/Upgrade Focus**:
- Frontend build completes successfully with no TypeScript build errors
- Backend build completes successfully with no Motoko compiler errors
- Canister upgrade completes successfully while preserving existing state (no data loss)
- Application starts after upgrade with no runtime traps on startup
- Deployment pipeline does not fail with the platform error "Unable to create your app"

**How to Verify**:
- Execute the build/upgrade deployment
- Follow the smoke test checklist in `frontend/SMOKE_TEST_21_3_21_4.md`
- Record all test outcomes in `frontend/UPGRADE_LINKING_VERIFICATION_RESULTS.md` under "Rollout 21.3–21.4 Smoke Test Results"

**Acceptance Criteria**:
- Build and upgrade complete successfully
- All smoke test steps pass
- No runtime traps or crashes occur
- Documentation is complete

---

### Step 9.4 — Rollout 21.5–21.6 Build/Upgrade Execution

**Description**: Execute the rollout 21.5–21.6 build/upgrade deployment and perform post-upgrade smoke verification to confirm the application loads correctly and all key routes function without runtime crashes.

**Build/Upgrade Focus**:
- Frontend build completes successfully with no TypeScript build errors
- Backend build completes successfully with no Motoko compiler errors
- Canister upgrade completes successfully while preserving existing state (no data loss)
- Application starts after upgrade with no runtime traps on startup
- Deployment pipeline does not fail with the platform error "Unable to create your app"

**How to Verify**:
- Execute the build/upgrade deployment
- Follow the smoke test checklist in `frontend/SMOKE_TEST_21_5_21_6.md`
- Record all test outcomes in `frontend/UPGRADE_LINKING_VERIFICATION_RESULTS.md` under "Rollout 21.5–21.6 Smoke Test Results"

**Acceptance Criteria**:
- Build and upgrade complete successfully
- All smoke test steps pass
- No runtime traps or crashes occur
- Documentation is complete

---

### Step 9.5 — Rollout 21.7 Build/Upgrade Execution

**Description**: Execute the rollout 21.7 build/upgrade deployment and perform post-upgrade smoke verification to confirm the application loads correctly, all key routes function without runtime crashes, and the frontend hardening measures (router-level error handling, defensive null checks, array normalization) prevent upgrade-related failures.

**Build/Upgrade Focus**:
- **Frontend Build Sanity**: Run `npm run typescript-check` and `npm run build` from the `frontend/` directory before deployment to catch TypeScript errors early
- **Backend Build**: Ensure Motoko compilation completes without errors
- **Upgrade Execution**: Perform a canister **upgrade** (not reinstall) to preserve existing state
- **Startup Verification**: Application starts after upgrade with no runtime traps
- **Deployment Pipeline**: No platform errors ("Unable to create your app")
- **Router-Level Error Handling**: Error boundaries catch and display errors gracefully instead of crashing the entire SPA
- **Portal Routes**: All five detail routes load without crashes for both admin and non-admin approved member roles
- **Edit Links Dialogs**: Open successfully on all five detail routes for both roles

**Pre-Deployment Frontend Sanity Checks** (run from `frontend/` directory):

1. **TypeScript Verification**:
   ```bash
   npm run typescript-check
   ```
   - **Success criteria**: Zero TypeScript compilation errors
   - **If errors exist**: Fix them before proceeding with deployment

2. **Production Build Verification**:
   ```bash
   npm run build
   ```
   - **Success criteria**: Build completes successfully with production output
   - **Check for**: No build errors or critical warnings

**Deployment Execution Checklist**:
- [ ] Frontend TypeScript check passed (zero errors)
- [ ] Frontend production build completed successfully
- [ ] Backend Motoko compilation completed without errors
- [ ] Canister upgrade executed (confirm: **upgrade**, not reinstall)
- [ ] Platform deployment succeeded (no "Unable to create your app" error)
- [ ] Application started post-upgrade (no runtime traps on startup)
- [ ] Landing page renders in browser post-upgrade

**Troubleshooting Common TypeScript/Runtime Issues**:
- **Undefined/null access errors**: Verify all array fields use `normalizeToArray()` utility
- **Type mismatches**: Ensure backend types are imported from `src/backend` and used consistently
- **Missing properties**: Check that all entity fields are accessed with optional chaining (`?.`) where appropriate
- **Router errors**: Confirm all routes have error boundaries and ErrorComponent configured
- **AuthGate/ApprovalGate issues**: Verify identity and approval status checks include defensive null handling

**Post-Deployment Smoke Test**:
- Follow the smoke test checklist in `frontend/SMOKE_TEST_21_7.md`
- Use the session log template in `frontend/SMOKE_TEST_21_7_SESSION_LOG.md` to capture detailed execution notes
- Test with both admin and non-admin approved member accounts
- Verify AuthGate and ApprovalGate behavior remains stable post-upgrade
- Confirm router-level error handling functions correctly (trigger an error and verify it renders as an in-app error screen, not a full SPA crash)
- Record all test outcomes in `frontend/UPGRADE_LINKING_VERIFICATION_RESULTS.md` under "Rollout 21.7 Smoke Test Results"

**Evidence Capture**:
- Record all build/upgrade execution evidence in `frontend/ROLL_OUT_21_7_EXECUTION_LOG.md`
- Include timestamps, command outputs, and any error messages
- Document exact entity IDs and principals used during smoke testing

**Acceptance Criteria**:
- Frontend build completes successfully with no TypeScript build errors (`npm run typescript-check` passes)
- Production build completes successfully (`npm run build` passes)
- Backend build completes successfully with no Motoko compiler errors
- Canister upgrade completes successfully while preserving existing state (no data loss)
- Application starts after upgrade with no runtime traps on startup
- Deployment pipeline does not fail with the platform error "Unable to create your app"
- Landing page (`/`) loads without errors
- Authenticated portal navigation works (AuthGate and ApprovalGate) for both roles
- All five portal detail routes load without runtime crashes for both roles
- "Edit Links" dialog opens successfully on each of the five detail routes for both roles
- No frontend console errors related to undefined/null access occur during the smoke test
- No backend runtime traps occur during the smoke test
- Router-level error handling remains stable (errors render as in-app error screens, not full SPA crashes)
- All smoke test results are documented in `frontend/UPGRADE_LINKING_VERIFICATION_RESULTS.md`
- All build/upgrade execution evidence is documented in `frontend/ROLL_OUT_21_7_EXECUTION_LOG.md`

---

### Step 10 — Deployment and Launch

**Description**: Deploy the Higgins Music Hub system to the ICP mainnet, monitor performance and user adoption, perform additional system configuration as needed, and perform final quality assurance checks.

**Deployment Tasks**:
- Deploy backend canister to mainnet
- Deploy frontend assets to mainnet
- Configure production environment variables
- Set up monitoring and logging
- Perform final smoke tests on mainnet
- Monitor initial user adoption and system performance

**Acceptance Criteria**:
- System is live on mainnet
- All core features function correctly in production
- No critical bugs or performance issues
- Monitoring and logging are operational
- Initial users can successfully access and use the system

---

### Step 11 — Post-Launch Refinements

**Description**: Incorporate user feedback to improve UX and performance, fix remaining bugs and issues, and integrate CI/CD pipeline.

**Refinement Tasks**:
- Collect and analyze user feedback
- Prioritize and implement UX improvements
- Fix reported bugs and issues
- Optimize performance based on real-world usage
- Set up CI/CD pipeline for automated testing and deployment

**Acceptance Criteria**:
- User feedback is collected and analyzed
- High-priority improvements are implemented
- Critical bugs are resolved
- Performance is optimized
- CI/CD pipeline is operational

---

### Step 12 — Long-Term Maintenance

**Description**: Plan and implement system maintenance procedures, add improvements as needed, train core team on system maintenance, and maintain documentation and change logs.

**Maintenance Tasks**:
- Establish regular maintenance schedule
- Document maintenance procedures
- Train team members on system administration
- Keep documentation up to date
- Plan and implement feature enhancements
- Monitor system health and performance

**Acceptance Criteria**:
- Maintenance procedures are documented and followed
- Team is trained on system maintenance
- Documentation is current and accurate
- System remains stable and performant
- Feature enhancements are planned and implemented as needed

---

## Next Step to Execute

**Current Step**: Step 9.5 — Rollout 21.7 Build/Upgrade Execution

**Action Required**: Execute the build/upgrade deployment following the pre-deployment sanity checks, then follow the smoke test checklist in `frontend/SMOKE_TEST_21_7.md` and record results in `frontend/UPGRADE_LINKING_VERIFICATION_RESULTS.md`. Capture all execution evidence in `frontend/ROLL_OUT_21_7_EXECUTION_LOG.md`.

**References**:
- Execution log template: `frontend/ROLL_OUT_21_7_EXECUTION_LOG.md`
- Smoke test checklist: `frontend/SMOKE_TEST_21_7.md`
- Session log template: `frontend/SMOKE_TEST_21_7_SESSION_LOG.md`
- Results template: `frontend/UPGRADE_LINKING_VERIFICATION_RESULTS.md`
