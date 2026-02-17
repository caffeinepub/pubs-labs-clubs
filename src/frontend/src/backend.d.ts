import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type PublishingId = string;
export type Time = bigint;
export type LabelEntityId = string;
export type MemberId = string;
export interface ByGoals {
    id: ArtistDevelopmentId;
    artistId: string;
    created_at: Time;
    goals: string;
}
export interface ArtistDevelopment {
    id: ArtistDevelopmentId;
    relatedRecordingProjects: Array<RecodingId>;
    owner: Principal;
    relatedLabelEntities: Array<LabelEntityId>;
    artistId: string;
    created_at: Time;
    relatedArtistDevelopment: Array<ArtistDevelopmentId>;
    relatedMemberships: Array<MemberId>;
    goals: Array<string>;
    plans: Array<string>;
    internalNotes: string;
    relatedPublishing: Array<PublishingId>;
    milestones: Array<string>;
}
export type RecodingId = string;
export interface RecordingProject {
    id: RecodingId;
    status: ProjectStatus;
    title: string;
    participants: Array<string>;
    sessionDate: Time;
    owner: Principal;
    created_at: Time;
    linkedReleases: Array<LabelEntityId>;
    linkedWorks: Array<PublishingId>;
    assetReferences: Array<string>;
    linkedMembers: Array<MemberId>;
    notes: string;
    linkedArtists: Array<ArtistDevelopmentId>;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface PublishingWork {
    id: PublishingId;
    title: string;
    ownershipSplits: Array<[string, bigint]>;
    linkedProjects: Array<RecodingId>;
    owner: Principal;
    isrc?: string;
    iswc?: string;
    created_at: Time;
    linkedReleases: Array<LabelEntityId>;
    linkedMembers: Array<MemberId>;
    notes: string;
    registrationStatus: string;
    contributors: Array<string>;
    linkedArtists: Array<ArtistDevelopmentId>;
}
export interface Release {
    id: LabelEntityId;
    title: string;
    workflowChecklist: Array<string>;
    keyDates: Array<string>;
    owners: Array<string>;
    linkedProjects: Array<RecodingId>;
    owner: Principal;
    tracklist: Array<string>;
    created_at: Time;
    linkedWorks: Array<PublishingId>;
    linkedMembers: Array<MemberId>;
    linkedArtists: Array<ArtistDevelopmentId>;
    releaseType: string;
}
export type ArtistDevelopmentId = string;
export interface SignedInUser {
    principal: Principal;
    role: UserRole;
    profile?: UserProfile;
}
export interface MembershipTier {
    fee: bigint;
    name: string;
    description: string;
    benefits: Array<string>;
}
export interface MembershipProfile {
    id: MemberId;
    agreements: Array<string>;
    status: T;
    updated_at: Time;
    principal: Principal;
    name: string;
    tier: string;
    created_at: Time;
    email: string;
    notes: string;
}
export interface Membership {
    linkedProjects: Array<RecodingId>;
    tier: MembershipTier;
    linkedReleases: Array<LabelEntityId>;
    linkedWorks: Array<PublishingId>;
    linkedArtists: Array<ArtistDevelopmentId>;
    profile: MembershipProfile;
}
export interface UserProfile {
    bio: string;
    name: string;
    email: string;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum ProjectStatus {
    in_progress = "in_progress",
    completed = "completed",
    planned = "planned",
    archived = "archived"
}
export enum T {
    applicant = "applicant",
    active = "active",
    inactive = "inactive",
    paused = "paused"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPublishingWorkNotes(id: string, notes: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignReleaseOwners(releaseId: LabelEntityId, owners: Array<string>): Promise<void>;
    createArtistDevelopment(artistId: string, goals: Array<string>, plans: Array<string>, milestones: Array<string>, internalNotes: string): Promise<ArtistDevelopment>;
    createMembershipProfile(id: MemberId, name: string, email: string): Promise<MembershipProfile>;
    createPublishingWork(title: string, contributors: Array<string>, ownershipSplits: Array<[string, bigint]>, iswc: string | null, isrc: string | null, registrationStatus: string): Promise<PublishingWork>;
    createRecordingProject(title: string, participants: Array<string>, sessionDate: Time, status: ProjectStatus, notes: string): Promise<RecordingProject>;
    createRelease(title: string, releaseType: string, tracklist: Array<string>, keyDates: Array<string>, owners: Array<string>): Promise<Release>;
    getAllArtistDevelopment(): Promise<Array<ArtistDevelopment>>;
    getAllKnownUsers(): Promise<Array<SignedInUser>>;
    getAllMembershipProfiles(): Promise<Array<MembershipProfile>>;
    getAllPublishingWorks(): Promise<Array<PublishingWork>>;
    getAllRecordingProjects(): Promise<Array<RecordingProject>>;
    getAllReleases(): Promise<Array<Release>>;
    getArtistDevelopment(entryId: ArtistDevelopmentId): Promise<ArtistDevelopment>;
    getArtistDevelopmentByGoals(): Promise<Array<ByGoals>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEntitiesForCaller(): Promise<{
        recordingProjects: Array<RecordingProject>;
        artistDevelopment: Array<ArtistDevelopment>;
        publishingWorks: Array<PublishingWork>;
        releases: Array<Release>;
        memberships: Array<[MemberId, Membership]>;
    }>;
    getMembershipDetails(id: MemberId): Promise<Membership>;
    getMembershipProfile(id: MemberId): Promise<MembershipProfile>;
    getMembershipProfilesByStatus(status: T): Promise<Array<MembershipProfile>>;
    getPublishingWork(id: string): Promise<PublishingWork>;
    getRecordingProject(projectId: RecodingId): Promise<RecordingProject>;
    getRelease(releaseId: LabelEntityId): Promise<Release>;
    getRemainingRolloutSteps(): Promise<Array<[string, string]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    linkMembershipToEntities(memberId: MemberId, artistIds: Array<ArtistDevelopmentId>, workIds: Array<PublishingId>, releaseIds: Array<LabelEntityId>, projectIds: Array<RecodingId>): Promise<void>;
    linkProjectToEntities(projectId: RecodingId, memberIds: Array<MemberId>, artistIds: Array<ArtistDevelopmentId>, workIds: Array<PublishingId>, releaseIds: Array<LabelEntityId>): Promise<void>;
    linkPublishingWorkToEntities(workId: PublishingId, memberIds: Array<MemberId>, artistIds: Array<ArtistDevelopmentId>, releaseIds: Array<LabelEntityId>, projectIds: Array<RecodingId>): Promise<void>;
    linkReleaseToEntities(releaseId: LabelEntityId, memberIds: Array<MemberId>, artistIds: Array<ArtistDevelopmentId>, workIds: Array<PublishingId>, projectIds: Array<RecodingId>): Promise<void>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    updateArtistDevelopmentLinks(artistDevelopmentId: ArtistDevelopmentId, relatedMemberships: Array<MemberId>, relatedPublishing: Array<PublishingId>, relatedLabelEntities: Array<LabelEntityId>, relatedRecordingProjects: Array<RecodingId>, relatedArtistDevelopment: Array<ArtistDevelopmentId>): Promise<void>;
    updateKnownUserRole(): Promise<void>;
    updateMembershipLinks(id: MemberId, artistIds: Array<ArtistDevelopmentId>, workIds: Array<PublishingId>, releaseIds: Array<LabelEntityId>, projectIds: Array<RecodingId>): Promise<void>;
    updateMembershipProfile(id: MemberId, name: string, email: string, status: T): Promise<MembershipProfile>;
}
