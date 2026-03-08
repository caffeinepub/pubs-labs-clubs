import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ApprovalStatus,
  ChangeEvent,
  DashboardStats,
  Membership,
  MembershipProfile,
  SignedInUser,
  UserApprovalInfo,
  UserProfile,
  UserRole,
} from "../backend";
import type { T as MemberStatusEnum } from "../backend";
import { useActor } from "./useActor";
import { useNotifications } from "./useNotifications";

// ─── Local entity interfaces ──────────────────────────────────────────────────

export interface PublishingWork {
  id: string;
  owner: string;
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
  owner: string;
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
  owner: string;
  title: string;
  participants: string[];
  sessionDate: bigint;
  status: string;
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
  owner: string;
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

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
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
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function useGetDashboardStats() {
  const { actor, isFetching } = useActor();

  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Change History ───────────────────────────────────────────────────────────

export function useGetChangeHistory(recordId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ChangeEvent[]>({
    queryKey: ["changeHistory", recordId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChangeHistory(recordId);
    },
    enabled: !!actor && !isFetching && !!recordId,
  });
}

// ─── Admin check ──────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Memberships ──────────────────────────────────────────────────────────────

export function useGetCallerMemberships() {
  const { actor, isFetching } = useActor();

  return useQuery<Membership[]>({
    queryKey: ["callerMemberships"],
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
    queryKey: ["allMembershipProfiles"],
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
    queryKey: ["membershipDetails", id],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getMembershipDetails(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateMembership() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      email,
    }: { id: string; name: string; email: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createMembershipProfile(id, name, email);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["callerMemberships"] });
      queryClient.invalidateQueries({ queryKey: ["allMembershipProfiles"] });
      const title = (data as { name?: string } | null)?.name ?? "New Member";
      addNotification({
        type: "created",
        section: "memberships",
        recordTitle: title,
      });
    },
  });
}

export function useUpdateMembership() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

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
      status: MemberStatusEnum;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateMembership(id, name, email, status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["callerMemberships"] });
      queryClient.invalidateQueries({ queryKey: ["allMembershipProfiles"] });
      queryClient.invalidateQueries({
        queryKey: ["membershipDetails", variables.id],
      });
      addNotification({
        type: "updated",
        section: "memberships",
        recordTitle: variables.name,
      });
    },
  });
}

export function useUpdateMembershipStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: { id: string; status: MemberStatusEnum }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateMembershipStatus(id, status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["callerMemberships"] });
      queryClient.invalidateQueries({ queryKey: ["allMembershipProfiles"] });
      queryClient.invalidateQueries({
        queryKey: ["membershipDetails", variables.id],
      });
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
      if (!actor) throw new Error("Actor not available");
      return actor.updateMembershipLinks(
        id,
        artistIds,
        workIds,
        releaseIds,
        projectIds,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["callerMemberships"] });
      queryClient.invalidateQueries({
        queryKey: ["membershipDetails", variables.id],
      });
    },
  });
}

export function useDeleteMembership() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!actor) throw new Error("Actor not available");
      return actor.bulkDeleteMembershipProfiles(ids);
    },
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: ["callerMemberships"] });
      queryClient.invalidateQueries({ queryKey: ["allMembershipProfiles"] });
      addNotification({
        type: "deleted",
        section: "memberships",
        recordTitle: `${ids.length} membership(s)`,
      });
    },
  });
}

// Alias for backward compatibility
export const useBulkDeleteMembershipProfiles = useDeleteMembership;

export function useDuplicateMembership() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.duplicateMembership(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerMemberships"] });
      queryClient.invalidateQueries({ queryKey: ["allMembershipProfiles"] });
    },
  });
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const PUBLISHING_KEY = "publishingWorks";
const RELEASES_KEY = "releases";
const RECORDING_PROJECTS_KEY = "recordingProjects";
const ARTIST_DEVELOPMENT_KEY = "artistDevelopment";

function loadFromStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Publishing Works Hooks ───────────────────────────────────────────────────

export function useGetPublishingWorks() {
  return useQuery<PublishingWork[]>({
    queryKey: ["publishingWorks"],
    queryFn: () => loadFromStorage<PublishingWork>(PUBLISHING_KEY),
    staleTime: 0,
  });
}

// Alias
export const useGetAllPublishingWorks = useGetPublishingWorks;

export function useCreatePublishingWork() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: async (data: Omit<PublishingWork, "id" | "created_at">) => {
      const items = loadFromStorage<PublishingWork>(PUBLISHING_KEY);
      const newItem: PublishingWork = {
        ...data,
        id: generateId(),
        created_at: BigInt(Date.now()) * BigInt(1_000_000),
      };
      saveToStorage(PUBLISHING_KEY, [...items, newItem]);
      return newItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["publishingWorks"] });
      addNotification({
        type: "created",
        section: "publishing",
        recordTitle: data.title,
      });
    },
  });
}

