import type { Principal } from '@dfinity/principal';
import type {
  MemberId,
  PublishingId,
  LabelEntityId,
  RecodingId,
  ArtistDevelopmentId,
  Time,
  Membership,
} from '../backend';

// ─── ProjectStatus ────────────────────────────────────────────────────────────
// Mirrors the Motoko ProjectStatus variant
export enum ProjectStatus {
  planned = 'planned',
  in_progress = 'in_progress',
  completed = 'completed',
  archived = 'archived',
}

// ─── PublishingWork ───────────────────────────────────────────────────────────
export interface PublishingWork {
  id: PublishingId;
  owner: Principal;
  title: string;
  contributors: string[];
  ownershipSplits: [string, bigint][];
  iswc?: string | null;
  isrc?: string | null;
  registrationStatus: string;
  notes: string;
  linkedMembers: MemberId[];
  linkedArtists: ArtistDevelopmentId[];
  linkedReleases: LabelEntityId[];
  linkedProjects: RecodingId[];
  created_at: Time;
}

// ─── Release ──────────────────────────────────────────────────────────────────
export interface Release {
  id: LabelEntityId;
  owner: Principal;
  title: string;
  releaseType: string;
  tracklist: string[];
  keyDates: string[];
  owners: string[];
  workflowChecklist: string[];
  linkedMembers: MemberId[];
  linkedArtists: ArtistDevelopmentId[];
  linkedWorks: PublishingId[];
  linkedProjects: RecodingId[];
  created_at: Time;
}

// ─── RecordingProject ─────────────────────────────────────────────────────────
export interface RecordingProject {
  id: RecodingId;
  owner: Principal;
  title: string;
  participants: string[];
  sessionDate: Time;
  status: ProjectStatus;
  notes: string;
  assetReferences: string[];
  linkedMembers: MemberId[];
  linkedArtists: ArtistDevelopmentId[];
  linkedWorks: PublishingId[];
  linkedReleases: LabelEntityId[];
  created_at: Time;
}

// ─── ArtistDevelopment ────────────────────────────────────────────────────────
export interface ArtistDevelopment {
  id: ArtistDevelopmentId;
  owner: Principal;
  artistId: string;
  goals: string[];
  plans: string[];
  milestones: string[];
  internalNotes: string;
  relatedMemberships: MemberId[];
  relatedPublishing: PublishingId[];
  relatedLabelEntities: LabelEntityId[];
  relatedRecordingProjects: RecodingId[];
  relatedArtistDevelopment: ArtistDevelopmentId[];
  created_at: Time;
}

// ─── CallerEntities ───────────────────────────────────────────────────────────
// Shape returned by getEntitiesForCaller
export interface CallerEntities {
  memberships: [string, Membership][];
  publishingWorks: PublishingWork[];
  releases: Release[];
  recordingProjects: RecordingProject[];
  artistDevelopment: ArtistDevelopment[];
}
