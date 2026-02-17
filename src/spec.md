# Specification

## Summary
**Goal:** Advance rollout documentation to Step 10 (Deployment and Launch) and add a production/mainnet post-deployment smoke-test checklist for Step 10.

**Planned changes:**
- Update `frontend/ROLLOUT_STEPS.md` so the "Next Step to Execute" section sets Step 10 (Deployment and Launch) as the current step, with clear English "Action Required" instructions and references to relevant existing checklists/log templates where applicable.
- Add a new Step 10 post-deployment smoke-test checklist Markdown file under `frontend/` that covers: landing page load (`/`), AuthGate + ApprovalGate access, all five portal detail routes, and opening the "Edit Links" dialog on each detail page for both an Admin user and a non-admin approved Member user, including fields to record principals and entity IDs tested.

**User-visible outcome:** The rollout guide points to Step 10 with concrete deployment/launch guidance, and the team has a ready-to-use Step 10 production smoke-test checklist to validate the deployed app for both Admin and Member roles.