export function useUpdatePublishingWork() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: async ({
      workId,
      updates,
    }: { workId: string; updates: Partial<PublishingWork> }) => {
      const items = loadFromStorage<PublishingWork>(PUBLISHING_KEY);
      const updated = items.map((item) =>
        item.id === workId ? { ...item, ...updates } : item,
      );
      saveToStorage(PUBLISHING_KEY, updated);
      return updated.find((i) => i.id === workId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["publishingWorks"] });
      addNotification({
        type: "updated",
        section: "publishing",
        recordTitle: data?.title ?? "Publishing Work",
      });
    },
  });
}

// Alias for link-only updates
export const useUpdatePublishingWorkLinks = useUpdatePublishingWork;

export function useDeletePublishingWork() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const items = loadFromStorage<PublishingWork>(PUBLISHING_KEY);
      saveToStorage(
        PUBLISHING_KEY,
        items.filter((i) => !ids.includes(i.id)),
      );
      return ids;
    },
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: ["publishingWorks"] });
      addNotification({
        type: "deleted",
        section: "publishing",
        recordTitle: `${ids.length} work(s)`,
      });
    },
  });
}

// Alias
export const useBulkDeletePublishingWorks = useDeletePublishingWork;

export function useDuplicatePublishingWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const items = loadFromStorage<PublishingWork>(PUBLISHING_KEY);
      const original = items.find((i) => i.id === id);
      if (!original) throw new Error("Publishing work not found");
      const copy: PublishingWork = {
        ...original,
        id: generateId(),
        title: `Copy of ${original.title}`,
        created_at: BigInt(Date.now()) * BigInt(1_000_000),
      };
      saveToStorage(PUBLISHING_KEY, [...items, copy]);
      return copy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publishingWorks"] });
    },
  });
}

// ─── Releases Hooks ───────────────────────────────────────────────────────────

export function useGetReleases() {
  return useQuery<Release[]>({
    queryKey: ["releases"],
    queryFn: () => loadFromStorage<Release>(RELEASES_KEY),
    staleTime: 0,
  });
}

// Aliases
export const useGetAllReleases = useGetReleases;
export const useGetRelease = useGetReleases;

export function useCreateRelease() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: async (data: Omit<Release, "id" | "created_at">) => {
      const items = loadFromStorage<Release>(RELEASES_KEY);
      const newItem: Release = {
        ...data,
        id: generateId(),
        created_at: BigInt(Date.now()) * BigInt(1_000_000),
      };
      saveToStorage(RELEASES_KEY, [...items, newItem]);
      return newItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["releases"] });
      addNotification({
        type: "created",
        section: "releases",
        recordTitle: data.title,
      });
    },
  });
}

export function useUpdateRelease() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: async ({
      releaseId,
      updates,
    }: { releaseId: string; updates: Partial<Release> }) => {
      const items = loadFromStorage<Release>(RELEASES_KEY);
      const updated = items.map((item) =>
        item.id === releaseId ? { ...item, ...updates } : item,
      );
      saveToStorage(RELEASES_KEY, updated);
      return updated.find((i) => i.id === releaseId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["releases"] });
      addNotification({
        type: "updated",
        section: "releases",
        recordTitle: data?.title ?? "Release",
      });
    },
  });
}

// Alias for link-only updates
export const useUpdateReleaseLinks = useUpdateRelease;

export function useDeleteRelease() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const items = loadFromStorage<Release>(RELEASES_KEY);
      saveToStorage(
        RELEASES_KEY,
        items.filter((i) => !ids.includes(i.id)),
      );
      return ids;
    },
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: ["releases"] });
      addNotification({
        type: "deleted",
        section: "releases",
        recordTitle: `${ids.length} release(s)`,
      });
    },
  });
}

// Alias
export const useBulkDeleteReleases = useDeleteRelease;

export function useDuplicateRelease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const items = loadFromStorage<Release>(RELEASES_KEY);
      const original = items.find((i) => i.id === id);
      if (!original) throw new Error("Release not found");
      const copy: Release = {
        ...original,
        id: generateId(),
        title: `Copy of ${original.title}`,
        created_at: BigInt(Date.now()) * BigInt(1_000_000),
      };
      saveToStorage(RELEASES_KEY, [...items, copy]);
      return copy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["releases"] });
    },
  });
}

