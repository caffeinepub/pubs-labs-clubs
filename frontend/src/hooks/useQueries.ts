import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  UserProfile,
  MembershipProfile,
  Membership,
  PublishingWork,
  Release,
  RecordingProject,
  ArtistDevelopment,
  UserApprovalInfo,
  ApprovalStatus,
  UserRole,
  SignedInUser,
  T as MemberStatusT,
  ProjectStatus,
  ArtistDevelopmentId,
  MemberId,
  PublishingId,
  LabelEntityId,
  RecodingId,
} from '../backend';
import { Principal } from '@dfinity/principal';

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

export function useGetAllKnownUsers() {
  const { actor, isFetching } = useActor();

  return useQuery<SignedInUser[]>({
    queryKey: ['allKnownUsers'],
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
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['allKnownUsers'] });
    },
  });
}

// ─── Memberships ─────────────────────────────────────────────────────────────

export function useGetCallerMemberships() {
  const { actor, isFetching } = useActor();

  return useQuery<Membership[]>({
    queryKey: ['memberships'],
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

export function useGetMembershipDetails(id: MemberId) {
  const { actor, isFetching } = useActor();

  return useQuery<Membership>({
    queryKey: ['membership', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMembershipDetails(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateMembershipProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, email }: { id: string; name: string; email: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createMembershipProfile(id, name, email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      queryClient.invalidateQueries({ queryKey: ['allMembershipProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
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
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      queryClient.invalidateQueries({ queryKey: ['allMembershipProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['membership', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
    },
  });
}

export function useUpdateMembership() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      email,
      status,
    }: {
      id: string;
      name: string;
      email: string;
      status: MemberStatusT;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMembership(id, name, email, status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      queryClient.invalidateQueries({ queryKey: ['allMembershipProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['membership', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
    },
  });
}

export function useUpdateMembershipStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: MemberStatusT }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMembershipStatus(id, status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      queryClient.invalidateQueries({ queryKey: ['allMembershipProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['membership', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
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
      id: MemberId;
      artistIds: ArtistDevelopmentId[];
      workIds: PublishingId[];
      releaseIds: LabelEntityId[];
      projectIds: RecodingId[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMembershipLinks(id, artistIds, workIds, releaseIds, projectIds);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membership', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
    },
  });
}

// ─── Publishing Works ─────────────────────────────────────────────────────────

export function useGetPublishingWork(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PublishingWork>({
    queryKey: ['publishingWork', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPublishingWork(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useGetAllPublishingWorks() {
  const { actor, isFetching } = useActor();

  return useQuery<PublishingWork[]>({
    queryKey: ['allPublishingWorks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPublishingWorks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePublishingWork() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      contributors,
      ownershipSplits,
      iswc,
      isrc,
      registrationStatus,
    }: {
      title: string;
      contributors: string[];
      ownershipSplits: [string, bigint][];
      iswc: string | null;
      isrc: string | null;
      registrationStatus: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPublishingWork(title, contributors, ownershipSplits, iswc, isrc, registrationStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPublishingWorks'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
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
      return actor.updatePublishingWork(id, title, registrationStatus, contributors, ownershipSplits, notes);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publishingWork', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['allPublishingWorks'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
    },
  });
}

export function useAddPublishingWorkNotes() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPublishingWorkNotes(id, notes);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publishingWork', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['allPublishingWorks'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
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
      workId: PublishingId;
      memberIds: MemberId[];
      artistIds: ArtistDevelopmentId[];
      releaseIds: LabelEntityId[];
      projectIds: RecodingId[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.linkPublishingWorkToEntities(workId, memberIds, artistIds, releaseIds, projectIds);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publishingWork', variables.workId] });
      queryClient.invalidateQueries({ queryKey: ['allPublishingWorks'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
    },
  });
}

// ─── Releases ─────────────────────────────────────────────────────────────────

export function useGetRelease(releaseId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Release>({
    queryKey: ['release', releaseId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getRelease(releaseId);
    },
    enabled: !!actor && !isFetching && !!releaseId,
  });
}

export function useGetAllReleases() {
  const { actor, isFetching } = useActor();

  return useQuery<Release[]>({
    queryKey: ['allReleases'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReleases();
    },
    enabled: !!actor && !isFetching,
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
    }: {
      title: string;
      releaseType: string;
      tracklist: string[];
      keyDates: string[];
      owners: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createRelease(title, releaseType, tracklist, keyDates, owners);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allReleases'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
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
      return actor.updateRelease(releaseId, title, releaseType, tracklist, keyDates, workflowChecklist);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['release', variables.releaseId] });
      queryClient.invalidateQueries({ queryKey: ['allReleases'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
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
      releaseId: LabelEntityId;
      memberIds: MemberId[];
      artistIds: ArtistDevelopmentId[];
      workIds: PublishingId[];
      projectIds: RecodingId[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.linkReleaseToEntities(releaseId, memberIds, artistIds, workIds, projectIds);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['release', variables.releaseId] });
      queryClient.invalidateQueries({ queryKey: ['allReleases'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
    },
  });
}

// ─── Recording Projects ───────────────────────────────────────────────────────

export function useGetRecordingProject(projectId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<RecordingProject>({
    queryKey: ['recordingProject', projectId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getRecordingProject(projectId);
    },
    enabled: !!actor && !isFetching && !!projectId,
  });
}

export function useGetAllRecordingProjects() {
  const { actor, isFetching } = useActor();

  return useQuery<RecordingProject[]>({
    queryKey: ['allRecordingProjects'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRecordingProjects();
    },
    enabled: !!actor && !isFetching,
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
      status: ProjectStatus;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createRecordingProject(title, participants, sessionDate, status, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allRecordingProjects'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
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
      status: ProjectStatus;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateRecordingProject(projectId, title, participants, sessionDate, status, notes);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recordingProject', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['allRecordingProjects'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
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
      projectId: RecodingId;
      memberIds: MemberId[];
      artistIds: ArtistDevelopmentId[];
      workIds: PublishingId[];
      releaseIds: LabelEntityId[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.linkProjectToEntities(projectId, memberIds, artistIds, workIds, releaseIds);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recordingProject', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['allRecordingProjects'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
    },
  });
}

// ─── Artist Development ───────────────────────────────────────────────────────

export function useGetArtistDevelopment(entryId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ArtistDevelopment>({
    queryKey: ['artistDevelopment', entryId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getArtistDevelopment(entryId);
    },
    enabled: !!actor && !isFetching && !!entryId,
  });
}

export function useGetAllArtistDevelopment() {
  const { actor, isFetching } = useActor();

  return useQuery<ArtistDevelopment[]>({
    queryKey: ['allArtistDevelopment'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllArtistDevelopment();
    },
    enabled: !!actor && !isFetching,
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
      return actor.createArtistDevelopment(artistId, goals, plans, milestones, internalNotes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allArtistDevelopment'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
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
      return actor.updateArtistDevelopment(entryId, goals, plans, milestones, internalNotes);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['artistDevelopment', variables.entryId] });
      queryClient.invalidateQueries({ queryKey: ['allArtistDevelopment'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
    },
  });
}

export function useUpdateArtistDevelopmentLinks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      artistDevelopmentId,
      relatedMemberships,
      relatedPublishing,
      relatedLabelEntities,
      relatedRecordingProjects,
      relatedArtistDevelopment,
    }: {
      artistDevelopmentId: ArtistDevelopmentId;
      relatedMemberships: MemberId[];
      relatedPublishing: PublishingId[];
      relatedLabelEntities: LabelEntityId[];
      relatedRecordingProjects: RecodingId[];
      relatedArtistDevelopment: ArtistDevelopmentId[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateArtistDevelopmentLinks(
        artistDevelopmentId,
        relatedMemberships,
        relatedPublishing,
        relatedLabelEntities,
        relatedRecordingProjects,
        relatedArtistDevelopment
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['artistDevelopment', variables.artistDevelopmentId] });
      queryClient.invalidateQueries({ queryKey: ['allArtistDevelopment'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
    },
  });
}

// ─── Entities for Caller ──────────────────────────────────────────────────────

export function useGetEntitiesForCaller() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['entitiesForCaller'],
    queryFn: async () => {
      if (!actor) return {
        memberships: [] as [string, Membership][],
        publishingWorks: [] as PublishingWork[],
        releases: [] as Release[],
        recordingProjects: [] as RecordingProject[],
        artistDevelopment: [] as ArtistDevelopment[],
      };
      return actor.getEntitiesForCaller();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin / Approval ─────────────────────────────────────────────────────────

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerApproved'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerApproved();
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
      queryClient.invalidateQueries({ queryKey: ['listApprovals'] });
    },
  });
}

export function useListApprovals() {
  const { actor, isFetching } = useActor();

  return useQuery<UserApprovalInfo[]>({
    queryKey: ['listApprovals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApprovals();
    },
    enabled: !!actor && !isFetching,
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
      queryClient.invalidateQueries({ queryKey: ['listApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerApproved'] });
    },
  });
}

export function useAssignRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['allKnownUsers'] });
    },
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
