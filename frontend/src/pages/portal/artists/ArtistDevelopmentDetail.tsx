import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Edit2, Save, X, Loader2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetArtistDevelopment,
  useUpdateArtistDevelopment,
  useUpdateArtistDevelopmentLinks,
  useIsCallerAdmin,
} from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { canEditArtistDevelopment } from '@/components/related/relatedRecordsPermissions';
import RelatedRecordsSection from '@/components/related/RelatedRecordsSection';
import EditLinksButton from '@/components/related/EditLinksButton';
import EditRelatedDialog from '@/components/related/EditRelatedDialog';
import { useLinkableEntityOptions } from '@/hooks/useLinkableEntityOptions';
import { normalizeToArray } from '@/utils/arrays';

export default function ArtistDevelopmentDetail() {
  const { id } = useParams({ from: '/portal/artists/$id' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();

  const { data: artist, isLoading, error } = useGetArtistDevelopment(id);
  const updateArtist = useUpdateArtistDevelopment();
  const updateLinks = useUpdateArtistDevelopmentLinks();

  const [isEditing, setIsEditing] = useState(false);
  const [editGoals, setEditGoals] = useState<string[]>([]);
  const [editPlans, setEditPlans] = useState<string[]>([]);
  const [editMilestones, setEditMilestones] = useState<string[]>([]);
  const [editInternalNotes, setEditInternalNotes] = useState('');
  const [editError, setEditError] = useState('');

  const [linksDialogOpen, setLinksDialogOpen] = useState(false);
  const {
    memberships,
    artists,
    works,
    releases,
    projects,
    isLoading: optionsLoading,
    error: optionsError,
  } = useLinkableEntityOptions();

  // canEditArtistDevelopment = canEditRecord(identity, isAdmin, owner)
  const canEdit = artist
    ? canEditArtistDevelopment(identity, isAdmin ?? false, artist.owner)
    : false;

  const handleStartEdit = () => {
    if (!artist) return;
    setEditGoals(normalizeToArray<string>(artist.goals).slice());
    setEditPlans(normalizeToArray<string>(artist.plans).slice());
    setEditMilestones(normalizeToArray<string>(artist.milestones).slice());
    setEditInternalNotes(artist.internalNotes ?? '');
    setEditError('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditError('');
  };

  const handleSaveEdit = async () => {
    setEditError('');
    try {
      await updateArtist.mutateAsync({
        entryId: id,
        goals: editGoals.filter(Boolean),
        plans: editPlans.filter(Boolean),
        milestones: editMilestones.filter(Boolean),
        internalNotes: editInternalNotes,
      });
      toast.success('Artist development entry updated successfully!');
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update artist development entry.';
      setEditError(msg);
    }
  };

  const handleSaveLinks = (selected: {
    memberIds: string[];
    artistIds: string[];
    workIds: string[];
    releaseIds: string[];
    projectIds: string[];
  }) => {
    updateLinks.mutate(
      {
        artistDevelopmentId: id,
        relatedMemberships: selected.memberIds,
        relatedPublishing: selected.workIds,
        relatedLabelEntities: selected.releaseIds,
        relatedRecordingProjects: selected.projectIds,
        relatedArtistDevelopment: selected.artistIds,
      },
      {
        onSuccess: () => {
          toast.success('Links updated successfully!');
          setLinksDialogOpen(false);
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Failed to update links.';
          toast.error(msg);
        },
      }
    );
  };

  // Array field helpers
  const makeArrayHelpers = (arr: string[], setArr: React.Dispatch<React.SetStateAction<string[]>>) => ({
    add: () => setArr([...arr, '']),
    remove: (i: number) => setArr(arr.filter((_, idx) => idx !== i)),
    update: (i: number, val: string) => {
      const updated = [...arr];
      updated[i] = val;
      setArr(updated);
    },
  });

  const goalsHelpers = makeArrayHelpers(editGoals, setEditGoals);
  const plansHelpers = makeArrayHelpers(editPlans, setEditPlans);
  const milestonesHelpers = makeArrayHelpers(editMilestones, setEditMilestones);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate({ to: '/portal/artists' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Artist development entry not found.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const safeGoals = normalizeToArray<string>(artist.goals);
  const safePlans = normalizeToArray<string>(artist.plans);
  const safeMilestones = normalizeToArray<string>(artist.milestones);
  const safeRelatedMemberships = normalizeToArray<string>(artist.relatedMemberships);
  const safeRelatedArtistDevelopment = normalizeToArray<string>(artist.relatedArtistDevelopment);
  const safeRelatedPublishing = normalizeToArray<string>(artist.relatedPublishing);
  const safeRelatedLabelEntities = normalizeToArray<string>(artist.relatedLabelEntities);
  const safeRelatedRecordingProjects = normalizeToArray<string>(artist.relatedRecordingProjects);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/portal/artists' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Artist Development
        </Button>
        <div className="flex gap-2">
          {canEdit && !isEditing && (
            <Button variant="outline" onClick={handleStartEdit} className="gap-2">
              <Edit2 className="h-4 w-4" /> Edit Entry
            </Button>
          )}
          <EditLinksButton onClick={() => setLinksDialogOpen(true)} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{artist.artistId}</CardTitle>
          <p className="text-muted-foreground text-sm">Entry ID: {artist.id}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4 border border-border rounded-lg p-4 bg-muted/20">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Edit Entry</h3>
              {editError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{editError}</AlertDescription>
                </Alert>
              )}

              {/* Goals */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Goals</Label>
                  <Button type="button" variant="outline" size="sm" onClick={goalsHelpers.add} className="gap-1">
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
                {editGoals.map((goal, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={goal}
                      onChange={(e) => goalsHelpers.update(i, e.target.value)}
                      placeholder="Goal description"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => goalsHelpers.remove(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Plans */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Plans</Label>
                  <Button type="button" variant="outline" size="sm" onClick={plansHelpers.add} className="gap-1">
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
                {editPlans.map((plan, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={plan}
                      onChange={(e) => plansHelpers.update(i, e.target.value)}
                      placeholder="Plan description"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => plansHelpers.remove(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Milestones */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Milestones</Label>
                  <Button type="button" variant="outline" size="sm" onClick={milestonesHelpers.add} className="gap-1">
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
                {editMilestones.map((milestone, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={milestone}
                      onChange={(e) => milestonesHelpers.update(i, e.target.value)}
                      placeholder="Milestone description"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => milestonesHelpers.remove(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label>Internal Notes</Label>
                <Textarea
                  value={editInternalNotes}
                  onChange={(e) => setEditInternalNotes(e.target.value)}
                  rows={3}
                  placeholder="Internal notes..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveEdit} disabled={updateArtist.isPending} className="gap-2">
                  {updateArtist.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancelEdit} disabled={updateArtist.isPending} className="gap-2">
                  <X className="h-4 w-4" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {safeGoals.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Goals</p>
                  <ul className="space-y-0.5">
                    {safeGoals.map((goal, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block mt-1.5 shrink-0" />
                        {String(goal)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {safePlans.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Plans</p>
                  <ul className="space-y-0.5">
                    {safePlans.map((plan, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block mt-1.5 shrink-0" />
                        {String(plan)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {safeMilestones.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Milestones</p>
                  <div className="flex flex-wrap gap-1">
                    {safeMilestones.map((m, i) => (
                      <Badge key={i} variant="outline">{String(m)}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {artist.internalNotes && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Internal Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{artist.internalNotes}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Created</p>
                <p className="text-sm mt-0.5">
                  {new Date(Number(artist.created_at) / 1_000_000).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <RelatedRecordsSection
        linkedMembers={safeRelatedMemberships}
        linkedArtists={safeRelatedArtistDevelopment}
        linkedWorks={safeRelatedPublishing}
        linkedReleases={safeRelatedLabelEntities}
        linkedProjects={safeRelatedRecordingProjects}
      />

      <EditRelatedDialog
        open={linksDialogOpen}
        onOpenChange={setLinksDialogOpen}
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
        onSave={handleSaveLinks}
        isSaving={updateLinks.isPending}
        isLoadingOptions={optionsLoading}
        optionsError={optionsError as Error | null}
      />
    </div>
  );
}
