import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Principal } from '@dfinity/principal';
import type {
  UserProfile,
  MembershipProfile,
  Membership,
  T as MemberStatus,
  DashboardStats,
  UserRole,
  ApprovalStatus,
} from '../backend';

// ─── Local entity types ───────────────────────────────────────────────────────
// These are not exported from backend.d.ts; they mirror the Motoko types.

export interface PublishingWork {
  id: string;
  owner: Principal;
  title: string;
  contributors: string[];
  ownershipSplits: [string, bigint][];
  iswc?: string | null;
  isrc?: string | null;
  registrationStatus: string;
  notes: string;
  linkedMembers: string[];
  linkedArtists: string[];
  linkedReleases: string[];
  linkedProjects: string[];
  created_at: bigint;
}

export interface Release {
  id: string;
  owner: Principal;
  title: string;
  releaseType: string;
  tracklist: string[];
  keyDates: string[];
  owners: string[];
  workflowChecklist: string[];
  linkedMembers: string[];
  linkedArtists: string[];
  linkedWorks: string[];
  linkedProjects: string[];
  created_at: bigint;
}

export interface RecordingProject {
  id: string;
  owner: Principal;
  title: string;
  participants: string[];
  sessionDate: bigint;
  status: import('../backend').ProjectStatus;
  notes: string;
  assetReferences: string[];
  linkedMembers: string[];
  linkedArtists: string[];
  linkedWorks: string[];
  linkedReleases: string[];
  created_at: bigint;
}

export interface ArtistDevelopment {
  id: string;
  owner: Principal;
  artistId: string;
  goals: string[];
  plans: string[];
  milestones: string[];
  internalNotes: string;
  relatedMemberships: string[];
  relatedPublishing: string[];
  relatedLabelEntities: string[];
  relatedRecordingProjects: string[];
  relatedArtistDevelopment: string[];
  created_at: bigint;
}

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── User Role ────────────────────────────────────────────────────────────────

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Known Users ─────────────────────────────────────────────────────────────

export function useGetAllKnownUsers() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['knownUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllKnownUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateKnownUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateKnownUserRole();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knownUsers'] });
    },
  });
}

// ─── Role Assignment ──────────────────────────────────────────────────────────

export function useAssignRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knownUsers'] });
    },
  });
}

// ─── Approvals ────────────────────────────────────────────────────────────────

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['isCallerApproved'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerApproved();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListApprovals() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApprovals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRequestApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestApproval();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isCallerApproved'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, status }: { user: Principal; status: ApprovalStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}

// ─── Change History ───────────────────────────────────────────────────────────

export function useGetChangeHistory(recordId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['changeHistory', recordId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChangeHistory(recordId);
    },
    enabled: !!actor && !isFetching && !!recordId,
  });
}

// ─── Memberships ──────────────────────────────────────────────────────────────

