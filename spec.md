# Specification

## Summary
**Goal:** Fix the portal sections not rendering after the Version 36 deployment so that all portal areas are visible and navigable for authenticated users.

**Planned changes:**
- Audit and fix the TanStack Router route tree in App.tsx to ensure all portal child routes (Memberships, Publishing Works, Releases, Recording Projects, Artist Development, Admin) are correctly nested under the portal parent route
- Verify that AuthGate does not incorrectly redirect authenticated users away from portal routes
- Ensure ApprovalGate remains disabled (renders children unconditionally) and does not block portal sections
- Fix PortalLayout to correctly render the sidebar navigation links and the main content `Outlet` so child route components are mounted and displayed
- Ensure direct navigation to portal sub-route URLs renders the correct page content without console errors

**User-visible outcome:** After logging in, authenticated users can see and navigate all five portal sections (Memberships, Publishing Works, Releases, Recording Projects, Artist Development) in the sidebar, and each section displays its content correctly including on page refresh.
