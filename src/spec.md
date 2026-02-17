# Specification

## Summary
**Goal:** Add named-step rollout documentation so the team can reference and track remaining rollout steps by name and number.

**Planned changes:**
- Add a new markdown document that lists the remaining rollout steps with explicit step numbers and step names, each with a brief English description and a verification method, and clearly marks the next step to execute.
- Update `frontend/UPGRADE_LINKING_VERIFICATION.md` to include a clear, human-readable step name near the top (and/or for major sections) without changing existing verification meanings, URLs, or button labels.

**User-visible outcome:** The repo includes a single source of truth for named rollout steps (with the next step clearly identified), and the manual verification checklist is easier to reference during the named-step rollout process.
