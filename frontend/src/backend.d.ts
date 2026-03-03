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
export type ArtistDevelopmentId = string;
export interface SignedInUser {
    principal: Principal;
    role: UserRole;
    profile?: UserProfile;
}
export interface ChangeEvent {
    id: bigint;
    operationType: Variant_link_create_update;
    author: Principal;
    changedFields: Array<string>;
    timestamp: bigint;
    recordId: string;
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
    createMembershipProfile(id: MemberId, name: string, email: string): Promise<MembershipProfile>;
    duplicateMembership(id: MemberId): Promise<Membership>;
    getAllKnownUsers(): Promise<Array<SignedInUser>>;
    getAllMembershipProfiles(): Promise<Array<MembershipProfile>>;
    getCallerMemberships(): Promise<Array<Membership>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChangeHistory(recordId: string): Promise<Array<ChangeEvent>>;
    getDashboardStats(): Promise<DashboardStats>;
    getMembershipDetails(id: MemberId): Promise<Membership>;
    getMembershipProfile(id: MemberId): Promise<MembershipProfile>;
    getMembershipProfilesByStatus(status: T): Promise<Array<MembershipProfile>>;
    getRemainingRolloutSteps(): Promise<Array<[string, string]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    updateKnownUserRole(): Promise<void>;
    updateMembership(id: MemberId, name: string, email: string, status: T): Promise<MembershipProfile>;
    updateMembershipLinks(id: MemberId, artistIds: Array<ArtistDevelopmentId>, workIds: Array<PublishingId>, releaseIds: Array<LabelEntityId>, projectIds: Array<RecodingId>): Promise<void>;
    updateMembershipProfileFields(id: MemberId, name: string, email: string): Promise<MembershipProfile>;
    updateMembershipStatus(id: MemberId, status: T): Promise<MembershipProfile>;
}
