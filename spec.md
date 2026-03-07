# Pubs Labs Clubs — Part D: Richer Create Forms

## Current State
All four non-membership sections (Publishing Works, Releases, Recording Projects, Artist Development) have minimal create dialogs — each only asks for a single text field (title or artist ID). The backend already supports full data models with contributors, ISRC/ISWC, session dates, status, tracklist, goals, genres, etc.

## Requested Changes (Diff)

### Add
- Publishing Works create dialog: Contributor list input, ISWC field, ISRC field, Registration Status dropdown (pending / registered / disputed), and Notes textarea.
- Releases create dialog: Release Type dropdown (Single / EP / Album / Compilation), Tracklist input (comma-separated tracks), and Key Dates text field.
- Recording Projects create dialog: Session Date date picker, Status dropdown (planned / in_progress / completed / archived), Participants input (comma-separated), and Notes textarea.
- Artist Development create dialog: Genre / Discipline text field, Initial Goals input (comma-separated), and a short Bio / Internal Notes textarea.

### Modify
- `PublishingWorksPage.tsx` — expand create dialog form and pass full data to `createMutation.mutateAsync`.
- `ReleasesPage.tsx` — expand create dialog form and pass full data to `createMutation.mutateAsync`.
- `RecordingProjectsPage.tsx` — expand create dialog form and pass full data to `createProject.mutateAsync`.
- `ArtistDevelopmentPage.tsx` — expand create dialog form and pass full data to `createEntry.mutateAsync`; update `useCreateArtistDevelopment` mutation signature in `useQueries.ts` to accept the richer payload.

### Remove
- Nothing removed.

## Implementation Plan
1. Update `useCreateArtistDevelopment` in `useQueries.ts` to accept a richer input object (artistId, goals, internalNotes) instead of just `{ artistId }`.
2. Expand `PublishingWorksPage` create dialog with Contributor, ISWC, ISRC, Registration Status, and Notes fields.
3. Expand `ReleasesPage` create dialog with Release Type, Tracklist, and Key Dates fields.
4. Expand `RecordingProjectsPage` create dialog with Session Date, Status, Participants, and Notes fields.
5. Expand `ArtistDevelopmentPage` create dialog with Genre/Discipline, Initial Goals, and Internal Notes fields; update handleCreate to pass the full payload.
6. Validate and build.
