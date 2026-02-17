# Step 10 Mainnet Post-Deployment Smoke Test Checklist

This document provides a comprehensive smoke test checklist for verifying the Higgins Music Hub application on the ICP mainnet after Step 10 deployment.

## Purpose

Confirm that the production system on mainnet loads successfully, authentication works correctly, and all key portal features function without errors. This smoke test verifies that the application is production-ready and accessible to real users.

## Test Environment

**Environment**: ICP Mainnet (Production)  
**Test Date**: _____________  
**Tester**: _____________

### Deployment Information

**Frontend URL**: _____________  
**Backend Canister ID**: _____________  
**Deployment Timestamp**: _____________

## Test User Information

Record the exact principals used for testing:

**Admin User**:
- **Principal ID**: _____________
- **Profile Name**: _____________
- **Email**: _____________

**Non-Admin Approved Member**:
- **Principal ID**: _____________
- **Profile Name**: _____________
- **Email**: _____________

## Important: Test with Both Roles

**This smoke test MUST be run twice:**
1. **First run**: Complete all steps as an **admin user**
2. **Second run**: Complete all steps as a **non-admin approved member**

## Smoke Test Steps

### 1. Landing Page Load

- [ ] Navigate to mainnet frontend URL
- [ ] Landing page (`/`) loads without errors
- [ ] Page renders correctly (hero image, branding, navigation)
- [ ] No console errors or warnings in browser developer tools
- [ ] Login button is visible and functional

**Notes**: _____________

---

### 2. Authentication Flow (Admin User)

**AuthGate Verification:**
- [ ] Click login button
- [ ] Internet Identity authentication flow initiates
- [ ] Internet Identity authentication completes successfully
- [ ] User is redirected to portal after login
- [ ] **AuthGate check**: Authenticated admin user is allowed through to portal
- [ ] Portal layout renders correctly (sidebar, header, main content area)

**ApprovalGate Verification:**
- [ ] **ApprovalGate check**: Admin user is allowed through (admins are always approved)
- [ ] Admin dashboard or portal home page loads successfully
- [ ] Admin-specific navigation items are visible (Dashboard, Role Assignment, Bootstrap)

**Admin Principal**: _____________  
**Admin Profile Name**: _____________

**Notes**: _____________

---

### 3. Authentication Flow (Non-Admin Approved Member)

- [ ] Log out admin user successfully
- [ ] Click login button
- [ ] Internet Identity authentication flow initiates
- [ ] Authenticate as non-admin approved member
- [ ] User is redirected to portal after login
- [ ] **AuthGate check**: Authenticated member is allowed through to portal
- [ ] **ApprovalGate check**: Approved member is allowed through
- [ ] Portal layout renders correctly
- [ ] Member sees only member-appropriate navigation items (no admin-only items)

**Member Principal**: _____________  
**Member Profile Name**: _____________

**Notes**: _____________

---

### 4. Portal Detail Routes (Admin User)

Test that each of the five detail routes loads without runtime errors. **Record the exact entity ID used for each route.**

#### Membership Detail (`/portal/memberships/$id`)

- [ ] Navigate to a membership detail page
- [ ] Page renders without runtime errors
- [ ] Profile information displays correctly
- [ ] Related Records section displays
- [ ] "Edit Links" button is visible

**Entity ID Tested**: _____________

**Notes**: _____________

#### Publishing Work Detail (`/portal/publishing/$id`)

- [ ] Navigate to a publishing work detail page
- [ ] Page renders without runtime errors
- [ ] Work information displays correctly
- [ ] Related Records section displays
- [ ] "Edit Links" button is visible

**Entity ID Tested**: _____________

**Notes**: _____________

#### Release Detail (`/portal/releases/$id`)

- [ ] Navigate to a release detail page
- [ ] Page renders without runtime errors
- [ ] Release information displays correctly
- [ ] Related Records section displays
- [ ] "Edit Links" button is visible

**Entity ID Tested**: _____________

**Notes**: _____________

#### Recording Project Detail (`/portal/recordings/$id`)

- [ ] Navigate to a recording project detail page
- [ ] Page renders without runtime errors
- [ ] Project information displays correctly
- [ ] Related Records section displays
- [ ] "Edit Links" button is visible

**Entity ID Tested**: _____________

**Notes**: _____________

#### Artist Development Detail (`/portal/artists/$id`)

- [ ] Navigate to an artist development detail page
- [ ] Page renders without runtime errors
- [ ] Artist information displays correctly
- [ ] Related Records section displays
- [ ] "Edit Links" button is visible

**Entity ID Tested**: _____________

**Notes**: _____________

---

### 5. Edit Links Dialog (Admin User)

Test that the "Edit Links" dialog opens successfully on each detail page.

#### Membership Detail — Edit Links

- [ ] Click "Edit Links" button on membership detail page
- [ ] Dialog opens without errors
- [ ] All five entity category tabs are visible (Artist Development, Publishing Works, Releases, Recording Projects)
- [ ] Multi-select lists load with available entities
- [ ] Admin sees all entities (not filtered by ownership)
- [ ] Pre-existing links are correctly pre-selected
- [ ] Dialog can be closed without errors

**Notes**: _____________

#### Publishing Work Detail — Edit Links

- [ ] Click "Edit Links" button on publishing work detail page
- [ ] Dialog opens without errors
- [ ] All five entity category tabs are visible
- [ ] Multi-select lists load with available entities
- [ ] Admin sees all entities
- [ ] Pre-existing links are correctly pre-selected
- [ ] Dialog can be closed without errors

