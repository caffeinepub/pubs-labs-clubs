import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { 
  useGetPublishingWork,
  useAddPublishingWorkNotes,
  useLinkPublishingWorkToEntities
} from '../../../hooks/useQueries';
import { useLinkableEntityOptions } from '../../../hooks/useLinkableEntityOptions';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { useInternetIdentity } from '../../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import LoadingState from '../../../components/feedback/LoadingState';
import ErrorBanner from '../../../components/feedback/ErrorBanner';
import RelatedRecordsSection from '../../../components/related/RelatedRecordsSection';
import EditRelatedDialog from '../../../components/related/EditRelatedDialog';
import EditLinksButton from '../../../components/related/EditLinksButton';
import { canEditPublishingWork } from '../../../components/related/relatedRecordsPermissions';
import { normalizeToArray } from '../../../utils/arrays';

export default function PublishingWorkDetail() {
  const { id } = useParams({ from: '/portal/publishing/$id' });
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();
  const { identity } = useInternetIdentity();
  const { data: work, isLoading, error } = useGetPublishingWork(id);
  const notesMutation = useAddPublishingWorkNotes();
  const linkMutation = useLinkPublishingWorkToEntities();

  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingRelated, setIsEditingRelated] = useState(false);

  // Fetch linkable entity options using the role-aware hook
  const { 
    memberships,
    artists, 
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

  if (!work) {
    return <ErrorBanner message="Publishing work not found" />;
  }

  const canEdit = canEditPublishingWork(identity, isAdmin, work.owner);

  // Normalize all array-valued fields to handle upgrade-time undefined/null values
  const safeContributors = normalizeToArray<string>(work.contributors);
  const safeOwnershipSplits = normalizeToArray<[string, bigint]>(work.ownershipSplits);
  const safeLinkedMembers = normalizeToArray<string>(work.linkedMembers);
  const safeLinkedArtists = normalizeToArray<string>(work.linkedArtists);
  const safeLinkedReleases = normalizeToArray<string>(work.linkedReleases);
  const safeLinkedProjects = normalizeToArray<string>(work.linkedProjects);

  const handleSaveNotes = () => {
    notesMutation.mutate(
      { id, notes },
      {
        onSuccess: () => {
          setIsEditingNotes(false);
        }
      }
    );
  };

  const handleSaveRelated = (data: {
    memberIds: string[];
    artistIds: string[];
    workIds: string[];
    releaseIds: string[];
    projectIds: string[];
  }) => {
    linkMutation.mutate(
      {
        workId: id,
        memberIds: data.memberIds,
        artistIds: data.artistIds,
        releaseIds: data.releaseIds,
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
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/portal/publishing' })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{work.title}</h1>
          <p className="text-muted-foreground">Work ID: {work.id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Work Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Contributors</Label>
            <p className="text-lg">{safeContributors.join(', ') || 'None'}</p>
          </div>
          {safeOwnershipSplits.length > 0 && (
            <div>
              <Label className="text-muted-foreground">Ownership Splits</Label>
              <ul className="list-disc list-inside text-lg">
                {safeOwnershipSplits.map(([name, share], idx) => (
                  <li key={idx}>{name}: {share.toString()}%</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <Label className="text-muted-foreground">Registration Status</Label>
            <p className="text-lg">{work.registrationStatus}</p>
          </div>
          {work.iswc && (
            <div>
              <Label className="text-muted-foreground">ISWC</Label>
              <p className="text-lg">{work.iswc}</p>
            </div>
          )}
          {work.isrc && (
            <div>
              <Label className="text-muted-foreground">ISRC</Label>
              <p className="text-lg">{work.isrc}</p>
            </div>
          )}
          <div>
            <Label className="text-muted-foreground">Created</Label>
            <p className="text-lg">
              {new Date(Number(work.created_at) / 1000000).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Notes</span>
            {canEdit && !isEditingNotes && (
              <Button onClick={() => {
                setNotes(work.notes);
                setIsEditingNotes(true);
              }}>
                Edit Notes
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditingNotes ? (
            <div className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                placeholder="Add notes about this work..."
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveNotes} disabled={notesMutation.isPending}>
                  {notesMutation.isPending ? 'Saving...' : 'Save Notes'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditingNotes(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-lg whitespace-pre-wrap">{work.notes || 'No notes yet'}</p>
          )}
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
          linkedReleases={safeLinkedReleases}
          linkedProjects={safeLinkedProjects}
        />
      </div>

      <EditRelatedDialog
        open={isEditingRelated}
        onOpenChange={setIsEditingRelated}
        title="Edit Links"
        availableMemberships={memberships}
        availableArtists={artists}
        availableReleases={releases}
        availableProjects={projects}
        selectedMemberIds={safeLinkedMembers}
        selectedArtistIds={safeLinkedArtists}
        selectedReleaseIds={safeLinkedReleases}
        selectedProjectIds={safeLinkedProjects}
        onSave={handleSaveRelated}
        isSaving={linkMutation.isPending}
        isLoadingOptions={optionsLoading}
        optionsError={optionsError}
      />
    </div>
  );
}
