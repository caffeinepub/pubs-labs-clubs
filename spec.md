# Specification

## Summary
**Goal:** Add bulk select and delete functionality across all five portal list pages (Memberships, Publishing Works, Releases, Recording Projects, Artist Development).

**Planned changes:**
- Add a checkbox to each record row in all five portal list pages for individual selection, with a visible highlight on selection
- Add a "Select All" checkbox in each table header that selects/deselects all visible rows, with an indeterminate state when partially selected
- Show a "Delete X Selected" button (styled as a destructive/red action) above the table whenever one or more rows are selected; hide it when none are selected
- Show a confirmation dialog when "Delete Selected" is clicked, displaying the count of records to be deleted, with "Confirm Delete" and "Cancel" actions
- Add bulk delete backend functions for each entity type (Membership, PublishingWork, Release, RecordingProject, ArtistDevelopment) accepting an array of IDs, respecting existing authorization rules
- Wire the confirmation dialog to call the appropriate backend bulk delete function, then refresh the list, clear selections, show a success toast with the deleted count, or show an error banner on failure

**User-visible outcome:** Users can select one or more records across any portal section and delete them all at once via a confirmation dialog, with clear feedback on success or failure.
