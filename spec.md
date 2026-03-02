# Specification

## Summary
**Goal:** Enable full create and edit functionality for all five portal sections (Memberships, Publishing Works, Releases, Recording Projects, Artist Development) by wiring up backend persistence and frontend forms.

**Planned changes:**
- Add backend update endpoints (`updateMembership`, `updatePublishingWork`, `updateRelease`, `updateRecordingProject`, `updateArtistDevelopment`) in `main.mo` with ownership/admin authorization, returning updated records or error variants (`#Unauthorized`, `#NotFound`).
- Wire up existing create dialogs on each list page to call the backend create mutation, validate required fields, show a success toast, close the dialog, and refresh the list.
- Add an Edit button (visible to owner or admin) on each detail page that opens an inline form pre-populated with current values.
- Saving the inline edit form persists changes to the backend and updates the detail page immediately without a full reload.
- Add React Query mutation hooks (`updateMembership`, `updatePublishingWork`, `updateRelease`, `updateRecordingProject`, `updateArtistDevelopment`) in `useQueries.ts` that call the backend update endpoints and invalidate relevant list and detail query caches on success.
- Surface backend errors inline in both create dialogs and edit forms; show success toasts on successful save.
- Enforce ownership split validation (total ≤ 100%) on the Publishing Work edit form.

**User-visible outcome:** Users can create new records across all five portal sections and edit existing records, with changes saved to the backend and reflected immediately in the UI.
