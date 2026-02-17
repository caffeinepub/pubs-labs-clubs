# Rollout 21.7 Post-Upgrade Smoke Test Checklist

This document provides a concise smoke test checklist for verifying the Higgins Music Hub application after the rollout 21.7 build/upgrade deployment.

## Purpose

Confirm that the frontend loads successfully, navigation works, and key portal detail routes render without runtime crashes after the canister upgrade. This rollout focuses on verifying that all five detail routes and "Edit Links" dialogs work correctly for **both admin and non-admin approved member roles**, and that the authorization components (AuthGate and ApprovalGate) function correctly post-upgrade.

## Prerequisites

- Canister upgrade deployment completed successfully
- At least one admin user exists and can authenticate
- At least one non-admin approved member exists and can authenticate
- Sample data exists for all five entity types (memberships, publishing works, releases, recording projects, artist development)

## Important: Test with Both Roles

**This smoke test MUST be run twice:**
1. **First run**: Complete all steps as an **admin user**
2. **Second run**: Complete all steps as a **non-admin approved member**

Record the exact principal IDs used for both test users in the results template.

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
- [ ] AuthGate allows authenticated user through (blocks unauthenticated users)

**ApprovalGate Verification:**
- [ ] **For admin users**: ApprovalGate allows admin user through (admins are always approved)
- [ ] **For non-admin approved members**: ApprovalGate allows approved member through
- [ ] Portal layout renders correctly (sidebar, header, main content area)

### 3. Portal Detail Routes Load

Test that each of the five detail routes loads without runtime errors. **Record the exact entity ID used for each route in the results template.**

#### Membership Detail (`/portal/memberships/$id`)
- [ ] Navigate to a membership detail page
- [ ] Page renders without runtime errors
- [ ] Profile information displays correctly
- [ ] Related Records section renders
- [ ] "Edit Links" button is visible
- [ ] **Record entity ID used**: _____________

#### Publishing Work Detail (`/portal/publishing/$id`)
- [ ] Navigate to a publishing work detail page
- [ ] Page renders without runtime errors
- [ ] Work details display correctly
- [ ] Related Records section renders
- [ ] "Edit Links" button is visible
- [ ] **Record entity ID used**: _____________

#### Release Detail (`/portal/releases/$id`)
- [ ] Navigate to a release detail page
- [ ] Page renders without runtime errors
- [ ] Release information displays correctly
- [ ] Related Records section renders
- [ ] "Edit Links" button is visible
- [ ] **Record entity ID used**: _____________

#### Recording Project Detail (`/portal/recordings/$id`)
- [ ] Navigate to a recording project detail page
- [ ] Page renders without runtime errors
- [ ] Project details display correctly
- [ ] Related Records section renders
- [ ] "Edit Links" button is visible
- [ ] **Record entity ID used**: _____________

#### Artist Development Detail (`/portal/artists/$id`)
- [ ] Navigate to an artist development detail page
- [ ] Page renders without runtime errors
- [ ] Artist information displays correctly
- [ ] Related Records section renders
- [ ] "Edit Links" button is visible
- [ ] **Record entity ID used**: _____________

### 4. Edit Links Dialog Opens

For each of the five detail routes above, verify the "Edit Links" dialog opens without errors:

- [ ] Click "Edit Links" button on Membership Detail
- [ ] Dialog opens without errors
- [ ] Entity selection lists render correctly
- [ ] Can close dialog without errors

- [ ] Click "Edit Links" button on Publishing Work Detail
- [ ] Dialog opens without errors
- [ ] Entity selection lists render correctly
- [ ] Can close dialog without errors

- [ ] Click "Edit Links" button on Release Detail
- [ ] Dialog opens without errors
- [ ] Entity selection lists render correctly
- [ ] Can close dialog without errors

- [ ] Click "Edit Links" button on Recording Project Detail
- [ ] Dialog opens without errors
- [ ] Entity selection lists render correctly
- [ ] Can close dialog without errors

- [ ] Click "Edit Links" button on Artist Development Detail
- [ ] Dialog opens without errors
- [ ] Entity selection lists render correctly (all 5 relationship types)
- [ ] Can close dialog without errors

### 5. Console Error Check

- [ ] Open browser developer console
- [ ] Review console output during smoke test
- [ ] **No frontend console errors related to undefined/null access**
- [ ] **If errors exist, record exact error text and stack trace in results template**

### 6. Backend Runtime Trap Check

- [ ] Review backend logs (if available)
- [ ] **No backend runtime traps occurred during smoke test**
- [ ] **If traps exist, record exact trap message in results template**

### 7. Router Error Handling Verification

- [ ] Verify router-level error boundaries are configured (check App.tsx)
- [ ] If possible, trigger a controlled error (e.g., navigate to invalid entity ID)
- [ ] Confirm error renders as in-app error screen (not full SPA crash)
- [ ] Error screen displays helpful message and allows navigation back

## Failure Documentation

**If any step fails, document the following in the results template:**
- **Route**: Which detail route failed (e.g., `/portal/memberships/$id`)
- **User Role**: Admin or non-admin approved member
- **Exact Error Text**: Copy the full error message from console
- **Stack Trace**: Copy the full stack trace if available
- **Steps to Reproduce**: Exact steps that led to the failure

## Completion

- [ ] All steps completed for **admin user**
- [ ] All steps completed for **non-admin approved member**
- [ ] All results recorded in `frontend/UPGRADE_LINKING_VERIFICATION_RESULTS.md`
- [ ] Any failures documented with full details (route, role, error text, stack trace)
