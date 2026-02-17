# Step 9 — Manual QA Results: Upgrade-Safe Related-Record Linking

This document records the results of manual QA testing performed after a canister upgrade to verify that the "Edit Links" functionality works correctly across all five entity detail pages for both admin and non-admin member roles.

## Test Environment

- **Date of Testing**: _________________
- **Tester Name**: _________________
- **Canister Version**: _________________
- **Upgrade Performed**: ☐ Yes ☐ No
- **Upgrade Date/Time**: _________________

## Test Users

- **Admin User Principal**: _________________
- **Non-Admin Member Principal**: _________________
- **Non-Admin Member Approval Status**: ☐ Approved ☐ Pending ☐ Rejected

## Pre-Test Verification

- ☐ Canister upgrade completed successfully without runtime traps
- ☐ Admin user can log in and access portal
- ☐ Non-admin member can log in and access portal
- ☐ Sample data exists for all five entity types

---

## Rollout 21.3–21.4 Smoke Test Results

### Test Environment
- **Rollout Version**: 21.3–21.4
- **Date of Smoke Test**: _________________
- **Canister Version**: _________________
- **Build Completed Successfully**: ☐ Yes ☐ No
- **Upgrade Completed Successfully**: ☐ Yes ☐ No
- **Platform Deployment Errors**: ☐ None ☐ Errors (describe below)

### Test Users
- **Admin User Principal**: _________________
- **Non-Admin Member Principal**: _________________
- **Non-Admin Member Approval Status**: ☐ Approved ☐ Pending ☐ Rejected

### 1. Landing Page Load
- ☐ Landing page (`/`) loads without errors
- ☐ No console errors or warnings
- ☐ Login button visible and functional

**Issues/Notes**:


### 2. Authentication & Portal Access
- ☐ Internet Identity authentication completes successfully
- ☐ User redirected to portal after login
- ☐ AuthGate allows authenticated users through
- ☐ ApprovalGate allows approved users through
- ☐ Portal layout renders correctly

**Issues/Notes**:


### 3. Portal Detail Routes Load (Admin User)
- ☐ Membership Detail (`/portal/memberships/$id`) renders without errors
- ☐ Publishing Work Detail (`/portal/publishing/$id`) renders without errors
- ☐ Release Detail (`/portal/releases/$id`) renders without errors
- ☐ Recording Project Detail (`/portal/recordings/$id`) renders without errors
- ☐ Artist Development Detail (`/portal/artists/$id`) renders without errors

**Issues/Notes**:


### 4. Edit Links Dialog Opens (Admin User)
- ☐ "Edit Links" dialog opens on Membership Detail without errors
- ☐ "Edit Links" dialog opens on Publishing Work Detail without errors
- ☐ "Edit Links" dialog opens on Release Detail without errors
- ☐ "Edit Links" dialog opens on Recording Project Detail without errors
- ☐ "Edit Links" dialog opens on Artist Development Detail without errors

**Issues/Notes**:


### 5. Portal Detail Routes Load (Non-Admin Approved Member)
- ☐ Own membership detail page loads without errors
- ☐ Own publishing work detail page loads without errors
- ☐ Own release detail page loads without errors
- ☐ Own recording project detail page loads without errors
- ☐ Own artist development detail page loads without errors

**Issues/Notes**:


### 6. Edit Links Dialog Opens (Non-Admin Approved Member)
- ☐ "Edit Links" dialog opens on own membership without errors
- ☐ "Edit Links" dialog opens on own publishing work without errors
- ☐ "Edit Links" dialog opens on own release without errors
- ☐ "Edit Links" dialog opens on own recording project without errors
- ☐ "Edit Links" dialog opens on own artist development without errors

**Issues/Notes**:


### 7. No Runtime Traps or Crashes
- ☐ No backend runtime traps occurred
- ☐ No frontend console errors related to undefined/null array access
- ☐ No "Cannot read property of undefined" errors
- ☐ No infinite loading states or frozen UI
- ☐ All React Query operations complete successfully

**Issues/Notes**:


### 8. Router-Level Error Handling
- ☐ Router error boundaries are active
- ☐ Errors display in-app error screens (not full app crashes)
- ☐ Error messages are user-friendly and actionable
- ☐ Can recover from errors using "Try Again" buttons

**Issues/Notes**:


### Overall Rollout 21.3–21.4 Result
- ☐ **PASS** — All smoke test steps passed
- ☐ **FAIL** — One or more smoke test steps failed (document issues above)

---

## Rollout 21.5–21.6 Smoke Test Results

