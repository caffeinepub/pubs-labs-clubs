# Step 9 — Verify Upgrade-Safe Related-Record Linking (Manual QA)

This document provides a manual verification checklist for post-upgrade related-record linking functionality across all detail pages in the Higgins Music Hub application.

## Overview

After a canister upgrade, verify that the "Edit Links" flow works correctly for both admin and non-admin member roles across all supported entity detail pages.

## Prerequisites

- Canister has been upgraded successfully
- At least one admin user exists
- At least one non-admin approved member exists
- Sample data exists for each entity type (Membership, Publishing Work, Release, Recording Project, Artist Development)

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
- [ ] Refresh page - links persist correctly

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
- [ ] Refresh page - links persist correctly

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
- [ ] Refresh page - links persist correctly

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
- [ ] Refresh page - links persist correctly

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
- [ ] Refresh page - links persist correctly

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
- [ ] Refresh page - links persist correctly

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
- [ ] Refresh page - links persist correctly

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
- [ ] Refresh page - links persist correctly

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
- [ ] Refresh page - links persist correctly

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
- [ ] Refresh page - links persist correctly

## Expected Outcomes

### For All Pages and Roles:
- No runtime errors or crashes when loading detail pages
- "Edit Links" button is visible for authorized users (owners or admins)
- Dialog opens without errors and displays correct entity categories
- Pre-existing links are correctly pre-selected in the dialog
- Save operation completes successfully
- Related Records section updates immediately after save
- Links persist correctly after page refresh

### Role-Specific Expectations:
- **Admin users**: See all entities in the system in the "Edit Links" dialog
- **Non-admin members**: See only their own entities (from `getEntitiesForCaller`) in the "Edit Links" dialog
- **Non-admin members**: Cannot edit links on entities they don't own

## Troubleshooting

### Dialog doesn't open or shows loading indefinitely
- Check browser console for errors
- Verify `useLinkableEntityOptions` hook is fetching data correctly
- Ensure actor is initialized and queries are enabled

### Pre-existing links not pre-selected
- Verify linked ID arrays are being normalized correctly in detail page components
- Check that `normalizeToArray` is being used on all linked ID props passed to `EditRelatedDialog`

### Save fails with authorization error
- Verify user has permission to edit the entity (owner or admin)
- Check that the correct mutation is being called with proper parameters

### Related Records section doesn't update after save
- Verify React Query cache invalidation is working
- Check that the mutation's `onSuccess` callback is invalidating the correct query keys

### Links don't persist after refresh
- Verify backend mutation is actually saving the data
- Check that the detail query is refetching after invalidation
- Ensure linked ID arrays are being normalized when reading from backend response

## Notes

- All user-facing text uses "Edit Links" (not "Edit Related Records" or "Manage Links")
- Entity categories are labeled as: "Memberships", "Artist Development", "Publishing Works", "Releases", "Recording Projects"
- Non-admin users rely exclusively on `getEntitiesForCaller` for both viewing and editing links
- All array normalization uses the shared `normalizeToArray` utility from `utils/arrays.ts`