// ─── Recording Projects Hooks ─────────────────────────────────────────────────

export function useGetRecordingProjects() {
  return useQuery<RecordingProject[]>({
    queryKey: ["recordingProjects"],
    queryFn: () => loadFromStorage<RecordingProject>(RECORDING_PROJECTS_KEY),
    staleTime: 0,
  });
}

// Aliases
export const useGetAllRecordingProjects = useGetRecordingProjects;
export const useGetRecordingProject = useGetRecordingProjects;

export function useCreateRecordingProject() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: async (data: Omit<RecordingProject, "id" | "created_at">) => {
      const items = loadFromStorage<RecordingProject>(RECORDING_PROJECTS_KEY);
      const newItem: RecordingProject = {
        ...data,
        id: generateId(),
        created_at: BigInt(Date.now()) * BigInt(1_000_000),
      };
      saveToStorage(RECORDING_PROJECTS_KEY, [...items, newItem]);
      return newItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recordingProjects"] });
      addNotification({
        type: "created",
        section: "recordings",
        recordTitle: data.title,
      });
    },
  });
}

export function useUpdateRecordingProject() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: async ({
      projectId,
      updates,
    }: {
      projectId: string;
      updates: Partial<RecordingProject>;
    }) => {
      const items = loadFromStorage<RecordingProject>(RECORDING_PROJECTS_KEY);
      const updated = items.map((item) =>
        item.id === projectId ? { ...item, ...updates } : item,
      );
      saveToStorage(RECORDING_PROJECTS_KEY, updated);
      return updated.find((i) => i.id === projectId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recordingProjects"] });
      addNotification({
        type: "updated",
        section: "recordings",
        recordTitle: data?.title ?? "Recording Project",
      });
    },
  });
}

// Alias for link-only updates
export const useLinkProjectToEntities = useUpdateRecordingProject;

export function useDeleteRecordingProject() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const items = loadFromStorage<RecordingProject>(RECORDING_PROJECTS_KEY);
      saveToStorage(
        RECORDING_PROJECTS_KEY,
        items.filter((i) => !ids.includes(i.id)),
      );
      return ids;
    },
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: ["recordingProjects"] });
      addNotification({
        type: "deleted",
        section: "recordings",
        recordTitle: `${ids.length} project(s)`,
      });
    },
  });
}

// Alias
export const useBulkDeleteRecordingProjects = useDeleteRecordingProject;

export function useDuplicateRecordingProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const items = loadFromStorage<RecordingProject>(RECORDING_PROJECTS_KEY);
      const original = items.find((i) => i.id === id);
      if (!original) throw new Error("Recording project not found");
      const copy: RecordingProject = {
        ...original,
        id: generateId(),
        title: `Copy of ${original.title}`,
        created_at: BigInt(Date.now()) * BigInt(1_000_000),
      };
      saveToStorage(RECORDING_PROJECTS_KEY, [...items, copy]);
      return copy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recordingProjects"] });
    },
  });
}

// ─── Artist Development Hooks ─────────────────────────────────────────────────

export function useGetArtistDevelopments() {
  return useQuery<ArtistDevelopment[]>({
    queryKey: ["artistDevelopments"],
    queryFn: () => loadFromStorage<ArtistDevelopment>(ARTIST_DEVELOPMENT_KEY),
    staleTime: 0,
  });
}

// Aliases
export const useGetAllArtistDevelopment = useGetArtistDevelopments;
export const useGetArtistDevelopment = useGetArtistDevelopments;

export function useCreateArtistDevelopment() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: async (data: {
      artistId: string;
      genre?: string;
      goals?: string[];
      internalNotes?: string;
    }) => {
      const items = loadFromStorage<ArtistDevelopment>(ARTIST_DEVELOPMENT_KEY);
      const newItem: ArtistDevelopment = {
        id: generateId(),
        owner: "",
        artistId: data.artistId,
        goals: data.goals ?? [],
        plans: [],
        milestones: [],
        internalNotes: data.internalNotes ?? "",
        relatedMemberships: [],
        relatedPublishing: [],
        relatedLabelEntities: [],
        relatedRecordingProjects: [],
        relatedArtistDevelopment: [],
        created_at: BigInt(Date.now()) * BigInt(1_000_000),
      };
      saveToStorage(ARTIST_DEVELOPMENT_KEY, [...items, newItem]);
      return newItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["artistDevelopments"] });
      addNotification({
        type: "created",
        section: "artists",
        recordTitle: data.artistId,
      });
    },
  });
}