**Notes**: _____________

#### Release Detail — Edit Links

- [ ] Click "Edit Links" button on release detail page
- [ ] Dialog opens without errors
- [ ] All five entity category tabs are visible
- [ ] Multi-select lists load with available entities
- [ ] Admin sees all entities
- [ ] Pre-existing links are correctly pre-selected
- [ ] Dialog can be closed without errors

**Notes**: _____________

#### Recording Project Detail — Edit Links

- [ ] Click "Edit Links" button on recording project detail page
- [ ] Dialog opens without errors
- [ ] All five entity category tabs are visible
- [ ] Multi-select lists load with available entities
- [ ] Admin sees all entities
- [ ] Pre-existing links are correctly pre-selected
- [ ] Dialog can be closed without errors

**Notes**: _____________

#### Artist Development Detail — Edit Links

- [ ] Click "Edit Links" button on artist development detail page
- [ ] Dialog opens without errors
- [ ] All five entity category tabs are visible
- [ ] Multi-select lists load with available entities
- [ ] Admin sees all entities
- [ ] Pre-existing links are correctly pre-selected
- [ ] Dialog can be closed without errors

**Notes**: _____________

---

### 6. Portal Detail Routes (Non-Admin Approved Member)

Test that each of the five detail routes loads without runtime errors for the non-admin member. **Record the exact entity ID used for each route.**

#### Membership Detail (`/portal/memberships/$id`)

- [ ] Navigate to member's own membership detail page
- [ ] Page renders without runtime errors
- [ ] Profile information displays correctly
- [ ] Related Records section displays
- [ ] "Edit Links" button is visible

**Entity ID Tested**: _____________

**Notes**: _____________

#### Publishing Work Detail (`/portal/publishing/$id`)

- [ ] Navigate to a publishing work owned by the member
- [ ] Page renders without runtime errors
- [ ] Work information displays correctly
- [ ] Related Records section displays
- [ ] "Edit Links" button is visible

**Entity ID Tested**: _____________

**Notes**: _____________

#### Release Detail (`/portal/releases/$id`)

- [ ] Navigate to a release owned by the member
- [ ] Page renders without runtime errors
- [ ] Release information displays correctly
- [ ] Related Records section displays
- [ ] "Edit Links" button is visible

**Entity ID Tested**: _____________

**Notes**: _____________

#### Recording Project Detail (`/portal/recordings/$id`)

- [ ] Navigate to a recording project owned by the member
- [ ] Page renders without runtime errors
- [ ] Project information displays correctly
- [ ] Related Records section displays
- [ ] "Edit Links" button is visible

**Entity ID Tested**: _____________

**Notes**: _____________

#### Artist Development Detail (`/portal/artists/$id`)

- [ ] Navigate to an artist development entry owned by the member
- [ ] Page renders without runtime errors
- [ ] Artist information displays correctly
- [ ] Related Records section displays
- [ ] "Edit Links" button is visible

**Entity ID Tested**: _____________

**Notes**: _____________

---

### 7. Edit Links Dialog (Non-Admin Approved Member)

Test that the "Edit Links" dialog opens successfully on each detail page for the non-admin member.

#### Membership Detail — Edit Links

- [ ] Click "Edit Links" button on membership detail page
- [ ] Dialog opens without errors
- [ ] All five entity category tabs are visible
- [ ] Multi-select lists load with available entities
- [ ] Member sees only their own entities (filtered by ownership)
- [ ] Pre-existing links are correctly pre-selected
- [ ] Dialog can be closed without errors

**Notes**: _____________

#### Publishing Work Detail — Edit Links

- [ ] Click "Edit Links" button on publishing work detail page
- [ ] Dialog opens without errors
- [ ] All five entity category tabs are visible
- [ ] Multi-select lists load with available entities
- [ ] Member sees only their own entities
- [ ] Pre-existing links are correctly pre-selected
- [ ] Dialog can be closed without errors

**Notes**: _____________

#### Release Detail — Edit Links

- [ ] Click "Edit Links" button on release detail page
- [ ] Dialog opens without errors
- [ ] All five entity category tabs are visible
- [ ] Multi-select lists load with available entities
- [ ] Member sees only their own entities
- [ ] Pre-existing links are correctly pre-selected
- [ ] Dialog can be closed without errors

**Notes**: _____________

#### Recording Project Detail — Edit Links

- [ ] Click "Edit Links" button on recording project detail page
- [ ] Dialog opens without errors
- [ ] All five entity category tabs are visible
- [ ] Multi-select lists load with available entities
- [ ] Member sees only their own entities
- [ ] Pre-existing links are correctly pre-selected
- [ ] Dialog can be closed without errors

**Notes**: _____________

#### Artist Development Detail — Edit Links

- [ ] Click "Edit Links" button on artist development detail page
- [ ] Dialog opens without errors
- [ ] All five entity category tabs are visible
- [ ] Multi-select lists load with available entities
- [ ] Member sees only their own entities
- [ ] Pre-existing links are correctly pre-selected
- [ ] Dialog can be closed without errors

**Notes**: _____________

---

### 8. Console Error Check

- [ ] Browser developer console reviewed during entire smoke test
- [ ] **No frontend console errors related to undefined/null access**
- [ ] **No frontend console errors related to failed API calls**
- [ ] **No frontend console errors related to authentication/authorization**

**Console Error Summary**:

If errors exist, document them here with exact error text and stack trace:

