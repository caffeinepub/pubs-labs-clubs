# Higgins Music Hub — Rollout Steps

This document serves as the single source of truth for the remaining rollout steps for the Higgins Music Hub application. Each step is numbered and named for easy reference during the development and deployment process.

## Completed Steps

- **Step 1–7**: Initial development, core features, authorization, approval workflows, entity management, cross-linking functionality, and upgrade-safe array normalization.
- **Step 8**: Create named rollout step documentation (this document).
- **Step 9**: Verify Upgrade-Safe Related-Record Linking (Manual QA) — Completed with comprehensive verification across all five entity detail pages for both admin and non-admin member roles.
- **Step 9.1–9.5**: Rollout 21.1–21.7 Build/Upgrade Execution — Completed with successful frontend hardening, router-level error handling, and post-upgrade smoke verification.

## Remaining Steps

---

### Step 10A — Pre-Deployment Checks and Canister Preparation

**Description**: Verify the local build is clean, confirm the correct dfx identity and cycles wallet are configured for mainnet, and prepare the backend canister for upgrade on the ICP mainnet.

---

#### ⚠️ Before You Begin — Confirmation Checklist

Complete every item below before executing any Step 10A actions. **Do not proceed if any item cannot be checked off.**

- [ ] Local TypeScript check passes (`pnpm typescript-check` exits with zero errors)
- [ ] Local production build succeeds (`pnpm build` completes without errors)
- [ ] You have confirmed the correct dfx identity is set for mainnet deployment (`dfx identity whoami` returns the expected deployer identity)
- [ ] The mainnet cycles wallet is funded with sufficient cycles for canister upgrade and frontend asset upload
- [ ] You have the mainnet backend canister ID recorded and confirmed
- [ ] You have reviewed the previous smoke test results (`SMOKE_TEST_21_7_SESSION_LOG.md`) to understand the baseline state
- [ ] No outstanding critical bugs or regressions are known in the current codebase

> **Stop here if any item above cannot be confirmed. Resolve all failures before continuing.**

---

#### Step 10A — Action Checklist

1. [ ] Run `pnpm typescript-check` and confirm zero TypeScript errors
2. [ ] Run `pnpm build` and confirm the production build completes successfully
3. [ ] Run `dfx identity whoami` and confirm the correct mainnet deployer identity is active
4. [ ] Run `dfx identity get-wallet --network ic` and confirm the cycles wallet address is correct
5. [ ] Verify cycles balance is sufficient: `dfx wallet balance --network ic`
6. [ ] Confirm the mainnet backend canister ID: `dfx canister id backend --network ic`
7. [ ] Record the current canister status: `dfx canister status backend --network ic`
8. [ ] Confirm the canister is in a `Running` state and not frozen
9. [ ] Review `backend/main.mo` for any last-minute issues before upgrade
10. [ ] Document the pre-deployment canister module hash for rollback reference

#### Step 10A — Acceptance Criteria

- Local TypeScript check passes with zero errors
- Local production build succeeds without errors
- Correct dfx identity is active for mainnet deployment
- Cycles wallet is funded and confirmed
- Mainnet backend canister ID is verified and recorded
- Canister is in `Running` state
- Pre-deployment module hash is documented

#### Step 10A — Evidence Fields

**TypeScript Check Result**: _____________  
**Build Result**: _____________  
**Active dfx Identity**: _____________  
**Cycles Wallet Address**: _____________  
**Cycles Balance**: _____________  
**Mainnet Backend Canister ID**: _____________  
**Pre-Deployment Module Hash**: _____________  
**Canister Status**: _____________  
**Timestamp**: _____________

---

> ✅ **Confirm all Step 10A checks pass before proceeding to Step 10B.**  
> If any acceptance criterion is not met, stop and resolve the issue before continuing.

---

### Step 10B — Backend Canister Upgrade on Mainnet

**Description**: Upgrade the backend canister on the ICP mainnet, verify the upgrade completed successfully, and run a backend-focused smoke test to confirm stable memory and data integrity.

---

