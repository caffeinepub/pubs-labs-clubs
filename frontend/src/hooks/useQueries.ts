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
  SignedInUser,
  UserApprovalInfo,
  T as MemberStatusT,
  ProjectStatus,
  UserRole,
  MemberId,
  PublishingId,
  LabelEntityId,
  RecodingId,
  ArtistDevelopmentId,
} from '../backend';
import { ApprovalStatus } from '../backend';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
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
      await actor.saveCallerUserProfile(profile);
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
      try {
        return await actor.getCallerUserRole();
      } catch {
        return 'guest' as UserRole;
      }
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
      try {
        return await actor.getAllKnownUsers();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignCallerUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: string; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      await actor.assignCallerUserRole(Principal.fromText(user), role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allKnownUsers'] });
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
    },
  });
}

// ─── Membership ───────────────────────────────────────────────────────────────

export function useGetAllMembershipProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<MembershipProfile[]>({
    queryKey: ['membershipProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllMembershipProfiles();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerMemberships() {
  const { actor, isFetching } = useActor();

  return useQuery<Membership[]>({
    queryKey: ['callerMemberships'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getCallerMemberships();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMembershipDetails(id: MemberId) {
  const { actor, isFetching } = useActor();

  return useQuery<Membership | null>({
    queryKey: ['membershipDetails', id],
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        return await actor.getMembershipDetails(id);
      } catch {
        return null;
      }
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
      return await actor.createMembershipProfile(id, name, email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membershipProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['callerMemberships'] });
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
      return await actor.updateMembershipProfileFields(id, name, email);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membershipProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['membershipDetails', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['callerMemberships'] });
    },
  });
}

export function useUpdateMembershipStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: MemberStatusT }) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.updateMembershipStatus(id, status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membershipProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['membershipDetails', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['callerMemberships'] });
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
      await actor.updateMembershipLinks(id, artistIds, workIds, releaseIds, projectIds);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membershipDetails', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['callerMemberships'] });
    },
  });
}

// ─── Publishing ───────────────────────────────────────────────────────────────

export function useGetAllPublishingWorks() {
  const { actor, isFetching } = useActor();

  return useQuery<PublishingWork[]>({
    queryKey: ['publishingWorks'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllPublishingWorks();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPublishingWork(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<PublishingWork | null>({
    queryKey: ['publishingWork', id],
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        return await actor.getPublishingWork(id);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!id,
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
      return await actor.createPublishingWork(title, contributors, ownershipSplits, iswc, isrc, registrationStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishingWorks'] });
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
      await actor.addPublishingWorkNotes(id, notes);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publishingWork', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['publishingWorks'] });
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
      await actor.linkPublishingWorkToEntities(workId, memberIds, artistIds, releaseIds, projectIds);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publishingWork', variables.workId] });
      queryClient.invalidateQueries({ queryKey: ['publishingWorks'] });
    },
  });
}

// ─── Releases ─────────────────────────────────────────────────────────────────

export function useGetAllReleases() {
  const { actor, isFetching } = useActor();

  return useQuery<Release[]>({
    queryKey: ['releases'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllReleases();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRelease(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Release | null>({
    queryKey: ['release', id],
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        return await actor.getRelease(id);
      } catch {
        return null;
      }
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
    }: {
      title: string;
      releaseType: string;
      tracklist: string[];
      keyDates: string[];
      owners: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.createRelease(title, releaseType, tracklist, keyDates, owners);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
    },
  });
}

export function useAssignReleaseOwners() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ releaseId, owners }: { releaseId: string; owners: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.assignReleaseOwners(releaseId, owners);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['release', variables.releaseId] });
      queryClient.invalidateQueries({ queryKey: ['releases'] });
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
      await actor.linkReleaseToEntities(releaseId, memberIds, artistIds, workIds, projectIds);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['release', variables.releaseId] });
      queryClient.invalidateQueries({ queryKey: ['releases'] });
    },
  });
}