export function useUpdateArtistDevelopment() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: async ({
      entryId,
      updates,
    }: {
      entryId: string;
      updates: Partial<ArtistDevelopment>;
    }) => {
      const items = loadFromStorage<ArtistDevelopment>(ARTIST_DEVELOPMENT_KEY);
      const updated = items.map((item) =>
        item.id === entryId ? { ...item, ...updates } : item,
      );
      saveToStorage(ARTIST_DEVELOPMENT_KEY, updated);
      return updated.find((i) => i.id === entryId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["artistDevelopments"] });
      addNotification({
        type: "updated",
        section: "artists",
        recordTitle: data?.artistId ?? "Artist",
      });
    },
  });
}

// Alias for link-only updates
export const useUpdateArtistDevelopmentLinks = useUpdateArtistDevelopment;

export function useDeleteArtistDevelopment() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const items = loadFromStorage<ArtistDevelopment>(ARTIST_DEVELOPMENT_KEY);
      saveToStorage(
        ARTIST_DEVELOPMENT_KEY,
        items.filter((i) => !ids.includes(i.id)),
      );
      return ids;
    },
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: ["artistDevelopments"] });
      addNotification({
        type: "deleted",
        section: "artists",
        recordTitle: `${ids.length} artist(s)`,
      });
    },
  });
}

// Alias
export const useBulkDeleteArtistDevelopment = useDeleteArtistDevelopment;

export function useDuplicateArtistDevelopment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const items = loadFromStorage<ArtistDevelopment>(ARTIST_DEVELOPMENT_KEY);
      const original = items.find((i) => i.id === id);
      if (!original) throw new Error("Artist development record not found");
      const copy: ArtistDevelopment = {
        ...original,
        id: generateId(),
        artistId: `Copy of ${original.artistId}`,
        created_at: BigInt(Date.now()) * BigInt(1_000_000),
      };
      saveToStorage(ARTIST_DEVELOPMENT_KEY, [...items, copy]);
      return copy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artistDevelopments"] });
    },
  });
}

// ─── Authorization / Approval ─────────────────────────────────────────────────

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isCallerApproved"],
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
      if (!actor) throw new Error("Actor not available");
      return actor.requestApproval();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isCallerApproved"] });
    },
  });
}

export function useListApprovals() {
  const { actor, isFetching } = useActor();

  return useQuery<UserApprovalInfo[]>({
    queryKey: ["listApprovals"],
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
    mutationFn: async ({
      user,
      status,
    }: { user: string; status: ApprovalStatus }) => {
      if (!actor) throw new Error("Actor not available");
      const { Principal } = await import("@dfinity/principal");
      return actor.setApproval(Principal.fromText(user), status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listApprovals"] });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ["callerUserRole"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: string; role: UserRole }) => {
      if (!actor) throw new Error("Actor not available");
      const { Principal } = await import("@dfinity/principal");
      return actor.assignCallerUserRole(Principal.fromText(user), role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerUserRole"] });
      queryClient.invalidateQueries({ queryKey: ["listApprovals"] });
      queryClient.invalidateQueries({ queryKey: ["allKnownUsers"] });
    },
  });
}

export function useGetAllKnownUsers() {
  const { actor, isFetching } = useActor();

  return useQuery<SignedInUser[]>({
    queryKey: ["allKnownUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllKnownUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Entities for caller (used by RelatedRecordsSection & useLinkableEntityOptions) ──

export interface CallerEntities {
  memberships: Membership[];
  publishingWorks: PublishingWork[];
  releases: Release[];
  recordingProjects: RecordingProject[];
  artistDevelopments: ArtistDevelopment[];
}

export function useGetEntitiesForCaller() {
  const memberships = useGetCallerMemberships();
  const publishingWorks = useGetPublishingWorks();
  const releases = useGetReleases();
  const recordingProjects = useGetRecordingProjects();
  const artistDevelopments = useGetArtistDevelopments();

  const isLoading =
    memberships.isLoading ||
    publishingWorks.isLoading ||
    releases.isLoading ||
    recordingProjects.isLoading ||
    artistDevelopments.isLoading;

  const isError =
    memberships.isError ||
    publishingWorks.isError ||
    releases.isError ||
    recordingProjects.isError ||
    artistDevelopments.isError;

  return {
    data: {
      memberships: memberships.data ?? [],
      publishingWorks: publishingWorks.data ?? [],
      releases: releases.data ?? [],
      recordingProjects: recordingProjects.data ?? [],
      artistDevelopments: artistDevelopments.data ?? [],
    } as CallerEntities,
    isLoading,
    isError,
    error: isError
      ? (memberships.error ??
        publishingWorks.error ??
        releases.error ??
        recordingProjects.error ??
        artistDevelopments.error)
      : null,
  };
}