#### 🔒 Gate: Confirm 10A Complete

Before executing Step 10B, confirm the following conditions from Step 10A are all true. **Do not proceed if any condition is not met.**

- [ ] Local TypeScript check passed with zero errors (Step 10A ✓)
- [ ] Local production build succeeded without errors (Step 10A ✓)
- [ ] Correct dfx identity is active for mainnet deployment (Step 10A ✓)
- [ ] Cycles wallet is funded and confirmed (Step 10A ✓)
- [ ] Mainnet backend canister ID is verified and recorded (Step 10A ✓)
- [ ] Canister was confirmed in `Running` state (Step 10A ✓)
- [ ] Pre-deployment module hash is documented for rollback reference (Step 10A ✓)
- [ ] Step 10A smoke test (see `SMOKE_TEST_STEP_10_MAINNET.md` — Section 10A) passed

> **Stop here if any condition above is not confirmed. Do not upgrade the backend canister until all Step 10A criteria are met.**

---

#### Step 10B — Action Checklist

1. [ ] Run the backend canister upgrade: `dfx deploy backend --network ic --mode upgrade`
2. [ ] Confirm the upgrade command exits with a success status (no error output)
3. [ ] Record the new post-upgrade module hash: `dfx canister status backend --network ic`
4. [ ] Confirm the canister is still in `Running` state after upgrade
5. [ ] Verify stable memory was preserved (no data loss) by querying a known entity from the backend
6. [ ] Run a backend query smoke test: call `getEntitiesForCaller` via the admin principal and confirm data is returned
7. [ ] Confirm `isCallerAdmin` returns `true` for the admin principal
8. [ ] Confirm `isCallerApproved` returns `true` for a known approved non-admin member
9. [ ] Check canister logs for any traps or unexpected errors: `dfx canister logs backend --network ic`
10. [ ] Document the upgrade outcome and any warnings observed

#### Step 10B — Acceptance Criteria

- Backend canister upgrade completes without errors
- Canister remains in `Running` state after upgrade
- Post-upgrade module hash is recorded
- Stable memory is preserved — existing entities are queryable
- `isCallerAdmin` returns correct results for admin principal
- `isCallerApproved` returns correct results for approved member
- No traps or critical errors in canister logs

#### Step 10B — Evidence Fields

**Upgrade Command Output**: _____________  
**Post-Upgrade Module Hash**: _____________  
**Canister Status After Upgrade**: _____________  
**Stable Memory Verification Query Result**: _____________  
**`isCallerAdmin` Result (admin principal)**: _____________  
**`isCallerApproved` Result (member principal)**: _____________  
**Canister Log Summary**: _____________  
**Timestamp**: _____________

---

> ✅ **Confirm all Step 10B checks pass before proceeding to Step 10C.**  
> If the backend upgrade failed or data integrity cannot be confirmed, stop and assess rollback options before continuing.

---

### Step 10C — Frontend Asset Deployment and Post-Deploy Smoke Test

**Description**: Deploy the frontend assets to the ICP mainnet, verify the application is accessible at the production URL, and run the full post-deployment smoke test covering all portal routes and Edit Links dialogs for both admin and non-admin approved member roles.

---

#### 🔒 Gate: Confirm 10B Complete

Before executing Step 10C, confirm the following conditions from Step 10B are all true. **Do not proceed if any condition is not met.**

- [ ] Backend canister upgrade completed without errors (Step 10B ✓)
- [ ] Canister is in `Running` state after upgrade (Step 10B ✓)
- [ ] Post-upgrade module hash is recorded (Step 10B ✓)
- [ ] Stable memory verified — existing entities are queryable (Step 10B ✓)
- [ ] `isCallerAdmin` and `isCallerApproved` return correct results (Step 10B ✓)
- [ ] No traps or critical errors found in canister logs (Step 10B ✓)
- [ ] Step 10B smoke test (see `SMOKE_TEST_STEP_10_MAINNET.md` — Section 10B) passed

> **Stop here if any condition above is not confirmed. Do not deploy frontend assets until the backend upgrade is verified stable.**

