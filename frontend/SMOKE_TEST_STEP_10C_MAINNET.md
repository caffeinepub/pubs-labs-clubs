# Smoke Test: Step 10C - Frontend Canister Upgrade (Mainnet)

This document provides the post-upgrade verification checklist for the frontend canister deployment on the ICP mainnet as part of Step 10C in `ROLLOUT_STEPS.md`.

## Overview

This smoke test verifies that the Higgins Music Hub frontend canister has been successfully upgraded on mainnet and that all key application features are functioning correctly in the production environment. It covers the landing page, Internet Identity authentication, all five portal detail routes, Edit Links dialog open/save/persistence, and the AuthGate/ApprovalGate authorization components — for both admin and non-admin approved member roles.

## Session Log Reference

**Use the companion session log file** (`frontend/SMOKE_TEST_STEP_10C_SESSION_LOG.md`) to capture per-role notes, exact entity IDs used during testing, console output, and any failure details while executing this checklist.

## Prerequisites

- Step 10B (backend canister upgrade) completed and verified (see `ROLLOUT_STEPS.md` — Step 10B)
- Frontend canister upgrade command (`dfx deploy --network=ic frontend`) executed successfully
- At least one admin user exists and can authenticate on mainnet
- At least one non-admin approved member exists and can authenticate on mainnet
- Sample data exists for all five entity types (memberships, publishing works, releases, recording projects, artist development)

## Test Environment

**Environment**: ICP Mainnet (Production)  
**Test Date**: _____________  
**Tester**: _____________  
**Frontend Canister ID**: _____________  
**Mainnet Frontend URL**: _____________  
**Deployment Timestamp**: _____________

## Test User Information

Record the exact principals used for testing:

**Admin User**:
- **Principal ID**: _____________
- **Profile Name**: _____________

**Non-Admin Approved Member**:
- **Principal ID**: _____________
- **Profile Name**: _____________

## Entity IDs Used During Testing

Record the exact entity IDs used for each route during testing:

| Entity Type | Admin Test ID | Non-Admin Member Test ID |
|---|---|---|
| Membership | _____________ | _____________ |
| Publishing Work | _____________ | _____________ |
| Release | _____________ | _____________ |
| Recording Project | _____________ | _____________ |
| Artist Development | _____________ | _____________ |

---

## Important: Test with Both Roles

**This smoke test MUST be run twice:**
1. **First run**: Complete all steps as an **admin user**
2. **Second run**: Complete all steps as a **non-admin approved member**

---

## Test Checklist

### TC-1. Landing Page Load

| Test Case | Admin (Pass/Fail) | Non-Admin Member (Pass/Fail) |
|---|---|---|
| Navigate to app root URL — page loads without errors | | |
| Hero image, branding, and navigation render correctly | | |
| No console errors or warnings on landing page | | |
| Login button is visible and interactive | | |

**Notes**: _____________

---

### TC-2. Internet Identity Authentication Flow

| Test Case | Admin (Pass/Fail) | Non-Admin Member (Pass/Fail) |
|---|---|---|
| Click login button — Internet Identity flow initiates | | |
| Internet Identity authentication completes successfully | | |
| User is redirected to portal after successful login | | |
| Portal layout renders correctly (sidebar, header, main content) | | |

**Notes**: _____________

---

### TC-3. AuthGate Behavior

| Test Case | Admin (Pass/Fail) | Non-Admin Member (Pass/Fail) |
|---|---|---|
| Authenticated user is allowed through AuthGate to portal | | |
| Unauthenticated user is redirected to landing page by AuthGate | | |

**Notes**: _____________

---

### TC-4. ApprovalGate Behavior

| Test Case | Admin (Pass/Fail) | Non-Admin Member (Pass/Fail) |
|---|---|---|
| Admin user passes ApprovalGate (admins are always approved) | | |
| Approved non-admin member passes ApprovalGate | | |
| Unapproved user sees approval status banner / access-restricted message | | |

**Notes**: _____________

---

### TC-5. Membership Detail Route (`/portal/memberships/:id`)

| Test Case | Admin (Pass/Fail) | Non-Admin Member (Pass/Fail) |
|---|---|---|
| Navigate to membership detail page — loads without runtime errors | | |
| Profile information displays correctly | | |
| Related Records section renders | | |
| "Edit Links" button is visible | | |

**Admin Entity ID**: _____________  
**Member Entity ID**: _____________  
**Notes**: _____________

---

### TC-6. Publishing Work Detail Route (`/portal/publishing/:id`)

| Test Case | Admin (Pass/Fail) | Non-Admin Member (Pass/Fail) |
|---|---|---|
| Navigate to publishing work detail page — loads without runtime errors | | |
| Work information displays correctly | | |
| Related Records section renders | | |
| "Edit Links" button is visible | | |

**Admin Entity ID**: _____________  
**Member Entity ID**: _____________  
**Notes**: _____________

---

### TC-7. Release Detail Route (`/portal/releases/:id`)

| Test Case | Admin (Pass/Fail) | Non-Admin Member (Pass/Fail) |
|---|---|---|
| Navigate to release detail page — loads without runtime errors | | |
| Release information displays correctly | | |
| Related Records section renders | | |
| "Edit Links" button is visible | | |

**Admin Entity ID**: _____________  
**Member Entity ID**: _____________  
**Notes**: _____________

---

### TC-8. Recording Project Detail Route (`/portal/recordings/:id`)

| Test Case | Admin (Pass/Fail) | Non-Admin Member (Pass/Fail) |
|---|---|---|
| Navigate to recording project detail page — loads without runtime errors | | |
| Project information displays correctly | | |
| Related Records section renders | | |
| "Edit Links" button is visible | | |

