# Step 9 — Verify Upgrade-Safe Related-Record Linking (Manual QA)

This document provides a manual verification checklist for post-upgrade related-record linking functionality across all detail pages in the Higgins Music Hub application.

## Overview

After a canister upgrade, verify that the "Edit Links" flow works correctly for both admin and non-admin member roles across all supported entity detail pages.

**Important**: Before beginning testing, perform a canister upgrade to ensure you are testing the upgrade-safe behavior. Record your test results in `frontend/UPGRADE_LINKING_VERIFICATION_RESULTS.md`.

**Rollout 21.1–21.2 Note**: For the rollout 21.1–21.2 deployment, first complete the concise smoke test checklist in `frontend/SMOKE_TEST_21_1_21_2.md` to verify basic functionality, then proceed with this comprehensive verification if the smoke test passes.

## Prerequisites

- **Canister upgrade must be performed before testing begins**
- At least one admin user exists
- At least one non-admin approved member exists
- Sample data exists for each entity type (Membership, Publishing Work, Release, Recording Project, Artist Development)

## Portal Routes

The following five detail routes are tested in this verification:

1. `/portal/memberships/$id` — Membership Detail
2. `/portal/publishing/$id` — Publishing Work Detail
3. `/portal/releases/$id` — Release Detail
4. `/portal/recordings/$id` — Recording Project Detail
5. `/portal/artists/$id` — Artist Development Detail

## Entity Category Labels

The "Edit Links" dialog and Related Records section use the following labels:

- **Memberships** — Member profiles and accounts
- **Artist Development** — Artist CRM and development plans
- **Publishing Works** — Songs, compositions, and publishing catalog
- **Releases** — Albums, EPs, singles, and label releases
- **Recording Projects** — Studio sessions and recording projects

## Verification Steps

### 1. Membership Detail Page (`/portal/memberships/$id`)

#### Admin User
- [ ] Navigate to a membership detail page
- [ ] Page loads without runtime errors
- [ ] "Edit Links" button is visible
- [ ] Click "Edit Links" - dialog opens
- [ ] Dialog shows all available entities (Artist Development, Publishing Works, Releases, Recording Projects)
- [ ] Pre-existing links are pre-selected in the dialog
- [ ] Select/deselect entities and click "Save Changes"
- [ ] Save succeeds without errors
- [ ] Related Records section updates immediately to reflect saved links
- [ ] **Refresh page - links persist correctly**

#### Non-Admin Member
- [ ] Navigate to own membership detail page
- [ ] Page loads without authorization errors
- [ ] "Edit Links" button is visible
- [ ] Click "Edit Links" - dialog opens
- [ ] Dialog shows only entities owned by the member (from `getEntitiesForCaller`)
- [ ] Pre-existing links are pre-selected in the dialog
- [ ] Select/deselect entities and click "Save Changes"
- [ ] Save succeeds without errors
- [ ] Related Records section updates immediately to reflect saved links
- [ ] **Refresh page - links persist correctly**

### 2. Publishing Work Detail Page (`/portal/publishing/$id`)

#### Admin User
- [ ] Navigate to a publishing work detail page
- [ ] Page loads without runtime errors
- [ ] "Edit Links" button is visible
- [ ] Click "Edit Links" - dialog opens
- [ ] Dialog shows all available entities (Memberships, Artist Development, Releases, Recording Projects)
- [ ] Pre-existing links are pre-selected in the dialog
- [ ] Select/deselect entities and click "Save Changes"
- [ ] Save succeeds without errors
- [ ] Related Records section updates immediately to reflect saved links
- [ ] **Refresh page - links persist correctly**

#### Non-Admin Member
- [ ] Navigate to own publishing work detail page
- [ ] Page loads without authorization errors
- [ ] "Edit Links" button is visible
- [ ] Click "Edit Links" - dialog opens
- [ ] Dialog shows only entities owned by the member (from `getEntitiesForCaller`)
- [ ] Pre-existing links are pre-selected in the dialog
- [ ] Select/deselect entities and click "Save Changes"
- [ ] Save succeeds without errors
- [ ] Related Records section updates immediately to reflect saved links
- [ ] **Refresh page - links persist correctly**

### 3. Release Detail Page (`/portal/releases/$id`)

#### Admin User
- [ ] Navigate to a release detail page
- [ ] Page loads without runtime errors
- [ ] "Edit Links" button is visible
- [ ] Click "Edit Links" - dialog opens
- [ ] Dialog shows all available entities (Memberships, Artist Development, Publishing Works, Recording Projects)
- [ ] Pre-existing links are pre-selected in the dialog
- [ ] Select/deselect entities and click "Save Changes"
- [ ] Save succeeds without errors
- [ ] Related Records section updates immediately to reflect saved links
- [ ] **Refresh page - links persist correctly**

