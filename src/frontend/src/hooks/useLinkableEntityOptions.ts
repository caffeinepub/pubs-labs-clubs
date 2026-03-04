import { useMemo } from "react";
import type { Membership } from "../backend";
import { normalizeToArray } from "../utils/arrays";
import { useCurrentUser } from "./useCurrentUser";
import { useGetCallerMemberships, useGetEntitiesForCaller } from "./useQueries";
import type {
  ArtistDevelopment,
  CallerEntities,
  PublishingWork,
  RecordingProject,
  Release,
} from "./useQueries";

export interface EntityOption {
  id: string;
  label: string;
}

export interface LinkableEntityOptions {
  memberships: EntityOption[];
  artists: EntityOption[];
  works: EntityOption[];
  releases: EntityOption[];
  projects: EntityOption[];
  // Aliased names for convenience
  memberOptions: EntityOption[];
  publishingOptions: EntityOption[];
  releaseOptions: EntityOption[];
  projectOptions: EntityOption[];
  artistOptions: EntityOption[];
  allOptions: Array<
    EntityOption & {
      entityType:
        | "membership"
        | "publishing"
        | "release"
        | "recordingProject"
        | "artistDevelopment";
    }
  >;
  isLoading: boolean;
  error: Error | null;
}

export function useLinkableEntityOptions(): LinkableEntityOptions {
  const { isAdmin } = useCurrentUser();

  const callerEntitiesResult = useGetEntitiesForCaller();
  const callerMemberships = useGetCallerMemberships();

  const entities: CallerEntities = callerEntitiesResult.data ?? {
    memberships: [],
    publishingWorks: [],
    releases: [],
    recordingProjects: [],
    artistDevelopments: [],
  };

  const isLoading =
    callerEntitiesResult.isLoading || callerMemberships.isLoading;
  const error = callerEntitiesResult.isError
    ? (callerEntitiesResult.error as Error | null)
    : null;

  const options = useMemo(() => {
    const safeMemberships = normalizeToArray<Membership>(
      isAdmin ? entities.memberships : (callerMemberships.data ?? []),
    );
    const safePublishingWorks = normalizeToArray<PublishingWork>(
      entities.publishingWorks,
    );
    const safeReleases = normalizeToArray<Release>(entities.releases);
    const safeRecordingProjects = normalizeToArray<RecordingProject>(
      entities.recordingProjects,
    );
    const safeArtistDevelopment = normalizeToArray<ArtistDevelopment>(
      entities.artistDevelopments,
    );

    const memberships: EntityOption[] = safeMemberships.map((m) => ({
      id: m.profile.id,
      label: m.profile.name || m.profile.id,
    }));

    const works: EntityOption[] = safePublishingWorks.map((w) => ({
      id: w.id,
      label: w.title || w.id,
    }));

    const releases: EntityOption[] = safeReleases.map((r) => ({
      id: r.id,
      label: r.title || r.id,
    }));

    const projects: EntityOption[] = safeRecordingProjects.map((p) => ({
      id: p.id,
      label: p.title || p.id,
    }));

    const artists: EntityOption[] = safeArtistDevelopment.map((a) => ({
      id: a.id,
      label: a.artistId || a.id,
    }));

    return { memberships, works, releases, projects, artists };
  }, [
    isAdmin,
    entities.memberships,
    entities.publishingWorks,
    entities.releases,
    entities.recordingProjects,
    entities.artistDevelopments,
    callerMemberships.data,
  ]);

  const allOptions = [
    ...options.memberships.map((o) => ({
      ...o,
      entityType: "membership" as const,
    })),
    ...options.works.map((o) => ({ ...o, entityType: "publishing" as const })),
    ...options.releases.map((o) => ({ ...o, entityType: "release" as const })),
    ...options.projects.map((o) => ({
      ...o,
      entityType: "recordingProject" as const,
    })),
    ...options.artists.map((o) => ({
      ...o,
      entityType: "artistDevelopment" as const,
    })),
  ];

  return {
    ...options,
    memberOptions: options.memberships,
    publishingOptions: options.works,
    releaseOptions: options.releases,
    projectOptions: options.projects,
    artistOptions: options.artists,
    allOptions,
    isLoading,
    error,
  };
}
