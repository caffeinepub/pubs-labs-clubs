import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { 
  useGetRelease,
  useLinkReleaseToEntities
} from '../../../hooks/useQueries';
import { useLinkableEntityOptions } from '../../../hooks/useLinkableEntityOptions';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { useInternetIdentity } from '../../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import LoadingState from '../../../components/feedback/LoadingState';
import ErrorBanner from '../../../components/feedback/ErrorBanner';
import RelatedRecordsSection from '../../../components/related/RelatedRecordsSection';
import EditRelatedDialog from '../../../components/related/EditRelatedDialog';
import EditLinksButton from '../../../components/related/EditLinksButton';
import { canEditRelease } from '../../../components/related/relatedRecordsPermissions';
import { normalizeToArray } from '../../../utils/arrays';

export default function ReleaseDetail() {
  const { id } = useParams({ from: '/portal/releases/$id' });
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();
  const { identity } = useInternetIdentity();
  const { data: release, isLoading, error } = useGetRelease(id);
  const linkMutation = useLinkReleaseToEntities();

  const [isEditingRelated, setIsEditingRelated] = useState(false);

  // Fetch linkable entity options using the role-aware hook
  const { 
    memberships,
    artists, 
    works, 
    projects, 
    isLoading: optionsLoading, 
    error: optionsError 
  } = useLinkableEntityOptions();

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorBanner message={(error as Error).message} />;
  }

  if (!release) {
    return <ErrorBanner message="Release not found" />;
  }

  const canEdit = canEditRelease(identity, isAdmin, release.owner);

  // Normalize all array-valued fields to handle upgrade-time undefined/null values
  const safeTracklist = normalizeToArray<string>(release.tracklist);
  const safeKeyDates = normalizeToArray<string>(release.keyDates);
  const safeOwners = normalizeToArray<string>(release.owners);
  const safeWorkflowChecklist = normalizeToArray<string>(release.workflowChecklist);
  const safeLinkedMembers = normalizeToArray<string>(release.linkedMembers);
  const safeLinkedArtists = normalizeToArray<string>(release.linkedArtists);
  const safeLinkedWorks = normalizeToArray<string>(release.linkedWorks);
  const safeLinkedProjects = normalizeToArray<string>(release.linkedProjects);

  const handleSaveRelated = (data: {
    memberIds: string[];
    artistIds: string[];
    workIds: string[];
    releaseIds: string[];
    projectIds: string[];
  }) => {
    linkMutation.mutate(
      {
        releaseId: id,
        memberIds: data.memberIds,
        artistIds: data.artistIds,
        workIds: data.workIds,
        projectIds: data.projectIds
      },
      {
        onSuccess: () => {
          setIsEditingRelated(false);
        }
      }
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/portal/releases' })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{release.title}</h1>
          <p className="text-muted-foreground">Release ID: {release.id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Release Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Type</Label>
            <p className="text-lg">{release.releaseType}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Tracklist</Label>
            {safeTracklist.length > 0 ? (
              <ul className="list-disc list-inside text-lg">
                {safeTracklist.map((track, idx) => <li key={idx}>{track}</li>)}
              </ul>
            ) : (
              <p className="text-muted-foreground">No tracks</p>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground">Key Dates</Label>
            {safeKeyDates.length > 0 ? (
              <ul className="list-disc list-inside text-lg">
                {safeKeyDates.map((date, idx) => <li key={idx}>{date}</li>)}
              </ul>
            ) : (
              <p className="text-muted-foreground">No key dates</p>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground">Owners</Label>
            <p className="text-lg">{safeOwners.join(', ') || 'None'}</p>
          </div>
          {safeWorkflowChecklist.length > 0 && (
            <div>
              <Label className="text-muted-foreground">Workflow Checklist</Label>
              <ul className="list-disc list-inside text-lg">
                {safeWorkflowChecklist.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            </div>
          )}
          <div>
            <Label className="text-muted-foreground">Created</Label>
            <p className="text-lg">
              {new Date(Number(release.created_at) / 1000000).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {canEdit && (
          <div className="flex justify-end">
            <EditLinksButton onClick={() => setIsEditingRelated(true)} />
          </div>
        )}
        
        <RelatedRecordsSection
          linkedMembers={safeLinkedMembers}
          linkedArtists={safeLinkedArtists}
          linkedWorks={safeLinkedWorks}
          linkedProjects={safeLinkedProjects}
        />
      </div>

      <EditRelatedDialog
        open={isEditingRelated}
        onOpenChange={setIsEditingRelated}
        title="Edit Links"
        availableMemberships={memberships}
        availableArtists={artists}
        availableWorks={works}
        availableProjects={projects}
        selectedMemberIds={safeLinkedMembers}
        selectedArtistIds={safeLinkedArtists}
        selectedWorkIds={safeLinkedWorks}
        selectedProjectIds={safeLinkedProjects}
        onSave={handleSaveRelated}
        isSaving={linkMutation.isPending}
        isLoadingOptions={optionsLoading}
        optionsError={optionsError}
      />
    </div>
  );
}