#### Non-Admin Member
- [ ] Navigate to own release detail page
- [ ] Page loads without authorization errors
- [ ] "Edit Links" button is visible
- [ ] Click "Edit Links" - dialog opens
- [ ] Dialog shows only entities owned by the member (from `getEntitiesForCaller`)
- [ ] Pre-existing links are pre-selected in the dialog
- [ ] Select/deselect entities and click "Save Changes"
- [ ] Save succeeds without errors
- [ ] Related Records section updates immediately to reflect saved links
- [ ] **Refresh page - links persist correctly**

### 4. Recording Project Detail Page (`/portal/recordings/$id`)

#### Admin User
- [ ] Navigate to a recording project detail page
- [ ] Page loads without runtime errors
- [ ] "Edit Links" button is visible
- [ ] Click "Edit Links" - dialog opens
- [ ] Dialog shows all available entities (Memberships, Artist Development, Publishing Works, Releases)
- [ ] Pre-existing links are pre-selected in the dialog
- [ ] Select/deselect entities and click "Save Changes"
- [ ] Save succeeds without errors
- [ ] Related Records section updates immediately to reflect saved links
- [ ] **Refresh page - links persist correctly**

#### Non-Admin Member
- [ ] Navigate to own recording project detail page
- [ ] Page loads without authorization errors
- [ ] "Edit Links" button is visible
- [ ] Click "Edit Links" - dialog opens
- [ ] Dialog shows only entities owned by the member (from `getEntitiesForCaller`)
- [ ] Pre-existing links are pre-selected in the dialog
- [ ] Select/deselect entities and click "Save Changes"
- [ ] Save succeeds without errors
- [ ] Related Records section updates immediately to reflect saved links
- [ ] **Refresh page - links persist correctly**

### 5. Artist Development Detail Page (`/portal/artists/$id`)

#### Admin User
- [ ] Navigate to an artist development detail page
- [ ] Page loads without runtime errors
- [ ] "Edit Links" button is visible
- [ ] Click "Edit Links" - dialog opens
- [ ] Dialog shows all available entities (Memberships, Artist Development, Publishing Works, Releases, Recording Projects)
- [ ] Pre-existing links are pre-selected in the dialog (all 5 relationship types)
- [ ] Select/deselect entities and click "Save Changes"
- [ ] Save succeeds without errors
- [ ] Related Records section updates immediately to reflect saved links
- [ ] **Refresh page - links persist correctly**

#### Non-Admin Member
- [ ] Navigate to own artist development detail page
- [ ] Page loads without authorization errors
- [ ] "Edit Links" button is visible
- [ ] Click "Edit Links" - dialog opens
- [ ] Dialog shows only entities owned by the member (from `getEntitiesForCaller`)
- [ ] Pre-existing links are pre-selected in the dialog (all 5 relationship types)
- [ ] Select/deselect entities and click "Save Changes"
- [ ] Save succeeds without errors
- [ ] Related Records section updates immediately to reflect saved links
- [ ] **Refresh page - links persist correctly**

## Expected Outcomes

### For All Pages and Roles:
- No runtime errors or crashes when loading detail pages after upgrade
- "Edit Links" dialogs open without errors
- Pre-existing links are correctly pre-selected in dialogs
- Save operations complete successfully
- Related Records sections update immediately after save
- Links persist correctly after page refresh
- No console errors related to undefined/null array access

### Role-Specific Expectations:
- **Admin users**: See all entities in "Edit Links" dialogs (from admin-only queries)
- **Non-admin members**: See only their own entities in "Edit Links" dialogs (from `getEntitiesForCaller`)

## Common Issues to Watch For

1. **Undefined array errors**: If array normalization is not working, you may see "Cannot read property 'map' of undefined" errors
2. **Dialog initialization failures**: If selected IDs are not normalized, dialogs may fail to open
3. **Missing pre-selections**: If existing links are not properly normalized, they may not appear as pre-selected
4. **Authorization errors**: Non-admin members should not see authorization errors when viewing their own records

## Recording Results

Document all test outcomes in `frontend/UPGRADE_LINKING_VERIFICATION_RESULTS.md`. Include:
- Date and time of testing
- Canister version tested
- Test user principals (admin and member)
- Pass/fail status for each checklist item
- Any errors or issues encountered
- Screenshots or console logs if applicable

## Rollout 21.1–21.2 Integration

For the rollout 21.1–21.2 deployment:
1. First complete the smoke test in `frontend/SMOKE_TEST_21_1_21_2.md`
2. If smoke test passes, proceed with this comprehensive verification
3. Record all results in `frontend/UPGRADE_LINKING_VERIFICATION_RESULTS.md` under both the smoke test section and the comprehensive verification section
4. Ensure router-level error handling is working correctly (errors should display in-app error screens, not crash the entire application)
