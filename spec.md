# Specification

## Summary
**Goal:** Fully implement the Memberships portal section (list and detail pages) with visible data, inline editing, and related records support — wired to a complete backend.

**Planned changes:**
- Audit all five portal list/detail pages to identify the first unfinished area (Memberships)
- Implement `MembershipsPage` to display a list of memberships with name, email, and status badge; show a meaningful empty state with a "Create Membership" CTA when no data exists
- Implement `MembershipDetail` to display all profile fields (name, email, bio, status) with inline editing for admins and the member themselves
- Add a related records section on `MembershipDetail` showing linked artists, works, releases, and projects as clickable badges, with a working `EditRelatedDialog` for multi-select and save
- Expose backend methods: `getMemberships` (admin), `getCallerMemberships`, `getMembership(id)`, `updateMembership`, and related-link mutation methods
- Wire backend methods to frontend hooks in `useQueries.ts` with correct argument types and cache invalidation on mutation success
- Seed or ensure real backend data is returned so pages are non-empty during testing

**User-visible outcome:** Users can navigate to the Memberships portal section, see a populated list of memberships, click through to a detail page with all profile fields displayed, edit fields inline (if admin or owner), and manage related records — with no blank or invisible content areas.
