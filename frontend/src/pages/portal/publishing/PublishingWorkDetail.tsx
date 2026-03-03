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
  useGetPublishingWork,
  useUpdatePublishingWork,
  useLinkPublishingWorkToEntities,
  useIsCallerAdmin,
} from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { canEditPublishingWork } from '@/components/related/relatedRecordsPermissions';
import RelatedRecordsSection from '@/components/related/RelatedRecordsSection';
import EditLinksButton from '@/components/related/EditLinksButton';
import EditRelatedDialog from '@/components/related/EditRelatedDialog';
import { useLinkableEntityOptions } from '@/hooks/useLinkableEntityOptions';
import { normalizeToArray } from '@/utils/arrays';
import ChangeHistoryPanel from '@/components/history/ChangeHistoryPanel';

export default function PublishingWorkDetail() {
  const { id } = useParams({ from: '/portal/publishing/$id' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();

  const { data: work, isLoading, error } = useGetPublishingWork(id);
  const updateWork = useUpdatePublishingWork();
  const linkWork = useLinkPublishingWorkToEntities();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editRegStatus, setEditRegStatus] = useState('');
  const [editContributors, setEditContributors] = useState<string[]>([]);
  const [editOwnershipSplits, setEditOwnershipSplits] = useState<[string, bigint][]>([]);
  const [editNotes, setEditNotes] = useState('');
  const [editError, setEditError] = useState('');

  const [linksDialogOpen, setLinksDialogOpen] = useState(false);
  const {
    memberships,
    artists,
    releases,
    projects,
    isLoading: optionsLoading,
    error: optionsError,
  } = useLinkableEntityOptions();

  // canEditPublishingWork = canEditRecord(identity, isAdmin, owner)
  const canEdit = work
    ? canEditPublishingWork(identity, isAdmin ?? false, work.owner)
    : false;

  const handleStartEdit = () => {
    if (!work) return;
    setEditTitle(work.title);
    setEditRegStatus(work.registrationStatus);
    setEditContributors(normalizeToArray<string>(work.contributors).slice());
    setEditOwnershipSplits(normalizeToArray<[string, bigint]>(work.ownershipSplits).slice());
    setEditNotes(work.notes ?? '');
    setEditError('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditError('');
  };

  const validateOwnershipSplits = (): boolean => {
    const total = editOwnershipSplits.reduce((sum, [, pct]) => sum + Number(pct), 0);
    if (total > 100) {
      setEditError(`Ownership splits total ${total}% — must not exceed 100%.`);
      return false;
    }
    return true;
  };

  const handleSaveEdit = async () => {
    setEditError('');
    if (!editTitle.trim()) {
      setEditError('Title is required.');
      return;
    }
    if (!validateOwnershipSplits()) return;

    try {
      await updateWork.mutateAsync({
        id,
        title: editTitle.trim(),
        registrationStatus: editRegStatus.trim(),
        contributors: editContributors.filter(Boolean),
        ownershipSplits: editOwnershipSplits,
        notes: editNotes,
      });
      toast.success('Publishing work updated successfully!');
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update publishing work.';
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
    linkWork.mutate(
      {
        workId: id,
        memberIds: selected.memberIds,
        artistIds: selected.artistIds,
        releaseIds: selected.releaseIds,
        projectIds: selected.projectIds,
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

  const addContributor = () => setEditContributors([...editContributors, '']);
  const removeContributor = (i: number) => setEditContributors(editContributors.filter((_, idx) => idx !== i));
  const updateContributor = (i: number, val: string) => {
    const updated = [...editContributors];
    updated[i] = val;
    setEditContributors(updated);
  };

  const addOwnershipSplit = () => setEditOwnershipSplits([...editOwnershipSplits, ['', BigInt(0)]]);
  const removeOwnershipSplit = (i: number) => setEditOwnershipSplits(editOwnershipSplits.filter((_, idx) => idx !== i));
  const updateOwnershipSplitName = (i: number, val: string) => {
    const updated: [string, bigint][] = editOwnershipSplits.map((s) => [s[0], s[1]]);
    updated[i] = [val, updated[i][1]];
    setEditOwnershipSplits(updated);
  };
  const updateOwnershipSplitPct = (i: number, val: string) => {
    const updated: [string, bigint][] = editOwnershipSplits.map((s) => [s[0], s[1]]);
    updated[i] = [updated[i][0], BigInt(Math.max(0, Math.min(100, parseInt(val) || 0)))];
    setEditOwnershipSplits(updated);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !work) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate({ to: '/portal/publishing' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Publishing work not found.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const safeContributors = normalizeToArray<string>(work.contributors);
  const safeOwnershipSplits = normalizeToArray<[string, bigint]>(work.ownershipSplits);
  const safeLinkedMembers = normalizeToArray<string>(work.linkedMembers);
  const safeLinkedArtists = normalizeToArray<string>(work.linkedArtists);
  const safeLinkedReleases = normalizeToArray<string>(work.linkedReleases);
  const safeLinkedProjects = normalizeToArray<string>(work.linkedProjects);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/portal/publishing' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Publishing Works
        </Button>
        <div className="flex gap-2">
          {canEdit && !isEditing && (
            <Button variant="outline" onClick={handleStartEdit} className="gap-2">
              <Edit2 className="h-4 w-4" /> Edit Work
            </Button>
          )}
          <EditLinksButton onClick={() => setLinksDialogOpen(true)} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl">{work.title}</CardTitle>
            <Badge variant="outline">{work.registrationStatus || 'unregistered'}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4 border border-border rounded-lg p-4 bg-muted/20">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Edit Work</h3>
              {editError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{editError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-1.5">
                <Label>Title <span className="text-destructive">*</span></Label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Registration Status</Label>
                <Input
                  value={editRegStatus}
                  onChange={(e) => setEditRegStatus(e.target.value)}
                  placeholder="e.g. registered, pending"
                />
              </div>

              {/* Contributors */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Contributors</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addContributor} className="gap-1">
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
                {editContributors.map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={c}
                      onChange={(e) => updateContributor(i, e.target.value)}
                      placeholder="Contributor name"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeContributor(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Ownership Splits */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Ownership Splits</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOwnershipSplit} className="gap-1">
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
                {editOwnershipSplits.map(([name, pct], i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      value={name}
                      onChange={(e) => updateOwnershipSplitName(i, e.target.value)}
                      placeholder="Name"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={Number(pct).toString()}
                      onChange={(e) => updateOwnershipSplitPct(i, e.target.value)}
                      placeholder="%"
                      className="w-20"
                    />
                    <span className="text-muted-foreground text-sm">%</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOwnershipSplit(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {editOwnershipSplits.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Total: {editOwnershipSplits.reduce((s, [, p]) => s + Number(p), 0)}%
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveEdit} disabled={updateWork.isPending} className="gap-2">
                  {updateWork.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancelEdit} disabled={updateWork.isPending} className="gap-2">
                  <X className="h-4 w-4" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">ISWC</p>
                  <p className="text-sm mt-0.5">{work.iswc ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">ISRC</p>
                  <p className="text-sm mt-0.5">{work.isrc ?? '—'}</p>
                </div>
              </div>
              {safeContributors.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Contributors</p>
                  <div className="flex flex-wrap gap-1">
                    {safeContributors.map((c, i) => (
                      <Badge key={i} variant="secondary">{String(c)}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {safeOwnershipSplits.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Ownership Splits</p>
                  <div className="space-y-1">
                    {safeOwnershipSplits.map((split, i) => {
                      const name = String((split as [string, bigint])[0]);
                      const pct = Number((split as [string, bigint])[1]);
                      return (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{name}</span>
                          <span className="text-muted-foreground">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {work.notes && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{work.notes}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <RelatedRecordsSection
        linkedMembers={safeLinkedMembers}
        linkedArtists={safeLinkedArtists}
        linkedReleases={safeLinkedReleases}
        linkedProjects={safeLinkedProjects}
      />

      <ChangeHistoryPanel recordId={id} />

      <EditRelatedDialog
        open={linksDialogOpen}
        onOpenChange={setLinksDialogOpen}
        title="Edit Links"
        availableMemberships={memberships}
        availableArtists={artists}
        availableReleases={releases}
        availableProjects={projects}
        selectedMemberIds={safeLinkedMembers}
        selectedArtistIds={safeLinkedArtists}
        selectedReleaseIds={safeLinkedReleases}
        selectedProjectIds={safeLinkedProjects}
        onSave={handleSaveLinks}
        isSaving={linkWork.isPending}
        isLoadingOptions={optionsLoading}
        optionsError={optionsError as Error | null}
      />
    </div>
  );
}
