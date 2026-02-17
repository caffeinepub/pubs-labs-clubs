# Rollout 21.7 Post-Upgrade Smoke Test Checklist

This document provides a concise smoke test checklist for verifying the Higgins Music Hub application after the rollout 21.7 build/upgrade deployment.

## Purpose

Confirm that the frontend loads successfully, navigation works, and key portal detail routes render without runtime crashes after the canister upgrade. This rollout focuses on verifying that all five detail routes and "Edit Links" dialogs work correctly for **both admin and non-admin approved member roles**, and that the authorization components (AuthGate and ApprovalGate) function correctly post-upgrade.

## Session Log Reference

**Use the detailed session log template** (`frontend/SMOKE_TEST_21_7_SESSION_LOG.md`) to capture per-role notes, exact entity IDs, console output, and failure details while executing this checklist.

## Prerequisites

- Canister upgrade deployment completed successfully (see `ROLL_OUT_21_7_EXECUTION_LOG.md`)
- At least one admin user exists and can authenticate
- At least one non-admin approved member exists and can authenticate
- Sample data exists for all five entity types (memberships, publishing works, releases, recording projects, artist development)

## Important: Test with Both Roles

**This smoke test MUST be run twice:**
1. **First run**: Complete all steps as an **admin user**
2. **Second run**: Complete all steps as a **non-admin approved member**

Record the exact principal IDs used for both test users in the session log and results template.

## Smoke Test Steps

### 1. Landing Page Load

- [ ] Navigate to `/` (landing page)
- [ ] Page loads without errors
- [ ] No console errors or warnings
- [ ] Login button is visible and functional

### 2. Authentication & Portal Access

**AuthGate Verification:**
- [ ] Click login button
- [ ] Internet Identity authentication flow completes successfully
- [ ] User is redirected to portal after login
- [ ] **AuthGate check**: Authenticated user is allowed through (unauthenticated users are blocked)

**ApprovalGate Verification:**
- [ ] **For admin users**: ApprovalGate allows admin user through (admins are always approved)
- [ ] **For non-admin approved members**: ApprovalGate allows approved member through
- [ ] Portal layout renders correctly (sidebar, header, main content area)

### 3. Portal Detail Routes Load

Test that each of the five detail routes loads without runtime errors. **Record the exact entity ID used for each route in the session log (`SMOKE_TEST_21_7_SESSION_LOG.md`).**

#### Membership Detail (`/portal/memberships/$id`)
- [ ] Navigate to a membership detail page
- [ ] Page renders without runtime errors
- [ ] Profile information displays correctly
- [ ] Related Records section renders
- [ ] "Edit Links" button is visible
- [ ] **Record entity ID in session log**

#### Publishing Work Detail (`/portal/publishing/$id`)
- [ ] Navigate to a publishing work detail page
- [ ] Page renders without runtime errors
- [ ] Work details display correctly
- [ ] Related Records section renders
- [ ] "Edit Links" button is visible
- [ ] **Record entity ID in session log**

#### Release Detail (`/portal/releases/$id`)
- [ ] Navigate to a release detail page
- [ ] Page renders without runtime errors
- [ ] Release information displays correctly
- [ ] Related Records section renders
- [ ] "Edit Links" button is visible
- [ ] **Record entity ID in session log**

#### Recording Project Detail (`/portal/recordings/$id`)
- [ ] Navigate to a recording project detail page
- [ ] Page renders without runtime errors
- [ ] Project details display correctly
- [ ] Related Records section renders
- [ ] "Edit Links" button is visible
- [ ] **Record entity ID in session log**

#### Artist Development Detail (`/portal/artists/$id`)
- [ ] Navigate to an artist development detail page
- [ ] Page renders without runtime errors
- [ ] Artist development information displays correctly
- [ ] Related Records section renders
- [ ] "Edit Links" button is visible
- [ ] **Record entity ID in session log**

### 4. Edit Links Dialog Verification

Test that the "Edit Links" dialog opens successfully on each of the five detail routes.

- [ ] Open "Edit Links" dialog on Membership Detail
- [ ] Dialog renders without errors
- [ ] Entity selection lists load correctly
- [ ] Close dialog

- [ ] Open "Edit Links" dialog on Publishing Work Detail
- [ ] Dialog renders without errors
- [ ] Entity selection lists load correctly
- [ ] Close dialog

- [ ] Open "Edit Links" dialog on Release Detail
- [ ] Dialog renders without errors
- [ ] Entity selection lists load correctly
- [ ] Close dialog

- [ ] Open "Edit Links" dialog on Recording Project Detail
- [ ] Dialog renders without errors
- [ ] Entity selection lists load correctly
- [ ] Close dialog

- [ ] Open "Edit Links" dialog on Artist Development Detail
- [ ] Dialog renders without errors
- [ ] Entity selection lists load correctly
- [ ] Close dialog

### 5. Console Error Review

**Critical**: Review the browser developer console throughout the smoke test.

- [ ] Open browser developer console (F12)
- [ ] Monitor console output during all smoke test steps
- [ ] **Check for undefined/null access errors**
- [ ] **Check for React rendering errors**
- [ ] **Check for backend query/mutation errors**
- [ ] **If errors exist, capture exact error text and stack trace in session log**

### 6. Router Error Handling Verification

Test that router-level error boundaries function correctly.

- [ ] Navigate to an invalid entity ID (e.g., `/portal/memberships/invalid-id-999`)
- [ ] **Verify**: Error renders as an in-app error screen (not a full SPA crash)
- [ ] **Verify**: Error screen displays a helpful message
- [ ] **Verify**: User can navigate back to a valid route
- [ ] **Record outcome in session log**

### 7. Logout and Role Switch

- [ ] Log out current user
- [ ] **If testing as admin**: Switch to non-admin approved member and repeat steps 2-6
- [ ] **If testing as non-admin member**: Smoke test is complete

---

## Post-Test Documentation

After completing the smoke test for both roles:

1. **Complete the session log**: Fill in all entity IDs, console output, and failure details in `frontend/SMOKE_TEST_21_7_SESSION_LOG.md`
2. **Complete the results template**: Document all outcomes in `frontend/UPGRADE_LINKING_VERIFICATION_RESULTS.md` under "Rollout 21.7 Smoke Test Results"
3. **Mark overall result**: PASS (all steps completed successfully) or FAIL (one or more failures documented)

---

## Acceptance Criteria

- [ ] All smoke test steps completed for both admin and non-admin approved member roles
- [ ] No runtime traps occurred on backend startup
- [ ] Landing page loads successfully
- [ ] AuthGate and ApprovalGate function correctly for both roles
- [ ] All five portal detail routes load without runtime crashes for both roles
- [ ] "Edit Links" dialog opens successfully on all five detail routes for both roles
- [ ] No frontend console errors related to undefined/null access
- [ ] Router-level error handling functions correctly (errors render as in-app error screens)
- [ ] All test results documented in session log and results template