### Test Environment
- **Rollout Version**: 21.5–21.6
- **Date of Smoke Test**: _________________
- **Canister Version**: _________________
- **Build Completed Successfully**: ☐ Yes ☐ No
- **Upgrade Completed Successfully**: ☐ Yes ☐ No
- **Platform Deployment Errors**: ☐ None ☐ Errors (describe below)

### Test Users
- **Admin User Principal**: _________________
- **Non-Admin Member Principal**: _________________
- **Non-Admin Member Approval Status**: ☐ Approved ☐ Pending ☐ Rejected

### 1. Landing Page Load
- ☐ Landing page (`/`) loads without errors
- ☐ No console errors or warnings
- ☐ Login button visible and functional

**Issues/Notes**:


### 2. Authentication & Portal Access
- ☐ Internet Identity authentication completes successfully
- ☐ User redirected to portal after login
- ☐ AuthGate allows authenticated users through
- ☐ ApprovalGate allows approved users through
- ☐ Portal layout renders correctly

**Issues/Notes**:


### 3. Portal Detail Routes Load (Admin User)
- ☐ Membership Detail (`/portal/memberships/$id`) renders without errors
- ☐ Publishing Work Detail (`/portal/publishing/$id`) renders without errors
- ☐ Release Detail (`/portal/releases/$id`) renders without errors
- ☐ Recording Project Detail (`/portal/recordings/$id`) renders without errors
- ☐ Artist Development Detail (`/portal/artists/$id`) renders without errors

**Issues/Notes**:


### 4. Edit Links Dialog Opens (Admin User)
- ☐ "Edit Links" dialog opens on Membership Detail without errors
- ☐ "Edit Links" dialog opens on Publishing Work Detail without errors
- ☐ "Edit Links" dialog opens on Release Detail without errors
- ☐ "Edit Links" dialog opens on Recording Project Detail without errors
- ☐ "Edit Links" dialog opens on Artist Development Detail without errors

**Issues/Notes**:


### 5. Portal Detail Routes Load (Non-Admin Approved Member)
- ☐ Own membership detail page loads without errors
- ☐ Own publishing work detail page loads without errors
- ☐ Own release detail page loads without errors
- ☐ Own recording project detail page loads without errors
- ☐ Own artist development detail page loads without errors

**Issues/Notes**:


### 6. Edit Links Dialog Opens (Non-Admin Approved Member)
- ☐ "Edit Links" dialog opens on own membership without errors
- ☐ "Edit Links" dialog opens on own publishing work without errors
- ☐ "Edit Links" dialog opens on own release without errors
- ☐ "Edit Links" dialog opens on own recording project without errors
- ☐ "Edit Links" dialog opens on own artist development without errors

**Issues/Notes**:


### 7. No Runtime Traps or Crashes
- ☐ No backend runtime traps occurred
- ☐ No frontend console errors related to undefined/null array access
- ☐ No "Cannot read property of undefined" errors
- ☐ No infinite loading states or frozen UI
- ☐ All React Query operations complete successfully

**Issues/Notes**:


### 8. Router-Level Error Handling
- ☐ Router error boundaries are active
- ☐ Errors display in-app error screens (not full app crashes)
- ☐ Error messages are user-friendly and actionable
- ☐ Can recover from errors using "Try Again" buttons

**Issues/Notes**:


### Overall Rollout 21.5–21.6 Result
- ☐ **PASS** — All smoke test steps passed
- ☐ **FAIL** — One or more smoke test steps failed (document issues above)

---

## Rollout 21.7 Smoke Test Results

### Test Environment
- **Rollout Version**: 21.7
- **Date of Smoke Test**: _________________
- **Canister Version**: _________________
- **Build Completed Successfully**: ☐ Yes ☐ No
- **Upgrade Completed Successfully**: ☐ Yes ☐ No
- **Platform Deployment Errors**: ☐ None ☐ Errors (describe below)

### Test Users
- **Admin User Principal**: _________________
- **Non-Admin Member Principal**: _________________
- **Non-Admin Member Approval Status**: ☐ Approved ☐ Pending ☐ Rejected

### 1. Landing Page Load
- ☐ Landing page (`/`) loads without errors
- ☐ No console errors or warnings
- ☐ Login button visible and functional

**Issues/Notes**:


### 2. Authentication & Portal Access
- ☐ Internet Identity authentication completes successfully
- ☐ User redirected to portal after login
- ☐ AuthGate allows authenticated users through
- ☐ ApprovalGate allows approved users through
- ☐ Portal layout renders correctly

**Issues/Notes**:


### 3. Portal Detail Routes Load (Admin User)
- ☐ Membership Detail (`/portal/memberships/$id`) renders without errors
- ☐ Publishing Work Detail (`/portal/publishing/$id`) renders without errors
- ☐ Release Detail (`/portal/releases/$id`) renders without errors
- ☐ Recording Project Detail (`/portal/recordings/$id`) renders without errors
- ☐ Artist Development Detail (`/portal/artists/$id`) renders without errors

**Issues/Notes**:


### 4. Edit Links Dialog Opens (Admin User)
- ☐ "Edit Links" dialog opens on Membership Detail without errors
- ☐ "Edit Links" dialog opens on Publishing Work Detail without errors
- ☐ "Edit Links" dialog opens on Release Detail without errors
- ☐ "Edit Links" dialog opens on Recording Project Detail without errors
- ☐ "Edit Links" dialog opens on Artist Development Detail without errors

**Issues/Notes**:


### 5. Portal Detail Routes Load (Non-Admin Approved Member)
- ☐ Own membership detail page loads without errors
- ☐ Own publishing work detail page loads without errors
- ☐ Own release detail page loads without errors
- ☐ Own recording project detail page loads without errors
- ☐ Own artist development detail page loads without errors

**Issues/Notes**:


### 6. Edit Links Dialog Opens (Non-Admin Approved Member)
- ☐ "Edit Links" dialog opens on own membership without errors
- ☐ "Edit Links" dialog opens on own publishing work without errors
- ☐ "Edit Links" dialog opens on own release without errors
- ☐ "Edit Links" dialog opens on own recording project without errors
- ☐ "Edit Links" dialog opens on own artist development without errors

**Issues/Notes**:


### 7. No Runtime Traps or Crashes
- ☐ No backend runtime traps occurred
- ☐ No frontend console errors related to undefined/null array access
- ☐ No "Cannot read property of undefined" errors
- ☐ No infinite loading states or frozen UI
- ☐ All React Query operations complete successfully

**Issues/Notes**:


### 8. Router-Level Error Handling
- ☐ Router error boundaries are active
- ☐ Errors display in-app error screens (not full app crashes)
- ☐ Error messages are user-friendly and actionable
- ☐ Can recover from errors using "Try Again" buttons

**Issues/Notes**:


### Overall Rollout 21.7 Result
- ☐ **PASS** — All smoke test steps passed
- ☐ **FAIL** — One or more smoke test steps failed (document issues above)

---

## Detailed Test Results (Admin User)

### Membership Detail Page (`/portal/memberships/$id`)

**Test Record ID**: _________________

#### Page Load
- ☐ Page loads without runtime errors
- ☐ Profile information displays correctly
- ☐ Related Records section renders
- ☐ "Edit Links" button is visible

#### Edit Links Dialog
- ☐ Dialog opens without errors
- ☐ All entity selection lists render correctly
- ☐ Pre-existing links are correctly pre-selected
- ☐ Can select/deselect entities
- ☐ Save operation completes successfully
- ☐ UI updates immediately after save
- ☐ Page refresh confirms link persistence

**Issues/Notes**:


---

### Publishing Work Detail Page (`/portal/publishing/$id`)

**Test Record ID**: _________________

#### Page Load
- ☐ Page loads without runtime errors
- ☐ Work details display correctly
- ☐ Related Records section renders
- ☐ "Edit Links" button is visible

#### Edit Links Dialog
- ☐ Dialog opens without errors
- ☐ All entity selection lists render correctly
- ☐ Pre-existing links are correctly pre-selected
- ☐ Can select/deselect entities
- ☐ Save operation completes successfully
- ☐ UI updates immediately after save
- ☐ Page refresh confirms link persistence

**Issues/Notes**:


---

### Release Detail Page (`/portal/releases/$id`)

**Test Record ID**: _________________

#### Page Load
- ☐ Page loads without runtime errors
- ☐ Release information displays correctly
- ☐ Related Records section renders
- ☐ "Edit Links" button is visible

#### Edit Links Dialog
- ☐ Dialog opens without errors
- ☐ All entity selection lists render correctly
- ☐ Pre-existing links are correctly pre-selected
- ☐ Can select/deselect entities
- ☐ Save operation completes successfully
- ☐ UI updates immediately after save
- ☐ Page refresh confirms link persistence

**Issues/Notes**:


---

### Recording Project Detail Page (`/portal/recordings/$id`)

**Test Record ID**: _________________

#### Page Load
- ☐ Page loads without runtime errors
- ☐ Project details display correctly
- ☐ Related Records section renders
- ☐ "Edit Links" button is visible