export function useGetCallerMemberships() {
  const { actor, isFetching } = useActor();

  return useQuery<Membership[]>({
    queryKey: ['callerMemberships'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerMemberships();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllMembershipProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<MembershipProfile[]>({
    queryKey: ['allMembershipProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMembershipProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMembershipDetails(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Membership>({
    queryKey: ['membershipDetails', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMembershipDetails(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateMembership() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, email }: { id: string; name: string; email: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createMembershipProfile(id, name, email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerMemberships'] });
      queryClient.invalidateQueries({ queryKey: ['allMembershipProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

// Alias for backward compatibility
export function useCreateMembershipProfile() {
  return useCreateMembership();
}

export function useUpdateMembership() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, email, status }: { id: string; name: string; email: string; status: MemberStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMembership(id, name, email, status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membershipDetails', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['callerMemberships'] });
      queryClient.invalidateQueries({ queryKey: ['allMembershipProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useUpdateMembershipProfileFields() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, email }: { id: string; name: string; email: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMembershipProfileFields(id, name, email);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membershipDetails', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['callerMemberships'] });
      queryClient.invalidateQueries({ queryKey: ['allMembershipProfiles'] });
    },
  });
}

export function useUpdateMembershipStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: MemberStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMembershipStatus(id, status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membershipDetails', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['callerMemberships'] });
      queryClient.invalidateQueries({ queryKey: ['allMembershipProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useUpdateMembershipLinks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      artistIds,
      workIds,
      releaseIds,
      projectIds,
    }: {
      id: string;
      artistIds: string[];
      workIds: string[];
      releaseIds: string[];
      projectIds: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMembershipLinks(id, artistIds, workIds, releaseIds, projectIds);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membershipDetails', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['callerMemberships'] });
    },
  });
}

export function useBulkDeleteMemberships() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bulkDeleteMembershipProfiles(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerMemberships'] });
      queryClient.invalidateQueries({ queryKey: ['allMembershipProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useDuplicateMembership() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.duplicateMembership(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerMemberships'] });
      queryClient.invalidateQueries({ queryKey: ['allMembershipProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

// ─── Publishing Works ─────────────────────────────────────────────────────────

export function useGetPublishingWorks() {
  const { actor, isFetching } = useActor();

  return useQuery<PublishingWork[]>({
    queryKey: ['publishingWorks'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getCallerPublishingWorks?.() ?? [];
      return result;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllPublishingWorks() {
  const { actor, isFetching } = useActor();

  return useQuery<PublishingWork[]>({
    queryKey: ['allPublishingWorks'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getAllPublishingWorks?.() ?? [];
      return result;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPublishingWork(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PublishingWork>({
    queryKey: ['publishingWorkDetails', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).getPublishingWork(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreatePublishingWork() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      contributors,
      ownershipSplits,
      iswc,
      isrc,
      registrationStatus,
      notes,
    }: {
      id?: string;
      title: string;
      contributors?: string[];
      ownershipSplits?: [string, bigint][];
      iswc?: string | null;
      isrc?: string | null;
      registrationStatus?: string;
      notes?: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const resolvedId = id ?? `pw-${Date.now()}`;
      return (actor as any).createPublishingWork(
        resolvedId,
        title,
        contributors ?? [],
        ownershipSplits ?? [],
        registrationStatus ?? '',
        notes ?? '',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishingWorks'] });
      queryClient.invalidateQueries({ queryKey: ['allPublishingWorks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useUpdatePublishingWork() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      registrationStatus,
      contributors,
      ownershipSplits,
      notes,
    }: {
      id: string;
      title: string;
      registrationStatus: string;
      contributors: string[];
      ownershipSplits: [string, bigint][];
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updatePublishingWork(
        id,
        title,
        contributors,
        ownershipSplits,
        registrationStatus,
        notes,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publishingWorkDetails', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['publishingWorks'] });
      queryClient.invalidateQueries({ queryKey: ['allPublishingWorks'] });
    },
  });
}

export function useLinkPublishingWorkToEntities() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workId,
      memberIds,
      artistIds,
      releaseIds,
      projectIds,
    }: {
      workId: string;
      memberIds: string[];
      artistIds: string[];
      releaseIds: string[];
      projectIds: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updatePublishingWorkLinks(workId, memberIds, artistIds, releaseIds, projectIds);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publishingWorkDetails', variables.workId] });
      queryClient.invalidateQueries({ queryKey: ['publishingWorks'] });
      queryClient.invalidateQueries({ queryKey: ['allPublishingWorks'] });
    },
  });
}

export function useBulkDeletePublishingWorks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).bulkDeletePublishingWorks(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishingWorks'] });
      queryClient.invalidateQueries({ queryKey: ['allPublishingWorks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useDuplicatePublishingWork() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).duplicatePublishingWork(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishingWorks'] });
      queryClient.invalidateQueries({ queryKey: ['allPublishingWorks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

// ─── Releases ─────────────────────────────────────────────────────────────────

export function useGetReleases() {
  const { actor, isFetching } = useActor();

  return useQuery<Release[]>({
    queryKey: ['releases'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getCallerReleases?.() ?? [];
      return result;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllReleases() {
  const { actor, isFetching } = useActor();

  return useQuery<Release[]>({
    queryKey: ['allReleases'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getAllReleases?.() ?? [];
      return result;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRelease(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Release>({
    queryKey: ['releaseDetails', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).getRelease(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateRelease() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      releaseType,
      tracklist,
      keyDates,
      owners,
      workflowChecklist,
    }: {
      title: string;
      releaseType: string;
      tracklist: string[];
      keyDates?: string[];
      owners: string[];
      workflowChecklist?: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      const id = `rel-${Date.now()}`;
      return (actor as any).createRelease(
        id,
        title,
        releaseType,
        tracklist,
        keyDates ?? [],
        owners,
        workflowChecklist ?? [],
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      queryClient.invalidateQueries({ queryKey: ['allReleases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useUpdateRelease() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      releaseId,
      title,
      releaseType,
      tracklist,
      keyDates,
      workflowChecklist,
    }: {
      releaseId: string;
      title: string;
      releaseType: string;
      tracklist: string[];
      keyDates: string[];
      workflowChecklist: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateRelease(
        releaseId,
        title,
        releaseType,
        tracklist,
        keyDates,
        [],
        workflowChecklist,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['releaseDetails', variables.releaseId] });
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      queryClient.invalidateQueries({ queryKey: ['allReleases'] });
    },
  });
}

export function useLinkReleaseToEntities() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      releaseId,
      memberIds,
      artistIds,
      workIds,
      projectIds,
    }: {
      releaseId: string;
      memberIds: string[];
      artistIds: string[];
      workIds: string[];
      projectIds: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateReleaseLinks(releaseId, memberIds, artistIds, workIds, projectIds);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['releaseDetails', variables.releaseId] });
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      queryClient.invalidateQueries({ queryKey: ['allReleases'] });
    },
  });
}

export function useBulkDeleteReleases() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).bulkDeleteReleases(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      queryClient.invalidateQueries({ queryKey: ['allReleases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useDuplicateRelease() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).duplicateRelease(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      queryClient.invalidateQueries({ queryKey: ['allReleases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

// ─── Recording Projects ───────────────────────────────────────────────────────

export function useGetRecordingProjects() {
  const { actor, isFetching } = useActor();

  return useQuery<RecordingProject[]>({
    queryKey: ['recordingProjects'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getCallerRecordingProjects?.() ?? [];
      return result;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllRecordingProjects() {
  const { actor, isFetching } = useActor();

  return useQuery<RecordingProject[]>({
    queryKey: ['allRecordingProjects'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getAllRecordingProjects?.() ?? [];
      return result;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRecordingProject(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<RecordingProject>({
    queryKey: ['recordingProjectDetails', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).getRecordingProject(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateRecordingProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      participants,
      sessionDate,
      status,
      notes,
    }: {
      title: string;
      participants: string[];
      sessionDate: bigint;
      status: import('../backend').ProjectStatus;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const id = `rp-${Date.now()}`;
      return (actor as any).createRecordingProject(id, title, participants, sessionDate, status, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordingProjects'] });
      queryClient.invalidateQueries({ queryKey: ['allRecordingProjects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useUpdateRecordingProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      title,
      participants,
      sessionDate,
      status,
      notes,
    }: {
      projectId: string;
      title: string;
      participants: string[];
      sessionDate: bigint;
      status: import('../backend').ProjectStatus;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateRecordingProject(projectId, title, participants, sessionDate, status, notes);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recordingProjectDetails', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['recordingProjects'] });
      queryClient.invalidateQueries({ queryKey: ['allRecordingProjects'] });
    },
  });
}

export function useLinkProjectToEntities() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      memberIds,
      artistIds,
      workIds,
      releaseIds,
    }: {
      projectId: string;
      memberIds: string[];
      artistIds: string[];
      workIds: string[];
      releaseIds: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateRecordingProjectLinks(projectId, memberIds, artistIds, workIds, releaseIds);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recordingProjectDetails', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['recordingProjects'] });
      queryClient.invalidateQueries({ queryKey: ['allRecordingProjects'] });
    },
  });
}

export function useBulkDeleteRecordingProjects() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).bulkDeleteRecordingProjects(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordingProjects'] });
      queryClient.invalidateQueries({ queryKey: ['allRecordingProjects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useDuplicateRecordingProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).duplicateRecordingProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordingProjects'] });
      queryClient.invalidateQueries({ queryKey: ['allRecordingProjects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

// ─── Artist Development ───────────────────────────────────────────────────────

export function useGetArtistDevelopmentList() {
  const { actor, isFetching } = useActor();

  return useQuery<ArtistDevelopment[]>({
    queryKey: ['artistDevelopment'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getCallerArtistDevelopment?.() ?? [];
      return result;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllArtistDevelopment() {
  const { actor, isFetching } = useActor();

  return useQuery<ArtistDevelopment[]>({
    queryKey: ['allArtistDevelopment'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getAllArtistDevelopment?.() ?? [];
      return result;
    },
    enabled: !!actor && !isFetching,
  });
}

// Single-item fetch by id — used by ArtistDevelopmentDetail
export function useGetArtistDevelopment(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ArtistDevelopment>({
    queryKey: ['artistDevelopmentDetails', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).getArtistDevelopment(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateArtistDevelopment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      artistId,
      goals,
      plans,
      milestones,
      internalNotes,
    }: {
      artistId: string;
      goals: string[];
      plans: string[];
      milestones: string[];
      internalNotes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const id = `ad-${Date.now()}`;
      return (actor as any).createArtistDevelopment(id, artistId, goals, plans, milestones, internalNotes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artistDevelopment'] });
      queryClient.invalidateQueries({ queryKey: ['allArtistDevelopment'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useUpdateArtistDevelopment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entryId,
      goals,
      plans,
      milestones,
      internalNotes,
    }: {
      entryId: string;
      goals: string[];
      plans: string[];
      milestones: string[];
      internalNotes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateArtistDevelopment(entryId, goals, plans, milestones, internalNotes);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['artistDevelopmentDetails', variables.entryId] });
      queryClient.invalidateQueries({ queryKey: ['artistDevelopment'] });
      queryClient.invalidateQueries({ queryKey: ['allArtistDevelopment'] });
    },
  });
}

export function useUpdateArtistDevelopmentLinks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entryId,
      memberIds,
      publishingIds,
      releaseIds,
      projectIds,
      artistIds,
    }: {
      entryId: string;
      memberIds: string[];
      publishingIds: string[];
      releaseIds: string[];
      projectIds: string[];
      artistIds: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateArtistDevelopmentLinks(entryId, memberIds, publishingIds, releaseIds, projectIds, artistIds);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['artistDevelopmentDetails', variables.entryId] });
      queryClient.invalidateQueries({ queryKey: ['artistDevelopment'] });
      queryClient.invalidateQueries({ queryKey: ['allArtistDevelopment'] });
    },
  });
}

export function useBulkDeleteArtistDevelopment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).bulkDeleteArtistDevelopment(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artistDevelopment'] });
      queryClient.invalidateQueries({ queryKey: ['allArtistDevelopment'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

export function useDuplicateArtistDevelopment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).duplicateArtistDevelopment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artistDevelopment'] });
      queryClient.invalidateQueries({ queryKey: ['allArtistDevelopment'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });
}

// ─── Entities for Caller (cross-entity lookup) ────────────────────────────────

export function useGetEntitiesForCaller() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['entitiesForCaller'],
    queryFn: async () => {
      if (!actor) {
        return {
          memberships: [] as Membership[],
          publishingWorks: [] as PublishingWork[],
          releases: [] as Release[],
          recordingProjects: [] as RecordingProject[],
          artistDevelopment: [] as ArtistDevelopment[],
        };
      }
      const [memberships, publishingWorks, releases, recordingProjects, artistDevelopment] = await Promise.all([
        actor.getCallerMemberships().catch(() => [] as Membership[]),
        ((actor as any).getCallerPublishingWorks?.() as Promise<PublishingWork[]> | undefined)?.catch(() => [] as PublishingWork[]) ?? Promise.resolve([] as PublishingWork[]),
        ((actor as any).getCallerReleases?.() as Promise<Release[]> | undefined)?.catch(() => [] as Release[]) ?? Promise.resolve([] as Release[]),
        ((actor as any).getCallerRecordingProjects?.() as Promise<RecordingProject[]> | undefined)?.catch(() => [] as RecordingProject[]) ?? Promise.resolve([] as RecordingProject[]),
        ((actor as any).getCallerArtistDevelopment?.() as Promise<ArtistDevelopment[]> | undefined)?.catch(() => [] as ArtistDevelopment[]) ?? Promise.resolve([] as ArtistDevelopment[]),
      ]);
      return { memberships, publishingWorks, releases, recordingProjects, artistDevelopment };
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export function useGetDashboardStats() {
  const { actor, isFetching } = useActor();

  return useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}