**Admin Entity ID**: _____________  
**Member Entity ID**: _____________  
**Notes**: _____________

---

### TC-9. Artist Development Detail Route (`/portal/artists/:id`)

| Test Case | Admin (Pass/Fail) | Non-Admin Member (Pass/Fail) |
|---|---|---|
| Navigate to artist development detail page — loads without runtime errors | | |
| Artist development information displays correctly | | |
| Related Records section renders | | |
| "Edit Links" button is visible | | |

**Admin Entity ID**: _____________  
**Member Entity ID**: _____________  
**Notes**: _____________

---

### TC-10. Edit Links Dialog — Membership Detail

| Test Case | Admin (Pass/Fail) | Non-Admin Member (Pass/Fail) |
|---|---|---|
| Click "Edit Links" — dialog opens without errors | | |
| All entity category tabs/sections are visible | | |
| Multi-select lists load with available entities | | |
| Admin sees all entities; member sees only own entities | | |
| Pre-existing links are correctly pre-selected | | |
| Save changes — mutation completes without errors | | |
| Re-open dialog — saved links persist correctly | | |
| Dialog can be closed without errors | | |

**Notes**: _____________

---

### TC-11. Edit Links Dialog — Publishing Work Detail

| Test Case | Admin (Pass/Fail) | Non-Admin Member (Pass/Fail) |
|---|---|---|
| Click "Edit Links" — dialog opens without errors | | |
| All entity category tabs/sections are visible | | |
| Multi-select lists load with available entities | | |
| Admin sees all entities; member sees only own entities | | |
| Pre-existing links are correctly pre-selected | | |
| Save changes — mutation completes without errors | | |
| Re-open dialog — saved links persist correctly | | |
| Dialog can be closed without errors | | |

**Notes**: _____________

---

### TC-12. Edit Links Dialog — Release Detail

| Test Case | Admin (Pass/Fail) | Non-Admin Member (Pass/Fail) |
|---|---|---|
| Click "Edit Links" — dialog opens without errors | | |
| All entity category tabs/sections are visible | | |
| Multi-select lists load with available entities | | |
| Admin sees all entities; member sees only own entities | | |
| Pre-existing links are correctly pre-selected | | |
| Save changes — mutation completes without errors | | |
| Re-open dialog — saved links persist correctly | | |
| Dialog can be closed without errors | | |

**Notes**: _____________

---

### TC-13. Edit Links Dialog — Recording Project Detail

| Test Case | Admin (Pass/Fail) | Non-Admin Member (Pass/Fail) |
|---|---|---|
| Click "Edit Links" — dialog opens without errors | | |
| All entity category tabs/sections are visible | | |
| Multi-select lists load with available entities | | |
| Admin sees all entities; member sees only own entities | | |
| Pre-existing links are correctly pre-selected | | |
| Save changes — mutation completes without errors | | |
| Re-open dialog — saved links persist correctly | | |
| Dialog can be closed without errors | | |

**Notes**: _____________

---

### TC-14. Edit Links Dialog — Artist Development Detail

| Test Case | Admin (Pass/Fail) | Non-Admin Member (Pass/Fail) |
|---|---|---|
| Click "Edit Links" — dialog opens without errors | | |
| All five entity category tabs/sections are visible | | |
| Multi-select lists load with available entities | | |
| Admin sees all entities; member sees only own entities | | |
| Pre-existing links are correctly pre-selected | | |
| Save changes — mutation completes without errors | | |
| Re-open dialog — saved links persist correctly | | |
| Dialog can be closed without errors | | |

**Notes**: _____________

---

### TC-15. Console Error Review

| Test Case | Admin (Pass/Fail) | Non-Admin Member (Pass/Fail) |
|---|---|---|
| No undefined/null access errors in browser console | | |
| No React rendering errors in browser console | | |
| No failed backend query/mutation errors in browser console | | |
| No authentication/authorization errors in browser console | | |

**Console Errors Observed (Admin)**: _____________  
**Console Errors Observed (Non-Admin Member)**: _____________

---

## Overall Test Outcome

| Role | Outcome |
|---|---|
| Admin | PASS / FAIL |
| Non-Admin Approved Member | PASS / FAIL |
| **Overall Step 10C Result** | **PASS / FAIL** |

**Final Notes / Issues Encountered**:

_____________

---

## Post-Test Actions

After completing the smoke test for both roles:

1. **Complete the session log**: Fill in all entity IDs, console output, and failure details in `frontend/SMOKE_TEST_STEP_10C_SESSION_LOG.md`
2. **Record evidence in ROLLOUT_STEPS.md**: Fill in the Step 10C Evidence Fields with deployment timestamp, verification timestamp, and overall test outcome
3. **Mark overall result**: PASS (all test cases completed successfully for both roles) or FAIL (one or more failures documented)
4. **If PASS**: Proceed to Step 11 (Post-Launch Refinements)
5. **If FAIL**: Document all failures, assess rollback options, and resolve issues before re-running the smoke test

---

## References

- Rollout steps: `frontend/ROLLOUT_STEPS.md` — Step 10C
- Mainnet smoke test (all sections): `frontend/SMOKE_TEST_STEP_10_MAINNET.md`
- Session log template: `frontend/SMOKE_TEST_STEP_10C_SESSION_LOG.md`
- Prior smoke test format: `frontend/SMOKE_TEST_21_7.md`
- Prior session log format: `frontend/SMOKE_TEST_21_7_SESSION_LOG.md`
