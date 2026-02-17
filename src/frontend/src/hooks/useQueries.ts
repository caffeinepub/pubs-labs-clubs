import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { 
  UserProfile, 
  MembershipProfile, 
  PublishingWork, 
  Release, 
  RecordingProject, 
  ArtistDevelopment,
  UserApprovalInfo,
  T as MemberStatus,
  ProjectStatus,
  Membership,
  SignedInUser,
  UserRole
} from '../backend';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched
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
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save profile');
    }
  });
}

// Role Management Queries
export function useGetAllKnownUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SignedInUser[]>({
    queryKey: ['allKnownUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllKnownUsers();
    },
    enabled: !!actor && !actorFetching
  });
}

export function useAssignUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { principal: string; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(data.principal);
      return actor.assignCallerUserRole(principal, data.role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allKnownUsers'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
      toast.success('User role updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user role');
    }
  });
}

// Approval Queries
export function useRequestApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestApproval();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserApproval'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to request approval');
    }
  });
}

export function useListApprovals() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserApprovalInfo[]>({
    queryKey: ['approvals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApprovals();
    },
    enabled: !!actor && !actorFetching
  });
}

// Membership Queries
export function useGetAllMembershipProfiles(enabled: boolean = true) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MembershipProfile[]>({
    queryKey: ['memberships'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMembershipProfiles();
    },
    enabled: !!actor && !actorFetching && enabled
  });
}

export function useGetMembershipProfile(id: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MembershipProfile>({
    queryKey: ['membership', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMembershipProfile(id);
    },
    enabled: !!actor && !actorFetching && !!id
  });
}

export function useGetMembershipDetails(id: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Membership>({
    queryKey: ['membershipDetails', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMembershipDetails(id);
    },
    enabled: !!actor && !actorFetching && !!id
  });
}

export function useCreateMembershipProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; name: string; email: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createMembershipProfile(data.id, data.name, data.email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
      toast.success('Membership profile created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create membership');
    }
  });
}

export function useUpdateMembershipProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; name: string; email: string; status: MemberStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMembershipProfile(data.id, data.name, data.email, data.status);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      queryClient.invalidateQueries({ queryKey: ['membership', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['membershipDetails', variables.id] });
      toast.success('Membership updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update membership');
    }
  });
}

// Publishing Queries
export function useGetAllPublishingWorks(enabled: boolean = true) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PublishingWork[]>({
    queryKey: ['publishingWorks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPublishingWorks();
    },
    enabled: !!actor && !actorFetching && enabled
  });
}

export function useGetPublishingWork(id: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PublishingWork>({
    queryKey: ['publishingWork', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPublishingWork(id);
    },
    enabled: !!actor && !actorFetching && !!id
  });
}

export function useCreatePublishingWork() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      contributors: string[];
      ownershipSplits: [string, bigint][];
      iswc: string | null;
      isrc: string | null;
      registrationStatus: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPublishingWork(
        data.title,
        data.contributors,
        data.ownershipSplits,
        data.iswc,
        data.isrc,
        data.registrationStatus
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishingWorks'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
      toast.success('Publishing work created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create work');
    }
  });
}

export function useAddPublishingWorkNotes() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; notes: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPublishingWorkNotes(data.id, data.notes);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publishingWorks'] });
      queryClient.invalidateQueries({ queryKey: ['publishingWork', variables.id] });
      toast.success('Notes updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update notes');
    }
  });
}

// Release Queries
export function useGetAllReleases(enabled: boolean = true) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Release[]>({
    queryKey: ['releases'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReleases();
    },
    enabled: !!actor && !actorFetching && enabled
  });
}

export function useGetRelease(id: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Release>({
    queryKey: ['release', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getRelease(id);
    },
    enabled: !!actor && !actorFetching && !!id
  });
}

export function useCreateRelease() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      releaseType: string;
      tracklist: string[];
      keyDates: string[];
      owners: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createRelease(data.title, data.releaseType, data.tracklist, data.keyDates, data.owners);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
      toast.success('Release created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create release');
    }
  });
}

// Recording Project Queries
export function useGetAllRecordingProjects(enabled: boolean = true) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<RecordingProject[]>({
    queryKey: ['recordingProjects'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRecordingProjects();
    },
    enabled: !!actor && !actorFetching && enabled
  });
}

export function useGetRecordingProject(id: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<RecordingProject>({
    queryKey: ['recordingProject', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getRecordingProject(id);
    },
    enabled: !!actor && !actorFetching && !!id
  });
}