#### Edit Links Dialog
- ☐ Dialog opens without errors
- ☐ All entity selection lists render correctly
- ☐ Pre-existing links are correctly pre-selected
- ☐ Can select/deselect entities
- ☐ Save operation completes successfully
- ☐ UI updates immediately after save
- ☐ Page refresh confirms link persistence

**Issues/Notes**:


---

### Artist Development Detail Page (`/portal/artists/$id`)

**Test Record ID**: _________________

#### Page Load
- ☐ Page loads without runtime errors
- ☐ Artist information displays correctly
- ☐ Related Records section renders
- ☐ "Edit Links" button is visible

#### Edit Links Dialog
- ☐ Dialog opens without errors
- ☐ All entity selection lists render correctly (all 5 relationship types)
- ☐ Pre-existing links are correctly pre-selected
- ☐ Can select/deselect entities
- ☐ Save operation completes successfully
- ☐ UI updates immediately after save
- ☐ Page refresh confirms link persistence

**Issues/Notes**:


---

## Detailed Test Results (Non-Admin Member)

### Membership Detail Page (`/portal/memberships/$id`)

**Test Record ID**: _________________

#### Page Load
- ☐ Page loads without runtime errors
- ☐ Profile information displays correctly
- ☐ Related Records section renders
- ☐ "Edit Links" button is visible

#### Edit Links Dialog
- ☐ Dialog opens without errors
- ☐ Entity selection lists show only member's own entities
- ☐ Pre-existing links are correctly pre-selected
- ☐ Can select/deselect entities
- ☐ Save operation completes successfully
- ☐ UI updates immediately after save
- ☐ Page refresh confirms link persistence

**Issues/Notes**:


---

### Publishing Work Detail Page (`/portal/publishing/$id`)

**Test Record ID**: _________________

#### Page Load
- ☐ Page loads without runtime errors
- ☐ Work details display correctly
- ☐ Related Records section renders
- ☐ "Edit Links" button is visible

#### Edit Links Dialog
- ☐ Dialog opens without errors
- ☐ Entity selection lists show only member's own entities
- ☐ Pre-existing links are correctly pre-selected
- ☐ Can select/deselect entities
- ☐ Save operation completes successfully
- ☐ UI updates immediately after save
- ☐ Page refresh confirms link persistence

**Issues/Notes**:


---

### Release Detail Page (`/portal/releases/$id`)

**Test Record ID**: _________________

#### Page Load
- ☐ Page loads without runtime errors
- ☐ Release information displays correctly
- ☐ Related Records section renders
- ☐ "Edit Links" button is visible

#### Edit Links Dialog
- ☐ Dialog opens without errors
- ☐ Entity selection lists show only member's own entities
- ☐ Pre-existing links are correctly pre-selected
- ☐ Can select/deselect entities
- ☐ Save operation completes successfully
- ☐ UI updates immediately after save
- ☐ Page refresh confirms link persistence

**Issues/Notes**:


---

### Recording Project Detail Page (`/portal/recordings/$id`)

**Test Record ID**: _________________

#### Page Load
- ☐ Page loads without runtime errors
- ☐ Project details display correctly
- ☐ Related Records section renders
- ☐ "Edit Links" button is visible

#### Edit Links Dialog
- ☐ Dialog opens without errors
- ☐ Entity selection lists show only member's own entities
- ☐ Pre-existing links are correctly pre-selected
- ☐ Can select/deselect entities
- ☐ Save operation completes successfully
- ☐ UI updates immediately after save
- ☐ Page refresh confirms link persistence

**Issues/Notes**:


---

### Artist Development Detail Page (`/portal/artists/$id`)

**Test Record ID**: _________________

#### Page Load
- ☐ Page loads without runtime errors
- ☐ Artist information displays correctly
- ☐ Related Records section renders
- ☐ "Edit Links" button is visible

#### Edit Links Dialog
- ☐ Dialog opens without errors
- ☐ Entity selection lists show only member's own entities (all 5 relationship types)
- ☐ Pre-existing links are correctly pre-selected
- ☐ Can select/deselect entities
- ☐ Save operation completes successfully
- ☐ UI updates immediately after save
- ☐ Page refresh confirms link persistence

**Issues/Notes**:


---

## Overall Test Result

- ☐ **PASS** — All test cases passed for both admin and member roles
- ☐ **FAIL** — One or more test cases failed (document issues above)

### Summary of Issues Found

(List all issues discovered during testing, including severity, affected routes/components, and reproduction steps)


### Recommendations

(Document any recommendations for improvements, additional testing, or follow-up actions)


---

**Test Completed By**: _________________

**Date**: _________________

**Signature**: _________________
