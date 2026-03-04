/**
 * Centralized portal audit findings.
 * Each entry describes a missing or incomplete feature across the five portal sections.
 * Used by SectionPlaceholder components on detail pages and the PortalAuditSummary on the admin dashboard.
 */

export type AuditPriority = "high" | "medium" | "low";

export interface AuditFinding {
  id: string;
  sectionName: string;
  sectionPath: string;
  featureDescription: string;
  suggestedPriority: AuditPriority;
  context?: string; // optional extra detail shown in placeholders
}

export const PORTAL_AUDIT_FINDINGS: AuditFinding[] = [
  // ── MEMBERSHIPS ──────────────────────────────────────────────────────────────
  {
    id: "mem-tier-management",
    sectionName: "Memberships",
    sectionPath: "/portal/memberships",
    featureDescription: "Membership tier management UI",
    suggestedPriority: "high",
    context:
      'The backend supports tiers (name, description, fee, benefits) but there is no UI to create, edit, or assign tiers. Members are always assigned "Basic" with no fee or benefits displayed.',
  },
  {
    id: "mem-benefits-display",
    sectionName: "Memberships",
    sectionPath: "/portal/memberships",
    featureDescription: "Tier benefits & fee display on member detail",
    suggestedPriority: "high",
    context:
      "The MembershipDetail page shows profile fields but does not render the tier object (fee, description, benefits list) that is already stored in the backend.",
  },
  {
    id: "mem-agreements",
    sectionName: "Memberships",
    sectionPath: "/portal/memberships",
    featureDescription: "Agreements management interface",
    suggestedPriority: "medium",
    context:
      "The MembershipProfile stores an agreements array but there is no UI to add, view, or remove agreement entries.",
  },
  {
    id: "mem-notes-admin",
    sectionName: "Memberships",
    sectionPath: "/portal/memberships",
    featureDescription: "Admin notes field on membership detail",
    suggestedPriority: "medium",
    context:
      "The MembershipProfile has a notes field that is stored but never displayed or editable in the UI.",
  },
  {
    id: "mem-status-filter",
    sectionName: "Memberships",
    sectionPath: "/portal/memberships",
    featureDescription: "Filter memberships by status on the list page",
    suggestedPriority: "medium",
    context:
      "The backend exposes getMembershipProfilesByStatus but the list page has no filter controls to narrow by applicant / active / paused / inactive.",
  },
  {
    id: "mem-registration-form",
    sectionName: "Memberships",
    sectionPath: "/portal/memberships",
    featureDescription:
      "Expanded member registration form (phone, genre, role, social links, etc.)",
    suggestedPriority: "high",
    context:
      'The current "New Membership" dialog only collects ID, name, and email. Additional fields relevant for sorting and selection (e.g. instrument/role, genre, phone, social handles) are not yet captured.',
  },

  // ── PUBLISHING WORKS ─────────────────────────────────────────────────────────
  {
    id: "pub-ownership-viz",
    sectionName: "Publishing Works",
    sectionPath: "/portal/publishing",
    featureDescription: "Ownership split visualisation (pie/bar chart)",
    suggestedPriority: "medium",
    context:
      "Ownership splits are stored and displayed as a plain list. A visual chart would make the split immediately clear at a glance.",
  },
  {
    id: "pub-isrc-iswc-validation",
    sectionName: "Publishing Works",
    sectionPath: "/portal/publishing",
    featureDescription: "ISRC / ISWC format validation UI",
    suggestedPriority: "medium",
    context:
      "ISRC and ISWC fields accept free text. Inline format validation (e.g. ISRC: CC-XXX-YY-NNNNN) and a copy-to-clipboard button are missing.",
  },
  {
    id: "pub-registration-workflow",
    sectionName: "Publishing Works",
    sectionPath: "/portal/publishing",
    featureDescription: "Registration status workflow tracker",
    suggestedPriority: "high",
    context:
      "The registrationStatus field is a free-text string. A structured workflow (pending → submitted → registered) with status-change history is not yet implemented.",
  },
  {
    id: "pub-contributor-roles",
    sectionName: "Publishing Works",
    sectionPath: "/portal/publishing",
    featureDescription:
      "Contributor role management (composer, lyricist, arranger)",
    suggestedPriority: "medium",
    context:
      "Contributors are stored as plain strings. Assigning roles (composer, lyricist, arranger, publisher) per contributor is not yet supported.",
  },
  {
    id: "pub-bulk-ops",
    sectionName: "Publishing Works",
    sectionPath: "/portal/publishing",
    featureDescription:
      "Bulk operations and advanced search/filter on the list page",
    suggestedPriority: "low",
    context:
      "The publishing catalog list has no search bar, status filter, or bulk-select actions (e.g. bulk export, bulk status update).",
  },

  // ── RELEASES ─────────────────────────────────────────────────────────────────
  {
    id: "rel-workflow-checklist",
    sectionName: "Releases",
    sectionPath: "/portal/releases",
    featureDescription: "Interactive workflow checklist (check off tasks)",
    suggestedPriority: "high",
    context:
      "The workflowChecklist array is stored but displayed as a read-only list. An interactive checklist with tick-off capability and progress indicator is not yet implemented.",
  },
  {
    id: "rel-key-dates-calendar",
    sectionName: "Releases",
    sectionPath: "/portal/releases",
    featureDescription: "Key dates management with calendar picker",
    suggestedPriority: "high",
    context:
      'Key dates are stored as plain strings. A date-picker UI, structured date labels (e.g. "Mastering deadline", "Release date"), and a calendar view are missing.',
  },
  {
    id: "rel-tracklist-edit",
    sectionName: "Releases",
    sectionPath: "/portal/releases",
    featureDescription: "Tracklist editing with per-track metadata",
    suggestedPriority: "medium",
    context:
      "Tracks are stored as plain strings. An editable tracklist with drag-to-reorder, track number, and per-track ISRC is not yet implemented.",
  },
  {
    id: "rel-owner-collab",
    sectionName: "Releases",
    sectionPath: "/portal/releases",
    featureDescription: "Owner / collaborator management UI",
    suggestedPriority: "medium",
    context:
      "The owners array is displayed as a comma-separated string. A UI to add/remove owners with principal lookup is not yet implemented.",
  },
  {
    id: "rel-calendar-view",
    sectionName: "Releases",
    sectionPath: "/portal/releases",
    featureDescription: "Release calendar view on the list page",
    suggestedPriority: "low",
    context:
      "The releases list is a card grid. A calendar/timeline view showing upcoming release dates would improve planning visibility.",
  },

  // ── RECORDING PROJECTS ───────────────────────────────────────────────────────
  {
    id: "rec-asset-references",
    sectionName: "Recording Projects",
    sectionPath: "/portal/recordings",
    featureDescription:
      "Asset reference management UI (file links, stems, mixes)",
    suggestedPriority: "high",
    context:
      "The assetReferences array is stored but never displayed or editable in the UI. A UI to add/remove reference links (e.g. cloud storage URLs, file names) is missing.",
  },
  {
    id: "rec-status-workflow",
    sectionName: "Recording Projects",
    sectionPath: "/portal/recordings",
    featureDescription:
      "Status transition workflow (planned → in progress → completed → archived)",
    suggestedPriority: "high",
    context:
      "Project status is set at creation but cannot be updated from the detail page. A status-change button with confirmation is not yet implemented.",
  },
  {
    id: "rec-participant-roles",
    sectionName: "Recording Projects",
    sectionPath: "/portal/recordings",
    featureDescription:
      "Participant role management (artist, producer, engineer, mixer)",
    suggestedPriority: "medium",
    context:
      "Participants are stored as plain strings. Assigning roles per participant and editing the participant list from the detail page is not yet supported.",
  },
  {
    id: "rec-session-metadata",
    sectionName: "Recording Projects",
    sectionPath: "/portal/recordings",
    featureDescription: "Session metadata display (studio, engineer, BPM, key)",
    suggestedPriority: "low",
    context:
      "The detail page shows basic fields. Additional session metadata (studio name, BPM, key, genre) is not captured or displayed.",
  },
  {
    id: "rec-timeline-view",
    sectionName: "Recording Projects",
    sectionPath: "/portal/recordings",
    featureDescription: "Timeline / calendar view on the list page",
    suggestedPriority: "low",
    context:
      "The projects list is a card grid. A timeline view ordered by session date would improve scheduling visibility.",
  },

  // ── ARTIST DEVELOPMENT ───────────────────────────────────────────────────────
  {
    id: "art-milestone-tracking",
    sectionName: "Artist Development",
    sectionPath: "/portal/artists",
    featureDescription: "Milestone tracking with completion status and dates",
    suggestedPriority: "high",
    context:
      "Milestones are stored as plain strings. A structured milestone tracker with completion toggle, target date, and progress bar is not yet implemented.",
  },
  {
    id: "art-goal-plan-edit",
    sectionName: "Artist Development",
    sectionPath: "/portal/artists",
    featureDescription: "Goal and plan editing from the detail page",
    suggestedPriority: "high",
    context:
      "Goals and plans are set at creation but cannot be edited from the detail page. An inline edit UI for these arrays is missing.",
  },
  {
    id: "art-progress-viz",
    sectionName: "Artist Development",
    sectionPath: "/portal/artists",
    featureDescription:
      "Progress visualisation (milestone completion percentage)",
    suggestedPriority: "medium",
    context:
      "There is no visual indicator of how many milestones have been completed vs. total, making it hard to assess artist progress at a glance.",
  },
  {
    id: "art-internal-notes-collab",
    sectionName: "Artist Development",
    sectionPath: "/portal/artists",
    featureDescription: "Internal notes editing from the detail page",
    suggestedPriority: "medium",
    context:
      "The internalNotes field is displayed but cannot be edited from the detail page. An inline edit or notes section with save is missing.",
  },
  {
    id: "art-search-filter",
    sectionName: "Artist Development",
    sectionPath: "/portal/artists",
    featureDescription: "Artist search and filtering on the list page",
    suggestedPriority: "low",
    context:
      "The artist development list has no search bar or filter controls. As the list grows, finding a specific artist becomes difficult.",
  },
];

/** Returns findings for a specific section by name */
export function findingsForSection(sectionName: string): AuditFinding[] {
  return PORTAL_AUDIT_FINDINGS.filter((f) => f.sectionName === sectionName);
}

/** Returns findings grouped by section name */
export function findingsBySection(): Record<string, AuditFinding[]> {
  return PORTAL_AUDIT_FINDINGS.reduce<Record<string, AuditFinding[]>>(
    (acc, finding) => {
      if (!acc[finding.sectionName]) acc[finding.sectionName] = [];
      acc[finding.sectionName].push(finding);
      return acc;
    },
    {},
  );
}
