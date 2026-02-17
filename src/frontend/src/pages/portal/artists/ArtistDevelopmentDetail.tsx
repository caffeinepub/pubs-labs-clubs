import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { 
  useGetArtistDevelopment,
  useUpdateArtistDevelopmentLinks
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
import { canEditArtistDevelopment } from '../../../components/related/relatedRecordsPermissions';
import { normalizeToArray } from '../../../utils/arrays';

export default function ArtistDevelopmentDetail() {
  const { id } = useParams({ from: '/portal/artists/$id' });
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();
  const { identity } = useInternetIdentity();
  const { data: artist, isLoading, error } = useGetArtistDevelopment(id);
  const linkMutation = useUpdateArtistDevelopmentLinks();

  const [isEditingRelated, setIsEditingRelated] = useState(false);

  // Fetch linkable entity options using the role-aware hook
  const { 
    memberships,
    artists, 
    works, 
    releases, 
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

  if (!artist) {
    return <ErrorBanner message="Artist development entry not found" />;
  }

  const canEdit = canEditArtistDevelopment(identity, isAdmin, artist.owner);

  // Normalize all array-valued fields to handle upgrade-time undefined/null values
  const safeGoals = normalizeToArray<string>(artist.goals);
  const safePlans = normalizeToArray<string>(artist.plans);
  const safeMilestones = normalizeToArray<string>(artist.milestones);
  const safeRelatedMemberships = normalizeToArray<string>(artist.relatedMemberships);
  const safeRelatedArtistDevelopment = normalizeToArray<string>(artist.relatedArtistDevelopment);
  const safeRelatedPublishing = normalizeToArray<string>(artist.relatedPublishing);
  const safeRelatedLabelEntities = normalizeToArray<string>(artist.relatedLabelEntities);
  const safeRelatedRecordingProjects = normalizeToArray<string>(artist.relatedRecordingProjects);

  const handleSaveRelated = (data: {
    memberIds: string[];
    artistIds: string[];
    workIds: string[];
    releaseIds: string[];
    projectIds: string[];
  }) => {
    linkMutation.mutate(
      {
        artistDevelopmentId: id,
        relatedMemberships: data.memberIds,
        relatedPublishing: data.workIds,
        relatedLabelEntities: data.releaseIds,
        relatedRecordingProjects: data.projectIds,
        relatedArtistDevelopment: data.artistIds
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
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/portal/artists' })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{artist.artistId}</h1>
          <p className="text-muted-foreground">Entry ID: {artist.id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Development Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Goals</Label>
            {safeGoals.length > 0 ? (
              <ul className="list-disc list-inside text-lg">
                {safeGoals.map((goal, idx) => <li key={idx}>{goal}</li>)}
              </ul>
            ) : (
              <p className="text-muted-foreground">No goals set</p>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground">Plans</Label>
            {safePlans.length > 0 ? (
              <ul className="list-disc list-inside text-lg">
                {safePlans.map((plan, idx) => <li key={idx}>{plan}</li>)}
              </ul>
            ) : (
              <p className="text-muted-foreground">No plans set</p>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground">Milestones</Label>
            {safeMilestones.length > 0 ? (
              <ul className="list-disc list-inside text-lg">
                {safeMilestones.map((milestone, idx) => <li key={idx}>{milestone}</li>)}
              </ul>
            ) : (
              <p className="text-muted-foreground">No milestones set</p>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground">Internal Notes</Label>
            <p className="text-lg whitespace-pre-wrap">{artist.internalNotes || 'No notes'}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Created</Label>
            <p className="text-lg">
              {new Date(Number(artist.created_at) / 1000000).toLocaleDateString()}
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
          linkedMembers={safeRelatedMemberships}
          linkedArtists={safeRelatedArtistDevelopment}
          linkedWorks={safeRelatedPublishing}
          linkedReleases={safeRelatedLabelEntities}
          linkedProjects={safeRelatedRecordingProjects}
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
        availableProjects={projects}
        selectedMemberIds={safeRelatedMemberships}
        selectedArtistIds={safeRelatedArtistDevelopment}
        selectedWorkIds={safeRelatedPublishing}
        selectedReleaseIds={safeRelatedLabelEntities}
        selectedProjectIds={safeRelatedRecordingProjects}
        onSave={handleSaveRelated}
        isSaving={linkMutation.isPending}
        isLoadingOptions={optionsLoading}
        optionsError={optionsError}
      />
    </div>
  );
}
