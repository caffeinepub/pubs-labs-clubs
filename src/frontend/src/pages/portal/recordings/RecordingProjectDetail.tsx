import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { 
  useGetRecordingProject,
  useLinkProjectToEntities
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
import { canEditRecordingProject } from '../../../components/related/relatedRecordsPermissions';
import { normalizeToArray } from '../../../utils/arrays';

export default function RecordingProjectDetail() {
  const { id } = useParams({ from: '/portal/recordings/$id' });
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();
  const { identity } = useInternetIdentity();
  const { data: project, isLoading, error } = useGetRecordingProject(id);
  const linkMutation = useLinkProjectToEntities();

  const [isEditingRelated, setIsEditingRelated] = useState(false);

  // Fetch linkable entity options using the role-aware hook
  const { 
    memberships,
    artists, 
    works, 
    releases, 
    isLoading: optionsLoading, 
    error: optionsError 
  } = useLinkableEntityOptions();

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorBanner message={(error as Error).message} />;
  }

  if (!project) {
    return <ErrorBanner message="Recording project not found" />;
  }

  const canEdit = canEditRecordingProject(identity, isAdmin, project.owner);

  // Normalize linked arrays to handle upgrade-time undefined/null values
  const safeLinkedMembers = normalizeToArray<string>(project.linkedMembers);
  const safeLinkedArtists = normalizeToArray<string>(project.linkedArtists);
  const safeLinkedWorks = normalizeToArray<string>(project.linkedWorks);
  const safeLinkedReleases = normalizeToArray<string>(project.linkedReleases);

  const handleSaveRelated = (data: {
    memberIds: string[];
    artistIds: string[];
    workIds: string[];
    releaseIds: string[];
    projectIds: string[];
  }) => {
    linkMutation.mutate(
      {
        projectId: id,
        memberIds: data.memberIds,
        artistIds: data.artistIds,
        workIds: data.workIds,
        releaseIds: data.releaseIds
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
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/portal/recordings' })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground">Project ID: {project.id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Status</Label>
            <p className="text-lg capitalize">{project.status.replace('_', ' ')}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Participants</Label>
            <p className="text-lg">{project.participants.join(', ') || 'None'}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Session Date</Label>
            <p className="text-lg">
              {new Date(Number(project.sessionDate) / 1000000).toLocaleDateString()}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">Notes</Label>
            <p className="text-lg whitespace-pre-wrap">{project.notes || 'No notes'}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Created</Label>
            <p className="text-lg">
              {new Date(Number(project.created_at) / 1000000).toLocaleDateString()}
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
          linkedReleases={safeLinkedReleases}
        />
      </div>

      <EditRelatedDialog
        open={isEditingRelated}
        onOpenChange={setIsEditingRelated}
        title="Edit Links"
        availableMemberships={memberships}
        availableArtists={artists}
        availableWorks={works}
        availableReleases={releases}
        selectedMemberIds={safeLinkedMembers}
        selectedArtistIds={safeLinkedArtists}
        selectedWorkIds={safeLinkedWorks}
        selectedReleaseIds={safeLinkedReleases}
        onSave={handleSaveRelated}
        isSaving={linkMutation.isPending}
        isLoadingOptions={optionsLoading}
        optionsError={optionsError}
      />
    </div>
  );
}
