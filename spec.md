# Pubs Labs Clubs

## Current State
The portal is fully built with all sections (Memberships, Publishing, Releases, Recordings, Artist Development, Admin). The `ApprovalGate` component exists and is complete, but it was temporarily removed from the portal layout during testing. All portal routes currently render freely to any authenticated user without an approval check.

## Requested Changes (Diff)

### Add
- Re-wrap the portal `<Outlet />` in `PortalLayout` with `ApprovalGate` so non-approved users see the pending banner and restricted view instead of full portal access.
- Exempt admin-only routes (`/portal/admin/*`) from the approval gate so the bootstrap page remains accessible to newly signed-in admins who may not yet have an approval record.

### Modify
- `PortalLayout.tsx`: Add `ApprovalGate` import and wrap `<Outlet />` conditionally — admin routes bypass the gate, all other routes are gated.

### Remove
- Nothing removed.

## Implementation Plan
1. In `PortalLayout.tsx`, import `ApprovalGate`.
2. Read the current path from `useRouterState`.
3. If the current path starts with `/portal/admin`, render `<Outlet />` directly (no gate).
4. Otherwise, render `<ApprovalGate><Outlet /></ApprovalGate>`.
