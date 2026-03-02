import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  UserProfile,
  MembershipProfile,
  Membership,
  PublishingWork,
  Release,
  RecordingProject,
  ArtistDevelopment,
  UserRole,
  ProjectStatus,
  T as MemberStatusT,
  SignedInUser,
  UserApprovalInfo,
  ApprovalStatus,
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
      queryClient.invalidateQueries({ queryKey: ['knownUsers'] });
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
    retry: false,
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
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
    },
  });
}

export function useGetAllKnownUsers() {
  const { actor, isFetching } = useActor();

  return useQuery<SignedInUser[]>({
    queryKey: ['knownUsers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllKnownUsers();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

// ─── Memberships ─────────────────────────────────────────────────────────────

export function useGetAllMembershipProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<MembershipProfile[]>({
    queryKey: ['allMembershipProfiles'],
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

export function useGetMembershipDetails(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Membership | null>({
    queryKey: ['membershipDetails', id],
    queryFn: async () => {
      if (!actor) return null;
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
      return actor.createMembershipProfile(id, name, email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allMembershipProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['callerMemberships'] });
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
      queryClient.invalidateQueries({ queryKey: ['allMembershipProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['callerMemberships'] });
      queryClient.invalidateQueries({ queryKey: ['membershipDetails', variables.id] });
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
      queryClient.invalidateQueries({ queryKey: ['allMembershipProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['callerMemberships'] });
      queryClient.invalidateQueries({ queryKey: ['membershipDetails', variables.id] });
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

// ─── Publishing Works ─────────────────────────────────────────────────────────

export function useGetAllPublishingWorks() {
  const { actor, isFetching } = useActor();

  return useQuery<PublishingWork[]>({
    queryKey: ['allPublishingWorks'],
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
      if (!actor) return null;
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
      return actor.createPublishingWork(title, contributors, ownershipSplits, iswc, isrc, registrationStatus);
    },
    onSuccess: () => {
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
      workId: string;
      memberIds: string[];
      artistIds: string[];
      releaseIds: string[];
      projectIds: string[];
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

export function useGetAllReleases() {
  const { actor, isFetching } = useActor();

  return useQuery<Release[]>({
    queryKey: ['allReleases'],
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
      if (!actor) return null;
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
      return actor.createRelease(title, releaseType, tracklist, keyDates, owners);
    },
    onSuccess: () => {
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
      releaseId: string;
      memberIds: string[];
      artistIds: string[];
      workIds: string[];
      projectIds: string[];
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

export function useGetAllRecordingProjects() {
  const { actor, isFetching } = useActor();

  return useQuery<RecordingProject[]>({
    queryKey: ['allRecordingProjects'],
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
      if (!actor) return null;
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
      return actor.createRecordingProject(title, participants, sessionDate, status, notes);
    },
    onSuccess: () => {
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
      projectId: string;
      memberIds: string[];
      artistIds: string[];
      workIds: string[];
      releaseIds: string[];
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

export function useGetAllArtistDevelopment() {
  const { actor, isFetching } = useActor();

  return useQuery<ArtistDevelopment[]>({
    queryKey: ['allArtistDevelopment'],
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
    queryKey: ['artistDevelopment', id],
    queryFn: async () => {
      if (!actor) return null;
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
      return actor.createArtistDevelopment(artistId, goals, plans, milestones, internalNotes);
    },
    onSuccess: () => {
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
      artistDevelopmentId: string;
      relatedMemberships: string[];
      relatedPublishing: string[];
      relatedLabelEntities: string[];
      relatedRecordingProjects: string[];
      relatedArtistDevelopment: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateArtistDevelopmentLinks(
        artistDevelopmentId,
        relatedMemberships,
        relatedPublishing,
        relatedLabelEntities,
        relatedRecordingProjects,
        relatedArtistDevelopment,
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

  return useQuery<{
    memberships: [string, Membership][];
    publishingWorks: PublishingWork[];
    releases: Release[];
    recordingProjects: RecordingProject[];
    artistDevelopment: ArtistDevelopment[];
  }>({
    queryKey: ['entitiesForCaller'],
    queryFn: async () => {
      if (!actor) return {
        memberships: [],
        publishingWorks: [],
        releases: [],
        recordingProjects: [],
        artistDevelopment: [],
      };
      try {
        return await actor.getEntitiesForCaller();
      } catch {
        return {
          memberships: [],
          publishingWorks: [],
          releases: [],
          recordingProjects: [],
          artistDevelopment: [],
        };
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin / Approvals ────────────────────────────────────────────────────────

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
      return actor.requestApproval();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isCallerApproved'] });
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
    mutationFn: async ({ user, status }: { user: Principal; status: ApprovalStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listApprovals'] });
    },
  });
}

export function useAssignCallerUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knownUsers'] });
      queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
    },
  });
}
