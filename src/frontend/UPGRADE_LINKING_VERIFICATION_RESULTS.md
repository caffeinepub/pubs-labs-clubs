# Upgrade Linking Verification Results

This document captures the results of manual QA testing for the upgrade-safe related-record linking functionality across all five entity detail pages.

---

## Rollout 21.1–21.2 Smoke Test Results

**Test Date**: _____________  
**Tester**: _____________  
**Environment**: _____________

### Build/Upgrade Status

- [ ] Frontend build completed successfully (no TypeScript errors)
- [ ] Backend build completed successfully (no Motoko errors)
- [ ] Canister upgrade completed successfully (no data loss)
- [ ] Application started after upgrade (no runtime traps on startup)
- [ ] Deployment pipeline succeeded (no "Unable to create your app" error)

### Landing Page

- [ ] Landing page (`/`) loads without errors
- [ ] No console errors or warnings

### Authentication Flow

- [ ] Login button visible and functional
- [ ] Internet Identity authentication flow completes successfully
- [ ] User redirected to portal after login
- [ ] AuthGate allows authenticated user through
- [ ] ApprovalGate allows approved user through

### Portal Detail Routes (Admin User)

- [ ] Membership Detail (`/portal/memberships/$id`) loads without errors
- [ ] Publishing Work Detail (`/portal/publishing/$id`) loads without errors
- [ ] Release Detail (`/portal/releases/$id`) loads without errors
- [ ] Recording Project Detail (`/portal/recordings/$id`) loads without errors
- [ ] Artist Development Detail (`/portal/artists/$id`) loads without errors

### Edit Links Dialog (Admin User)

- [ ] "Edit Links" dialog opens on Membership Detail
- [ ] "Edit Links" dialog opens on Publishing Work Detail
- [ ] "Edit Links" dialog opens on Release Detail
- [ ] "Edit Links" dialog opens on Recording Project Detail
- [ ] "Edit Links" dialog opens on Artist Development Detail

### Portal Detail Routes (Non-Admin Approved Member)

- [ ] Membership Detail loads without errors
- [ ] Publishing Work Detail loads without errors
- [ ] Release Detail loads without errors
- [ ] Recording Project Detail loads without errors
- [ ] Artist Development Detail loads without errors

### Edit Links Dialog (Non-Admin Approved Member)

- [ ] "Edit Links" dialog opens on Membership Detail
- [ ] "Edit Links" dialog opens on Publishing Work Detail
- [ ] "Edit Links" dialog opens on Release Detail
- [ ] "Edit Links" dialog opens on Recording Project Detail
- [ ] "Edit Links" dialog opens on Artist Development Detail

### Issues/Failures

**If any failures occurred, document them here:**

_No failures_ OR:

- **Route**: _____________
- **User Role**: _____________
- **Error**: _____________
- **Steps to Reproduce**: _____________

---

## Rollout 21.3–21.4 Smoke Test Results

**Test Date**: _____________  
**Tester**: _____________  
**Environment**: _____________

### Build/Upgrade Status

- [ ] Frontend build completed successfully (no TypeScript errors)
- [ ] Backend build completed successfully (no Motoko errors)
- [ ] Canister upgrade completed successfully (no data loss)
- [ ] Application started after upgrade (no runtime traps on startup)
- [ ] Deployment pipeline succeeded (no "Unable to create your app" error)

### Landing Page

- [ ] Landing page (`/`) loads without errors
- [ ] No console errors or warnings

### Authentication Flow

- [ ] Login button visible and functional
- [ ] Internet Identity authentication flow completes successfully
- [ ] User redirected to portal after login
- [ ] AuthGate allows authenticated user through
- [ ] ApprovalGate allows approved user through

### Portal Detail Routes (Admin User)

- [ ] Membership Detail (`/portal/memberships/$id`) loads without errors
- [ ] Publishing Work Detail (`/portal/publishing/$id`) loads without errors
- [ ] Release Detail (`/portal/releases/$id`) loads without errors
- [ ] Recording Project Detail (`/portal/recordings/$id`) loads without errors
- [ ] Artist Development Detail (`/portal/artists/$id`) loads without errors

### Edit Links Dialog (Admin User)

- [ ] "Edit Links" dialog opens on Membership Detail
- [ ] "Edit Links" dialog opens on Publishing Work Detail
- [ ] "Edit Links" dialog opens on Release Detail
- [ ] "Edit Links" dialog opens on Recording Project Detail
- [ ] "Edit Links" dialog opens on Artist Development Detail

### Portal Detail Routes (Non-Admin Approved Member)

