import { useMemo } from 'react';
import { useCurrentUser } from './useCurrentUser';
import { 
  useGetAllMembershipProfiles,
  useGetAllArtistDevelopment,
  useGetAllPublishingWorks,
  useGetAllReleases,
  useGetAllRecordingProjects,
  useGetEntitiesForCaller
} from './useQueries';
import { normalizeToArray } from '../utils/arrays';
import type { MembershipProfile, ArtistDevelopment, PublishingWork, Release, RecordingProject, Membership } from '../backend';

interface EntityOption {
  id: string;
  label: string;
}

interface LinkableEntityOptions {
  memberships: EntityOption[];
  artists: EntityOption[];
  works: EntityOption[];
  releases: EntityOption[];
  projects: EntityOption[];
  isLoading: boolean;
  error: Error | null;
}

export function useLinkableEntityOptions(): LinkableEntityOptions {
  const { isAdmin } = useCurrentUser();

  // Admin queries - only enabled for admins
  const adminMemberships = useGetAllMembershipProfiles(isAdmin);
  const adminArtists = useGetAllArtistDevelopment(isAdmin);
  const adminWorks = useGetAllPublishingWorks(isAdmin);
  const adminReleases = useGetAllReleases(isAdmin);
  const adminProjects = useGetAllRecordingProjects(isAdmin);

  // Non-admin query - only enabled for non-admins
  const callerEntities = useGetEntitiesForCaller(!isAdmin);

  const isLoading = isAdmin
    ? adminMemberships.isLoading || adminArtists.isLoading || adminWorks.isLoading || adminReleases.isLoading || adminProjects.isLoading
    : callerEntities.isLoading;

  const error = isAdmin
    ? (adminMemberships.error || adminArtists.error || adminWorks.error || adminReleases.error || adminProjects.error) as Error | null
    : callerEntities.error as Error | null;

  const options = useMemo(() => {
    if (isAdmin) {
      // Defensively normalize admin data to handle upgrade-time missing/partial shapes
      const safeMemberships = normalizeToArray<MembershipProfile>(adminMemberships.data);
      const safeArtists = normalizeToArray<ArtistDevelopment>(adminArtists.data);
      const safeWorks = normalizeToArray<PublishingWork>(adminWorks.data);
      const safeReleases = normalizeToArray<Release>(adminReleases.data);
      const safeProjects = normalizeToArray<RecordingProject>(adminProjects.data);

      return {
        memberships: safeMemberships.map(m => ({
          id: m?.id || '',
          label: `${m?.name || 'Unknown'} (${m?.id || ''})`
        })),
        artists: safeArtists.map(a => ({
          id: a?.id || '',
          label: `${a?.artistId || 'Unknown'} (${a?.id || ''})`
        })),
        works: safeWorks.map(w => ({
          id: w?.id || '',
          label: `${w?.title || 'Unknown'} (${w?.id || ''})`
        })),
        releases: safeReleases.map(r => ({
          id: r?.id || '',
          label: `${r?.title || 'Unknown'} (${r?.id || ''})`
        })),
        projects: safeProjects.map(p => ({
          id: p?.id || '',
          label: `${p?.title || 'Unknown'} (${p?.id || ''})`
        }))
      };
    } else {
      const entities = callerEntities.data;
      if (!entities) {
        return {
          memberships: [],
          artists: [],
          works: [],
          releases: [],
          projects: []
        };
      }

      // Defensively normalize each collection to handle upgrade-time missing/partial shapes
      // Treat undefined/null collections as empty arrays to prevent runtime errors
      const safeMemberships = normalizeToArray<[string, Membership]>(entities.memberships);
      const safeArtistDevelopment = normalizeToArray<ArtistDevelopment>(entities.artistDevelopment);
      const safePublishingWorks = normalizeToArray<PublishingWork>(entities.publishingWorks);
      const safeReleases = normalizeToArray<Release>(entities.releases);
      const safeRecordingProjects = normalizeToArray<RecordingProject>(entities.recordingProjects);

      return {
        memberships: safeMemberships.map(([id, m]) => ({
          id: id || '',
          label: `${m?.profile?.name || id || 'Unknown'} (${id || ''})`
        })),
        artists: safeArtistDevelopment.map(a => ({
          id: a?.id || '',
          label: `${a?.artistId || a?.id || 'Unknown'} (${a?.id || ''})`
        })),
        works: safePublishingWorks.map(w => ({
          id: w?.id || '',
          label: `${w?.title || w?.id || 'Unknown'} (${w?.id || ''})`
        })),
        releases: safeReleases.map(r => ({
          id: r?.id || '',
          label: `${r?.title || r?.id || 'Unknown'} (${r?.id || ''})`
        })),
        projects: safeRecordingProjects.map(p => ({
          id: p?.id || '',
          label: `${p?.title || p?.id || 'Unknown'} (${p?.id || ''})`
        }))
      };
    }
  }, [isAdmin, adminMemberships.data, adminArtists.data, adminWorks.data, adminReleases.data, adminProjects.data, callerEntities.data]);

  return {
    ...options,
    isLoading,
    error
  };
}