---

#### Step 10C — Action Checklist

1. [ ] Deploy frontend assets to mainnet: `dfx deploy frontend --network ic`
2. [ ] Confirm the frontend deploy command exits with a success status
3. [ ] Record the mainnet frontend URL from the deploy output
4. [ ] Navigate to the mainnet frontend URL in a browser and confirm the landing page loads
5. [ ] Confirm the hero image, branding, and navigation render correctly
6. [ ] Confirm no console errors on the landing page
7. [ ] Log in as the admin user via Internet Identity on mainnet
8. [ ] Verify AuthGate allows the admin through to the portal
9. [ ] Verify ApprovalGate allows the admin through (admins are always approved)
10. [ ] Test all five portal detail routes as admin (memberships, publishing, releases, recordings, artists)
11. [ ] Open the "Edit Links" dialog on each of the five detail routes as admin
12. [ ] Log out admin and log in as a non-admin approved member
13. [ ] Verify AuthGate and ApprovalGate allow the approved member through
14. [ ] Test all five portal detail routes as the non-admin approved member
15. [ ] Open the "Edit Links" dialog on each of the five detail routes as the non-admin member
16. [ ] Review browser console throughout the entire smoke test for errors
17. [ ] Complete the full smoke test checklist in `SMOKE_TEST_STEP_10_MAINNET.md` — Section 10C
18. [ ] Document all test user principals, entity IDs, and outcomes

#### Step 10C — Acceptance Criteria

- Frontend assets deploy successfully to mainnet
- Landing page is accessible at the production URL and renders correctly
- No console errors on the landing page
- Admin user can log in and access the portal (AuthGate + ApprovalGate pass)
- Non-admin approved member can log in and access the portal (AuthGate + ApprovalGate pass)
- All five portal detail routes load without runtime errors for both roles
- "Edit Links" dialogs open and function correctly for both roles
- Admin sees all entities in Edit Links dialogs; member sees only their own
- No critical console errors or backend traps during smoke test
- Full smoke test checklist in `SMOKE_TEST_STEP_10_MAINNET.md` is completed and documented

#### Step 10C — Evidence Fields

**Frontend Deploy Output**: _____________  
**Mainnet Frontend URL**: _____________  
**Landing Page Load Result**: _____________  
**Admin Principal**: _____________  
**Admin AuthGate Result**: _____________  
**Admin ApprovalGate Result**: _____________  
**Member Principal**: _____________  
**Member AuthGate Result**: _____________  
**Member ApprovalGate Result**: _____________  
**Console Error Summary**: _____________  
**Smoke Test Overall Result (PASS/FAIL)**: _____________  
**Timestamp**: _____________

---

**References**:
- Mainnet smoke test checklist: `frontend/SMOKE_TEST_STEP_10_MAINNET.md`
- Previous smoke test format: `frontend/SMOKE_TEST_21_7.md`
- Results template format: `frontend/UPGRADE_LINKING_VERIFICATION_RESULTS.md`
- Execution log format: `frontend/ROLL_OUT_21_7_EXECUTION_LOG.md`

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

**Current Step**: Step 10A — Pre-Deployment Checks and Canister Preparation

**Action Required**: Begin the mainnet deployment sequence by completing Step 10A first. Each sub-step (10A → 10B → 10C) must be fully confirmed before proceeding to the next. Follow the confirmation gates at the top of each sub-step section and complete the corresponding smoke test sections in `frontend/SMOKE_TEST_STEP_10_MAINNET.md`.

**References**:
- Mainnet smoke test checklist: `frontend/SMOKE_TEST_STEP_10_MAINNET.md`
- Previous smoke test examples: `frontend/SMOKE_TEST_21_7.md`, `frontend/SMOKE_TEST_21_7_SESSION_LOG.md`
- Results template format: `frontend/UPGRADE_LINKING_VERIFICATION_RESULTS.md` (Rollout 21.7 section)
- Execution log format: `frontend/ROLL_OUT_21_7_EXECUTION_LOG.md`
