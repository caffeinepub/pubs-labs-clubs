import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useGetEntitiesForCaller } from '../../hooks/useQueries';
import { normalizeToArray } from '../../utils/arrays';
import type { Membership, ArtistDevelopment, PublishingWork, Release, RecordingProject } from '../../backend';

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
  linkedProjects
}: RelatedRecordsSectionProps) {
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();
  
  // Non-admin users rely on getEntitiesForCaller for label resolution
  const { data: callerEntities } = useGetEntitiesForCaller(!isAdmin);

  // Normalize all arrays to handle upgrade-time undefined/null values
  const safeLinkedMembers = normalizeToArray<string>(linkedMembers);
  const safeLinkedArtists = normalizeToArray<string>(linkedArtists);
  const safeLinkedWorks = normalizeToArray<string>(linkedWorks);
  const safeLinkedReleases = normalizeToArray<string>(linkedReleases);
  const safeLinkedProjects = normalizeToArray<string>(linkedProjects);

  const getLabelForMember = (id: string): string => {
    if (!isAdmin && callerEntities) {
      // Normalize caller entity collections to handle upgrade-time missing/partial data
      const safeMemberships = normalizeToArray<[string, Membership]>(callerEntities.memberships);
      const found = safeMemberships.find(([mId]) => mId === id);
      if (found) return found[1]?.profile?.name || id;
    }
    return id;
  };

  const getLabelForArtist = (id: string): string => {
    if (!isAdmin && callerEntities) {
      const safeArtistDevelopment = normalizeToArray<ArtistDevelopment>(callerEntities.artistDevelopment);
      const found = safeArtistDevelopment.find(a => a?.id === id);
      if (found) return found.artistId || id;
    }
    return id;
  };

  const getLabelForWork = (id: string): string => {
    if (!isAdmin && callerEntities) {
      const safePublishingWorks = normalizeToArray<PublishingWork>(callerEntities.publishingWorks);
      const found = safePublishingWorks.find(w => w?.id === id);
      if (found) return found.title || id;
    }
    return id;
  };

  const getLabelForRelease = (id: string): string => {
    if (!isAdmin && callerEntities) {
      const safeReleases = normalizeToArray<Release>(callerEntities.releases);
      const found = safeReleases.find(r => r?.id === id);
      if (found) return found.title || id;
    }
    return id;
  };

  const getLabelForProject = (id: string): string => {
    if (!isAdmin && callerEntities) {
      const safeRecordingProjects = normalizeToArray<RecordingProject>(callerEntities.recordingProjects);
      const found = safeRecordingProjects.find(p => p?.id === id);
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
      <Card>
        <CardHeader>
          <CardTitle>Related Records</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No related records</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Records</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {safeLinkedMembers.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Memberships</h3>
            <div className="flex flex-wrap gap-2">
              {safeLinkedMembers.map(id => (
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
            <h3 className="text-sm font-medium mb-2">Artist Development</h3>
            <div className="flex flex-wrap gap-2">
              {safeLinkedArtists.map(id => (
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
            <h3 className="text-sm font-medium mb-2">Publishing Works</h3>
            <div className="flex flex-wrap gap-2">
              {safeLinkedWorks.map(id => (
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
            <h3 className="text-sm font-medium mb-2">Releases</h3>
            <div className="flex flex-wrap gap-2">
              {safeLinkedReleases.map(id => (
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
            <h3 className="text-sm font-medium mb-2">Recording Projects</h3>
            <div className="flex flex-wrap gap-2">
              {safeLinkedProjects.map(id => (
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
      </CardContent>
    </Card>
  );
}
