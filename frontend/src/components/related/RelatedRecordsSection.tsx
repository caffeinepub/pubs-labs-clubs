import { useNavigate } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useGetEntitiesForCaller } from '../../hooks/useQueries';
import { normalizeToArray } from '../../utils/arrays';
import type { Membership } from '../../backend';
import type {
  ArtistDevelopment,
  PublishingWork,
  Release,
  RecordingProject,
} from '../../types/entities';

interface RelatedRecordsSectionProps {
  linkedMembers?: string[];
  linkedArtists?: string[];
  linkedWorks?: string[];
  linkedReleases?: string[];
  linkedProjects?: string[];
}

export default function RelatedRecordsSection({
  linkedMembers,
  linkedArtists,
  linkedWorks,
  linkedReleases,
  linkedProjects,
}: RelatedRecordsSectionProps) {
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();

  // Always call the hook unconditionally (Rules of Hooks).
  const { data: callerEntities } = useGetEntitiesForCaller();

  const safeLinkedMembers = normalizeToArray<string>(linkedMembers);
  const safeLinkedArtists = normalizeToArray<string>(linkedArtists);
  const safeLinkedWorks = normalizeToArray<string>(linkedWorks);
  const safeLinkedReleases = normalizeToArray<string>(linkedReleases);
  const safeLinkedProjects = normalizeToArray<string>(linkedProjects);

  const getLabelForMember = (id: string): string => {
    if (!isAdmin && callerEntities) {
      const safeMemberships = normalizeToArray<[string, Membership]>(callerEntities.memberships);
      const found = safeMemberships.find(([mId]) => mId === id);
      if (found) return found[1]?.profile?.name || id;
    }
    return id;
  };

  const getLabelForArtist = (id: string): string => {
    if (!isAdmin && callerEntities) {
      const safeArtistDevelopment = normalizeToArray<ArtistDevelopment>(callerEntities.artistDevelopment);
      const found = safeArtistDevelopment.find((a) => a?.id === id);
      if (found) return found.artistId || id;
    }
    return id;
  };

  const getLabelForWork = (id: string): string => {
    if (!isAdmin && callerEntities) {
      const safePublishingWorks = normalizeToArray<PublishingWork>(callerEntities.publishingWorks);
      const found = safePublishingWorks.find((w) => w?.id === id);
      if (found) return found.title || id;
    }
    return id;
  };

  const getLabelForRelease = (id: string): string => {
    if (!isAdmin && callerEntities) {
      const safeReleases = normalizeToArray<Release>(callerEntities.releases);
      const found = safeReleases.find((r) => r?.id === id);
      if (found) return found.title || id;
    }
    return id;
  };

  const getLabelForProject = (id: string): string => {
    if (!isAdmin && callerEntities) {
      const safeRecordingProjects = normalizeToArray<RecordingProject>(callerEntities.recordingProjects);
      const found = safeRecordingProjects.find((p) => p?.id === id);
      if (found) return found.title || id;
    }
    return id;
  };

  const hasAnyLinks =
    safeLinkedMembers.length > 0 ||
    safeLinkedArtists.length > 0 ||
    safeLinkedWorks.length > 0 ||
    safeLinkedReleases.length > 0 ||
    safeLinkedProjects.length > 0;

  if (!hasAnyLinks) {
    return (
      <p className="text-sm text-muted-foreground">No related records linked yet.</p>
    );
  }

  return (
    <div className="space-y-4">
      {safeLinkedMembers.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground uppercase tracking-wide">
            Memberships
          </h3>
          <div className="flex flex-wrap gap-2">
            {safeLinkedMembers.map((id) => (
              <Badge
                key={id}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => navigate({ to: '/portal/memberships/$id', params: { id } })}
              >
                {getLabelForMember(id)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {safeLinkedArtists.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground uppercase tracking-wide">
            Artist Development
          </h3>
          <div className="flex flex-wrap gap-2">
            {safeLinkedArtists.map((id) => (
              <Badge
                key={id}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => navigate({ to: '/portal/artists/$id', params: { id } })}
              >
                {getLabelForArtist(id)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {safeLinkedWorks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground uppercase tracking-wide">
            Publishing Works
          </h3>
          <div className="flex flex-wrap gap-2">
            {safeLinkedWorks.map((id) => (
              <Badge
                key={id}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => navigate({ to: '/portal/publishing/$id', params: { id } })}
              >
                {getLabelForWork(id)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {safeLinkedReleases.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground uppercase tracking-wide">
            Releases
          </h3>
          <div className="flex flex-wrap gap-2">
            {safeLinkedReleases.map((id) => (
              <Badge
                key={id}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => navigate({ to: '/portal/releases/$id', params: { id } })}
              >
                {getLabelForRelease(id)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {safeLinkedProjects.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground uppercase tracking-wide">
            Recording Projects
          </h3>
          <div className="flex flex-wrap gap-2">
            {safeLinkedProjects.map((id) => (
              <Badge
                key={id}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => navigate({ to: '/portal/recordings/$id', params: { id } })}
              >
                {getLabelForProject(id)}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