- [ ] Membership Detail loads without errors
- [ ] Publishing Work Detail loads without errors
- [ ] Release Detail loads without errors
- [ ] Recording Project Detail loads without errors
- [ ] Artist Development Detail loads without errors

### Edit Links Dialog (Non-Admin Approved Member)

- [ ] "Edit Links" dialog opens on Membership Detail
- [ ] "Edit Links" dialog opens on Publishing Work Detail
- [ ] "Edit Links" dialog opens on Release Detail
- [ ] "Edit Links" dialog opens on Recording Project Detail
- [ ] "Edit Links" dialog opens on Artist Development Detail

### Router Error Handling

- [ ] Router-level error boundaries configured in App.tsx
- [ ] Errors render as in-app error screens (not full SPA crashes)
- [ ] Error screens display helpful messages

### Issues/Failures

**If any failures occurred, document them here:**

_No failures_ OR:

- **Route**: _____________
- **User Role**: _____________
- **Error**: _____________
- **Steps to Reproduce**: _____________

---

## Rollout 21.5–21.6 Smoke Test Results

**Test Date**: _____________  
**Tester**: _____________  
**Environment**: _____________

### Build/Upgrade Status

- [ ] Frontend build completed successfully (no TypeScript errors)
- [ ] Backend build completed successfully (no Motoko errors)
- [ ] Canister upgrade completed successfully (no data loss)
- [ ] Application started after upgrade (no runtime traps on startup)
- [ ] Deployment pipeline succeeded (no "Unable to create your app" error)

### Landing Page

- [ ] Landing page (`/`) loads without errors
- [ ] No console errors or warnings

### Authentication Flow

- [ ] Login button visible and functional
- [ ] Internet Identity authentication flow completes successfully
- [ ] User redirected to portal after login
- [ ] AuthGate allows authenticated user through
- [ ] ApprovalGate allows approved user through

### Portal Detail Routes (Admin User)

- [ ] Membership Detail (`/portal/memberships/$id`) loads without errors
- [ ] Publishing Work Detail (`/portal/publishing/$id`) loads without errors
- [ ] Release Detail (`/portal/releases/$id`) loads without errors
- [ ] Recording Project Detail (`/portal/recordings/$id`) loads without errors
- [ ] Artist Development Detail (`/portal/artists/$id`) loads without errors

### Edit Links Dialog (Admin User)

- [ ] "Edit Links" dialog opens on Membership Detail
- [ ] "Edit Links" dialog opens on Publishing Work Detail
- [ ] "Edit Links" dialog opens on Release Detail
- [ ] "Edit Links" dialog opens on Recording Project Detail
- [ ] "Edit Links" dialog opens on Artist Development Detail

### Portal Detail Routes (Non-Admin Approved Member)

- [ ] Membership Detail loads without errors
- [ ] Publishing Work Detail loads without errors
- [ ] Release Detail loads without errors
- [ ] Recording Project Detail loads without errors
- [ ] Artist Development Detail loads without errors

### Edit Links Dialog (Non-Admin Approved Member)

- [ ] "Edit Links" dialog opens on Membership Detail
- [ ] "Edit Links" dialog opens on Publishing Work Detail
- [ ] "Edit Links" dialog opens on Release Detail
- [ ] "Edit Links" dialog opens on Recording Project Detail
- [ ] "Edit Links" dialog opens on Artist Development Detail

### Issues/Failures

**If any failures occurred, document them here:**

_No failures_ OR:

- **Route**: _____________
- **User Role**: _____________
- **Error**: _____________
- **Steps to Reproduce**: _____________

---

## Rollout 21.7 Smoke Test Results

**Test Date**: _____________  
**Tester**: _____________  
**Environment**: _____________

### Build/Upgrade Status

- [ ] Frontend build completed successfully (no TypeScript errors)
- [ ] Backend build completed successfully (no Motoko errors)
- [ ] Canister upgrade completed successfully (no data loss)
- [ ] Application started after upgrade (no runtime traps on startup)
- [ ] Deployment pipeline succeeded (no "Unable to create your app" error)
- [ ] Frontend TypeScript check passed (`npm run typescript-check`)
- [ ] Production build completed successfully (`npm run build`)

### Test User Principals

**Admin User Principal**: _____________  
**Non-Admin Approved Member Principal**: _____________

### Landing Page

- [ ] Landing page (`/`) loads without errors
- [ ] No console errors or warnings

### Authentication Flow (Admin User)

