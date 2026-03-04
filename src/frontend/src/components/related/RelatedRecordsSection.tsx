import type { Membership } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { useGetEntitiesForCaller } from "@/hooks/useQueries";
import type {
  ArtistDevelopment,
  CallerEntities,
  PublishingWork,
  RecordingProject,
  Release,
} from "@/hooks/useQueries";
import { normalizeToArray } from "@/utils/arrays";
import { useNavigate } from "@tanstack/react-router";
import React from "react";

interface RelatedRecordsSectionProps {
  linkedMembers?: string[];
  linkedArtists?: string[];
  linkedWorks?: string[];
  linkedReleases?: string[];
  linkedProjects?: string[];
  // ArtistDevelopment uses different field names
  relatedMemberships?: string[];
  relatedPublishing?: string[];
  relatedLabelEntities?: string[];
  relatedRecordingProjects?: string[];
  relatedArtistDevelopment?: string[];
}

export function RelatedRecordsSection({
  linkedMembers,
  linkedArtists,
  linkedWorks,
  linkedReleases,
  linkedProjects,
  relatedMemberships,
  relatedPublishing,
  relatedLabelEntities,
  relatedRecordingProjects,
  relatedArtistDevelopment,
}: RelatedRecordsSectionProps) {
  const navigate = useNavigate();
  const callerEntitiesResult = useGetEntitiesForCaller();

  const callerEntities: CallerEntities = callerEntitiesResult.data ?? {
    memberships: [],
    publishingWorks: [],
    releases: [],
    recordingProjects: [],
    artistDevelopments: [],
  };

  const safeMemberships = normalizeToArray<Membership>(
    callerEntities.memberships,
  );
  const safePublishingWorks = normalizeToArray<PublishingWork>(
    callerEntities.publishingWorks,
  );
  const safeReleases = normalizeToArray<Release>(callerEntities.releases);
  const safeRecordingProjects = normalizeToArray<RecordingProject>(
    callerEntities.recordingProjects,
  );
  const safeArtistDevelopment = normalizeToArray<ArtistDevelopment>(
    callerEntities.artistDevelopments,
  );

  const memberIds = normalizeToArray<string>(
    linkedMembers ?? relatedMemberships,
  );
  const artistIds = normalizeToArray<string>(
    linkedArtists ?? relatedArtistDevelopment,
  );
  const workIds = normalizeToArray<string>(linkedWorks ?? relatedPublishing);
  const releaseIds = normalizeToArray<string>(
    linkedReleases ?? relatedLabelEntities,
  );
  const projectIds = normalizeToArray<string>(
    linkedProjects ?? relatedRecordingProjects,
  );

  function getMemberLabel(id: string): string {
    const found = safeMemberships.find((m) => m.profile.id === id);
    return found ? found.profile.name || id : id;
  }

  function getArtistLabel(id: string): string {
    const found = safeArtistDevelopment.find((a) => a.id === id);
    return found ? found.artistId || id : id;
  }

  function getWorkLabel(id: string): string {
    const found = safePublishingWorks.find((w) => w.id === id);
    return found ? found.title || id : id;
  }

  function getReleaseLabel(id: string): string {
    const found = safeReleases.find((r) => r.id === id);
    return found ? found.title || id : id;
  }

  function getProjectLabel(id: string): string {
    const found = safeRecordingProjects.find((p) => p.id === id);
    return found ? found.title || id : id;
  }

  const hasAny =
    memberIds.length > 0 ||
    artistIds.length > 0 ||
    workIds.length > 0 ||
    releaseIds.length > 0 ||
    projectIds.length > 0;

  if (!hasAny) {
    return (
      <p className="text-sm text-muted-foreground italic">No linked records.</p>
    );
  }

  return (
    <div className="space-y-3">
      {memberIds.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Members
          </p>
          <div className="flex flex-wrap gap-1">
            {memberIds.map((id) => (
              <Badge
                key={id}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => navigate({ to: `/portal/memberships/${id}` })}
              >
                {getMemberLabel(id)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {artistIds.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Artist Development
          </p>
          <div className="flex flex-wrap gap-1">
            {artistIds.map((id) => (
              <Badge
                key={id}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => navigate({ to: `/portal/artists/${id}` })}
              >
                {getArtistLabel(id)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {workIds.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Publishing Works
          </p>
          <div className="flex flex-wrap gap-1">
            {workIds.map((id) => (
              <Badge
                key={id}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => navigate({ to: `/portal/publishing/${id}` })}
              >
                {getWorkLabel(id)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {releaseIds.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Releases
          </p>
          <div className="flex flex-wrap gap-1">
            {releaseIds.map((id) => (
              <Badge
                key={id}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => navigate({ to: `/portal/releases/${id}` })}
              >
                {getReleaseLabel(id)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {projectIds.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Recording Projects
          </p>
          <div className="flex flex-wrap gap-1">
            {projectIds.map((id) => (
              <Badge
                key={id}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => navigate({ to: `/portal/recordings/${id}` })}
              >
                {getProjectLabel(id)}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RelatedRecordsSection;
