# Rollout 21.3–21.4 Post-Upgrade Smoke Test Checklist

This document provides a concise smoke test checklist for verifying the Higgins Music Hub application after the rollout 21.3–21.4 build/upgrade deployment.

## Purpose

Confirm that the frontend loads successfully, navigation works, and key portal detail routes render without runtime crashes after the canister upgrade. This rollout focuses on hardening the frontend for upgrade resilience and verifying that all five detail routes and "Edit Links" dialogs work correctly for both admin and non-admin approved member roles.

## Prerequisites

- Canister upgrade deployment completed successfully
- At least one admin user exists and can authenticate
- At least one non-admin approved member exists
- Sample data exists for all five entity types

## Smoke Test Steps

### 1. Landing Page Load

- [ ] Navigate to `/` (landing page)
- [ ] Page loads without errors
- [ ] No console errors or warnings
- [ ] Login button is visible and functional

### 2. Authentication & Portal Access

- [ ] Click login button
- [ ] Internet Identity authentication flow completes successfully
- [ ] User is redirected to portal after login
- [ ] AuthGate allows authenticated users through
- [ ] ApprovalGate allows approved users through
- [ ] Portal layout renders correctly (sidebar, header, main content area)

### 3. Portal Detail Routes Load (Admin User)

Test that each of the five detail routes loads without runtime errors:

#### Membership Detail (`/portal/memberships/$id`)
- [ ] Navigate to a membership detail page
- [ ] Page renders without runtime errors
- [ ] Profile information displays correctly
- [ ] Related Records section renders
- [ ] "Edit Links" button is visible

#### Publishing Work Detail (`/portal/publishing/$id`)
- [ ] Navigate to a publishing work detail page
- [ ] Page renders without runtime errors
- [ ] Work details display correctly
- [ ] Related Records section renders
- [ ] "Edit Links" button is visible

#### Release Detail (`/portal/releases/$id`)
- [ ] Navigate to a release detail page
- [ ] Page renders without runtime errors
- [ ] Release information displays correctly
- [ ] Related Records section renders
- [ ] "Edit Links" button is visible

#### Recording Project Detail (`/portal/recordings/$id`)
- [ ] Navigate to a recording project detail page
- [ ] Page renders without runtime errors
- [ ] Project details display correctly
- [ ] Related Records section renders
- [ ] "Edit Links" button is visible

#### Artist Development Detail (`/portal/artists/$id`)
- [ ] Navigate to an artist development detail page
- [ ] Page renders without runtime errors
- [ ] Artist information displays correctly
- [ ] Related Records section renders
- [ ] "Edit Links" button is visible

### 4. Edit Links Dialog Opens (Admin User)

For each of the five detail routes above:

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

### 5. Portal Detail Routes Load (Non-Admin Approved Member)

- [ ] Log out admin user
- [ ] Log in as non-admin approved member
- [ ] Navigate to own membership detail page - loads without errors
- [ ] Navigate to own publishing work detail page - loads without errors
- [ ] Navigate to own release detail page - loads without errors
- [ ] Navigate to own recording project detail page - loads without errors
- [ ] Navigate to own artist development detail page - loads without errors

### 6. Edit Links Dialog Opens (Non-Admin Approved Member)

For the member's own records:

- [ ] Click "Edit Links" on own membership - dialog opens without errors
- [ ] Click "Edit Links" on own publishing work - dialog opens without errors
- [ ] Click "Edit Links" on own release - dialog opens without errors
- [ ] Click "Edit Links" on own recording project - dialog opens without errors
- [ ] Click "Edit Links" on own artist development - dialog opens without errors

### 7. No Runtime Traps or Crashes

- [ ] No backend runtime traps occurred during any of the above tests
- [ ] No frontend console errors related to undefined/null array access
- [ ] No "Cannot read property of undefined" errors
- [ ] No infinite loading states or frozen UI
- [ ] All React Query operations complete successfully

### 8. Router-Level Error Handling

- [ ] Router error boundaries are active
- [ ] Errors display in-app error screens (not full app crashes)
- [ ] Error messages are user-friendly and actionable
- [ ] Can recover from errors using "Try Again" buttons

## Expected Outcomes

- **Landing page loads**: No errors, authentication works
- **Portal access**: AuthGate and ApprovalGate function correctly
- **All five detail routes render**: No runtime crashes or undefined errors
- **Edit Links dialogs open**: All dialogs initialize without errors for both admin and member roles
- **No runtime traps**: Backend operations complete successfully
- **Upgrade-safe behavior**: Array normalization and defensive null checks prevent crashes when data shapes change
- **Error boundaries work**: Router-level errors are caught and displayed gracefully

## Recording Results

Document all test outcomes in `frontend/UPGRADE_LINKING_VERIFICATION_RESULTS.md` under the "Rollout 21.3–21.4 Smoke Test Results" section.

## Failure Response

If any smoke test step fails:

1. Document the exact error message and stack trace
2. Note which route/component/operation failed
3. Check browser console for additional error details
4. Check backend canister logs for runtime traps
5. Verify canister upgrade completed successfully
6. Report findings for immediate investigation

## Success Criteria

All checklist items above must pass for the rollout 21.3–21.4 deployment to be considered successful.

---

## Notes Section

**Date of Test**: _________________

**Tester**: _________________

**Canister Version**: _________________

**Admin Principal**: _________________

**Non-Admin Member Principal**: _________________

### Deviations/Issues Encountered

(Document any deviations from expected behavior, including route, role, and exact error text/stack trace)