- [ ] Login button visible and functional
- [ ] Internet Identity authentication flow completes successfully
- [ ] User redirected to portal after login
- [ ] **AuthGate verification**: Authenticated admin user allowed through
- [ ] **ApprovalGate verification**: Admin user allowed through (admins always approved)
- [ ] Portal layout renders correctly

### Authentication Flow (Non-Admin Approved Member)

- [ ] Logged out admin user successfully
- [ ] Logged in as non-admin approved member
- [ ] Internet Identity authentication flow completes successfully
- [ ] User redirected to portal after login
- [ ] **AuthGate verification**: Authenticated member allowed through
- [ ] **ApprovalGate verification**: Approved member allowed through
- [ ] Portal layout renders correctly

### Portal Detail Routes (Admin User)

**Record exact entity IDs used:**

- [ ] Membership Detail (`/portal/memberships/$id`) loads without errors  
  **Entity ID**: _____________
- [ ] Publishing Work Detail (`/portal/publishing/$id`) loads without errors  
  **Entity ID**: _____________
- [ ] Release Detail (`/portal/releases/$id`) loads without errors  
  **Entity ID**: _____________
- [ ] Recording Project Detail (`/portal/recordings/$id`) loads without errors  
  **Entity ID**: _____________
- [ ] Artist Development Detail (`/portal/artists/$id`) loads without errors  
  **Entity ID**: _____________

### Edit Links Dialog (Admin User)

- [ ] "Edit Links" dialog opens on Membership Detail
- [ ] "Edit Links" dialog opens on Publishing Work Detail
- [ ] "Edit Links" dialog opens on Release Detail
- [ ] "Edit Links" dialog opens on Recording Project Detail
- [ ] "Edit Links" dialog opens on Artist Development Detail

### Portal Detail Routes (Non-Admin Approved Member)

**Record exact entity IDs used:**

- [ ] Membership Detail loads without errors  
  **Entity ID**: _____________
- [ ] Publishing Work Detail loads without errors  
  **Entity ID**: _____________
- [ ] Release Detail loads without errors  
  **Entity ID**: _____________
- [ ] Recording Project Detail loads without errors  
  **Entity ID**: _____________
- [ ] Artist Development Detail loads without errors  
  **Entity ID**: _____________

### Edit Links Dialog (Non-Admin Approved Member)

- [ ] "Edit Links" dialog opens on Membership Detail
- [ ] "Edit Links" dialog opens on Publishing Work Detail
- [ ] "Edit Links" dialog opens on Release Detail
- [ ] "Edit Links" dialog opens on Recording Project Detail
- [ ] "Edit Links" dialog opens on Artist Development Detail

### Console Error Check

- [ ] Browser developer console reviewed during smoke test
- [ ] **No frontend console errors related to undefined/null access**
- [ ] **If errors exist, documented below with exact error text and stack trace**

### Backend Runtime Trap Check

- [ ] Backend logs reviewed (if available)
- [ ] **No backend runtime traps occurred during smoke test**
- [ ] **If traps exist, documented below with exact trap message**

### Router Error Handling Verification

- [ ] Router-level error boundaries configured in App.tsx
- [ ] Controlled error triggered (e.g., invalid entity ID navigation)
- [ ] Error renders as in-app error screen (not full SPA crash)
- [ ] Error screen displays helpful message and allows navigation back

### Frontend Hardening Verification

- [ ] Array normalization (`normalizeToArray`) prevents undefined/null errors
- [ ] Defensive null checks in AuthGate/ApprovalGate prevent navigation loops
- [ ] Optional chaining (`?.`) used consistently for entity field access
- [ ] React Query error handling prevents build/runtime crashes

### Structured Failure Documentation

**If any failures occurred, document them here with full details:**

#### Failure 1 (if applicable)

- **Route**: _____________
- **User Role**: Admin / Non-Admin Approved Member
- **Exact Error Text**:
  ```
  [Paste full error message from console here]
  ```
- **Stack Trace**:
  ```
  [Paste full stack trace here if available]
  ```
- **Steps to Reproduce**:
  1. _____________
  2. _____________
  3. _____________

#### Failure 2 (if applicable)

- **Route**: _____________
- **User Role**: Admin / Non-Admin Approved Member
- **Exact Error Text**:
  ```
  [Paste full error message from console here]
  ```
- **Stack Trace**:
  ```
  [Paste full stack trace here if available]
  ```
- **Steps to Reproduce**:
  1. _____________
  2. _____________
  3. _____________

### Overall Result

- [ ] **PASS**: All smoke test steps completed successfully for both roles
- [ ] **FAIL**: One or more failures documented above

**Additional Notes**: _____________