export function useCreateRecordingProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      participants: string[];
      sessionDate: bigint;
      status: ProjectStatus;
      notes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createRecordingProject(
        data.title,
        data.participants,
        data.sessionDate,
        data.status,
        data.notes
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordingProjects'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
      toast.success('Recording project created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create project');
    }
  });
}

// Artist Development Queries
export function useGetAllArtistDevelopment(enabled: boolean = true) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ArtistDevelopment[]>({
    queryKey: ['artistDevelopment'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllArtistDevelopment();
    },
    enabled: !!actor && !actorFetching && enabled
  });
}

export function useGetArtistDevelopment(id: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ArtistDevelopment>({
    queryKey: ['artistDevelopment', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getArtistDevelopment(id);
    },
    enabled: !!actor && !actorFetching && !!id
  });
}

export function useCreateArtistDevelopment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      artistId: string;
      goals: string[];
      plans: string[];
      milestones: string[];
      internalNotes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createArtistDevelopment(
        data.artistId,
        data.goals,
        data.plans,
        data.milestones,
        data.internalNotes
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artistDevelopment'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
      toast.success('Artist development entry created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create entry');
    }
  });
}

// Cross-linking Queries - Get caller's entities for linking
export function useGetEntitiesForCaller(enabled: boolean = true) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<{
    memberships: [string, Membership][];
    publishingWorks: PublishingWork[];
    releases: Release[];
    recordingProjects: RecordingProject[];
    artistDevelopment: ArtistDevelopment[];
  }>({
    queryKey: ['entitiesForCaller'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getEntitiesForCaller();
    },
    enabled: !!actor && !actorFetching && enabled
  });
}

// Cross-linking Mutations
export function useLinkMembershipToEntities() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      memberId: string;
      artistIds: string[];
      workIds: string[];
      releaseIds: string[];
      projectIds: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.linkMembershipToEntities(
        data.memberId,
        data.artistIds,
        data.workIds,
        data.releaseIds,
        data.projectIds
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membershipDetails', variables.memberId] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
      toast.success('Membership links updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update links');
    }
  });
}

export function useUpdateMembershipLinks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      memberId: string;
      artistIds: string[];
      workIds: string[];
      releaseIds: string[];
      projectIds: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMembershipLinks(
        data.memberId,
        data.artistIds,
        data.workIds,
        data.releaseIds,
        data.projectIds
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['membershipDetails', variables.memberId] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
      toast.success('Membership links updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update links');
    }
  });
}

export function useLinkPublishingWorkToEntities() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      workId: string;
      memberIds: string[];
      artistIds: string[];
      releaseIds: string[];
      projectIds: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.linkPublishingWorkToEntities(
        data.workId,
        data.memberIds,
        data.artistIds,
        data.releaseIds,
        data.projectIds
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publishingWork', variables.workId] });
      queryClient.invalidateQueries({ queryKey: ['publishingWorks'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
      toast.success('Publishing work links updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update links');
    }
  });
}

export function useLinkReleaseToEntities() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      releaseId: string;
      memberIds: string[];
      artistIds: string[];
      workIds: string[];
      projectIds: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.linkReleaseToEntities(
        data.releaseId,
        data.memberIds,
        data.artistIds,
        data.workIds,
        data.projectIds
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['release', variables.releaseId] });
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
      toast.success('Release links updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update links');
    }
  });
}

export function useLinkProjectToEntities() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      projectId: string;
      memberIds: string[];
      artistIds: string[];
      workIds: string[];
      releaseIds: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.linkProjectToEntities(
        data.projectId,
        data.memberIds,
        data.artistIds,
        data.workIds,
        data.releaseIds
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recordingProject', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['recordingProjects'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
      toast.success('Recording project links updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update links');
    }
  });
}

export function useUpdateArtistDevelopmentLinks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      artistDevelopmentId: string;
      relatedMemberships: string[];
      relatedPublishing: string[];
      relatedLabelEntities: string[];
      relatedRecordingProjects: string[];
      relatedArtistDevelopment: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateArtistDevelopmentLinks(
        data.artistDevelopmentId,
        data.relatedMemberships,
        data.relatedPublishing,
        data.relatedLabelEntities,
        data.relatedRecordingProjects,
        data.relatedArtistDevelopment
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['artistDevelopment', variables.artistDevelopmentId] });
      queryClient.invalidateQueries({ queryKey: ['artistDevelopment'] });
      queryClient.invalidateQueries({ queryKey: ['entitiesForCaller'] });
      toast.success('Artist development links updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update links');
    }
  });
}