// ─── Recording Projects ───────────────────────────────────────────────────────

export function useGetAllRecordingProjects() {
  const { actor, isFetching } = useActor();

  return useQuery<RecordingProject[]>({
    queryKey: ['recordingProjects'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllRecordingProjects();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRecordingProject(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<RecordingProject | null>({
    queryKey: ['recordingProject', id],
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        return await actor.getRecordingProject(id);
      } catch {
        return null;
      }
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
      status: ProjectStatus;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return await actor.createRecordingProject(title, participants, sessionDate, status, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordingProjects'] });
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
      projectId: string;
      memberIds: string[];
      artistIds: string[];
      workIds: string[];
      releaseIds: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.linkProjectToEntities(projectId, memberIds, artistIds, workIds, releaseIds);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recordingProject', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['recordingProjects'] });
    },
  });
}

// ─── Artist Development ───────────────────────────────────────────────────────

export function useGetAllArtistDevelopment() {
  const { actor, isFetching } = useActor();

  return useQuery<ArtistDevelopment[]>({
    queryKey: ['artistDevelopment'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllArtistDevelopment();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetArtistDevelopment(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ArtistDevelopment | null>({
    queryKey: ['artistDevelopmentEntry', id],
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        return await actor.getArtistDevelopment(id);
      } catch {
        return null;
      }
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
      return await actor.createArtistDevelopment(artistId, goals, plans, milestones, internalNotes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artistDevelopment'] });
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
      artistDevelopmentId: string;
      relatedMemberships: string[];
      relatedPublishing: string[];
      relatedLabelEntities: string[];
      relatedRecordingProjects: string[];
      relatedArtistDevelopment: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateArtistDevelopmentLinks(
        artistDevelopmentId,
        relatedMemberships,
        relatedPublishing,
        relatedLabelEntities,
        relatedRecordingProjects,
        relatedArtistDevelopment
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['artistDevelopmentEntry', variables.artistDevelopmentId] });
      queryClient.invalidateQueries({ queryKey: ['artistDevelopment'] });
    },
  });
}

// ─── Entities For Caller ──────────────────────────────────────────────────────

export function useGetEntitiesForCaller() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['entitiesForCaller'],
    queryFn: async () => {
      if (!actor) return { memberships: [], publishingWorks: [], releases: [], recordingProjects: [], artistDevelopment: [] };
      try {
        const result = await actor.getEntitiesForCaller();
        return {
          memberships: result.memberships ?? [],
          publishingWorks: result.publishingWorks ?? [],
          releases: result.releases ?? [],
          recordingProjects: result.recordingProjects ?? [],
          artistDevelopment: result.artistDevelopment ?? [],
        };
      } catch {
        return { memberships: [], publishingWorks: [], releases: [], recordingProjects: [], artistDevelopment: [] };
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Approval ─────────────────────────────────────────────────────────────────

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerApproved'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerApproved();
      } catch {
        return false;
      }
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
      await actor.requestApproval();
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
      try {
        return await actor.listApprovals();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, status }: { user: string; status: ApprovalStatus }) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      await actor.setApproval(Principal.fromText(user), status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerApproved'] });
    },
  });
}

// ─── Rollout Steps ────────────────────────────────────────────────────────────

export function useGetRemainingRolloutSteps() {
  const { actor, isFetching } = useActor();

  return useQuery<[string, string][]>({
    queryKey: ['remainingRolloutSteps'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getRemainingRolloutSteps();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Link helpers (membership) ────────────────────────────────────────────────

export function useLinkMembershipToEntities() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      artistIds,
      workIds,
      releaseIds,
      projectIds,
    }: {
      memberId: string;
      artistIds: string[];
      workIds: string[];
      releaseIds: string[];
      projectIds: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.linkMembershipToEntities(memberId, artistIds, workIds, releaseIds, projectIds);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membershipDetails', variables.memberId] });
      queryClient.invalidateQueries({ queryKey: ['callerMemberships'] });
    },
  });
}
