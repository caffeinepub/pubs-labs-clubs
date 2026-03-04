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
export type ArtistDevelopmentId = string;
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
export interface CreatePublishingWorkRequest {
    title: string;
    ownershipSplits: Array<[string, bigint]>;
    linkedProjects: Array<RecodingId>;
    isrc?: string;
    iswc?: string;
    linkedReleases: Array<LabelEntityId>;
    linkedMembers: Array<MemberId>;
    notes: string;
    registrationStatus: string;
    contributors: Array<string>;
    linkedArtists: Array<ArtistDevelopmentId>;
}
export interface CreateArtistDevelopmentRequest {
    relatedRecordingProjects: Array<RecodingId>;
    relatedLabelEntities: Array<LabelEntityId>;
    artistId: string;
    relatedArtistDevelopment: Array<ArtistDevelopmentId>;
    relatedMemberships: Array<MemberId>;
    goals: Array<string>;
    plans: Array<string>;
    internalNotes: string;
    relatedPublishing: Array<PublishingId>;
    milestones: Array<string>;
}
export interface ChangeEvent {
    id: bigint;
    operationType: Variant_link_create_update;
    author: Principal;
    changedFields: Array<string>;
    timestamp: bigint;
    recordId: string;
}
export interface CreateRecordingProjectRequest {
    status: ProjectStatus;
    title: string;
    participants: Array<string>;
    sessionDate: Time;
    linkedReleases: Array<LabelEntityId>;
    linkedWorks: Array<PublishingId>;
    assetReferences: Array<string>;
    linkedMembers: Array<MemberId>;
    notes: string;
    linkedArtists: Array<ArtistDevelopmentId>;
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
export type MemberId = string;
export interface DashboardStats {
    totalMemberships: bigint;
    membershipStatusCounts: Array<[T, bigint]>;
    totalRecordingProjects: bigint;
    projectStatusCounts: Array<[ProjectStatus, bigint]>;
    totalPublishingWorks: bigint;
    totalArtistDevelopment: bigint;
    releaseTypeCounts: Array<[string, bigint]>;
    totalReleases: bigint;
}
export type RecodingId = string;
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface CreateArtistDevelopmentResponse {
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
export interface SignedInUser {
    principal: Principal;
    role: UserRole;
    profile?: UserProfile;
}
export interface CreateReleaseRequest {
    title: string;
    workflowChecklist: Array<string>;
    keyDates: Array<string>;
    owners: Array<string>;
    linkedProjects: Array<RecodingId>;
    tracklist: Array<string>;
    linkedWorks: Array<PublishingId>;
    linkedMembers: Array<MemberId>;
    linkedArtists: Array<ArtistDevelopmentId>;
    releaseType: string;
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
export enum Variant_link_create_update {
    link = "link",
    create = "create",
    update = "update"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkDeleteMembershipProfiles(ids: Array<MemberId>): Promise<{
        deleted: Array<MemberId>;
        failed: Array<MemberId>;
    }>;
    createArtistDevelopment(request: CreateArtistDevelopmentRequest): Promise<CreateArtistDevelopmentResponse>;
    createMembershipProfile(id: MemberId, name: string, email: string): Promise<MembershipProfile>;
    createPublishingWork(request: CreatePublishingWorkRequest): Promise<PublishingWork>;
    createRecordingProject(request: CreateRecordingProjectRequest): Promise<RecordingProject>;
    createRelease(request: CreateReleaseRequest): Promise<Release>;
    deleteArtistDevelopment(id: ArtistDevelopmentId): Promise<void>;
    deleteMembership(id: MemberId): Promise<void>;
    deletePublishingWork(id: PublishingId): Promise<void>;
    deleteRecordingProject(id: RecodingId): Promise<void>;
    deleteRelease(id: LabelEntityId): Promise<void>;
    duplicateArtistDevelopment(id: ArtistDevelopmentId): Promise<ArtistDevelopment>;
    duplicateMembership(id: MemberId): Promise<Membership>;
    duplicatePublishingWork(id: PublishingId): Promise<PublishingWork>;
    duplicateRecordingProject(id: RecodingId): Promise<RecordingProject>;
    duplicateRelease(id: LabelEntityId): Promise<Release>;
    getAllArtistDevelopments(): Promise<Array<ArtistDevelopment>>;
    getAllKnownUsers(): Promise<Array<SignedInUser>>;
    getAllMembershipProfiles(): Promise<Array<MembershipProfile>>;
    getAllPublishingWorks(): Promise<Array<PublishingWork>>;
    getAllRecordingProjects(): Promise<Array<RecordingProject>>;
    getAllReleases(): Promise<Array<Release>>;
    getArtistDevelopment(id: ArtistDevelopmentId): Promise<ArtistDevelopment>;
    getCallerArtistDevelopments(): Promise<Array<ArtistDevelopment>>;
    getCallerMemberships(): Promise<Array<Membership>>;
    getCallerPublishingWorks(): Promise<Array<PublishingWork>>;
    getCallerRecordingProjects(): Promise<Array<RecordingProject>>;
    getCallerReleases(): Promise<Array<Release>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChangeHistory(recordId: string): Promise<Array<ChangeEvent>>;
    getDashboardStats(): Promise<DashboardStats>;
    getMembershipDetails(id: MemberId): Promise<Membership>;
    getMembershipProfile(id: MemberId): Promise<MembershipProfile>;
    getMembershipProfilesByStatus(status: T): Promise<Array<MembershipProfile>>;
    getPublishingWork(id: PublishingId): Promise<PublishingWork>;
    getRecordingProject(id: RecodingId): Promise<RecordingProject>;
    getRelease(id: LabelEntityId): Promise<Release>;
    getRemainingRolloutSteps(): Promise<Array<[string, string]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    updateArtistDevelopment(id: ArtistDevelopmentId, request: CreateArtistDevelopmentRequest): Promise<ArtistDevelopment>;
    updateKnownUserRole(): Promise<void>;
    updateMembership(id: MemberId, name: string, email: string, status: T): Promise<MembershipProfile>;
    updateMembershipLinks(id: MemberId, artistIds: Array<ArtistDevelopmentId>, workIds: Array<PublishingId>, releaseIds: Array<LabelEntityId>, projectIds: Array<RecodingId>): Promise<void>;
    updateMembershipProfileFields(id: MemberId, name: string, email: string): Promise<MembershipProfile>;
    updateMembershipStatus(id: MemberId, status: T): Promise<MembershipProfile>;
    updatePublishingWork(id: PublishingId, request: CreatePublishingWorkRequest): Promise<PublishingWork>;
    updateRecordingProject(id: RecodingId, request: CreateRecordingProjectRequest): Promise<RecordingProject>;
    updateRelease(id: LabelEntityId, request: CreateReleaseRequest): Promise<Release>;
}
