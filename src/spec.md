# Specification

## Summary
**Goal:** Complete Step 7.5+ by making the related-record linking flow upgrade-resilient end-to-end across all supported detail pages and roles, and ensure the project builds and runs cleanly.

**Planned changes:**
- Make post-upgrade state handling resilient on Membership, Publishing Work, Release, Recording Project, and Artist Development detail pages so they load reliably for admin and non-admin users.
- Ensure the “Edit Links” dialog opens, pre-populates current linked IDs, saves successfully, and updates the Related Records section immediately across all supported pages and both roles.
- Add/adjust frontend safeguards so missing/undefined related-ID arrays and partial/missing entity collections are treated as empty arrays (including authorization-safe label resolution for non-admin users).
- Fix any remaining build/deploy/runtime issues (TypeScript and Motoko) that block compiling/running and using the “Edit Links” dialog on the supported pages.
- Update and validate the manual post-upgrade verification checklist (frontend/UPGRADE_LINKING_VERIFICATION.md) so it matches current UI text (“Edit Links”) and the entity categories shown in the dialog/Related Records, covering both roles.

**User-visible outcome:** After a canister upgrade, admin and non-admin members can open each supported detail page without crashes, use “Edit Links” to view and change related-record links, see updates immediately, and confirm links persist after refresh using an up-to-date verification checklist.
