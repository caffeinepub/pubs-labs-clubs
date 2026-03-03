import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Edit2, Save, X, Loader2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGetRelease,
  useUpdateRelease,
  useLinkReleaseToEntities,
  useIsCallerAdmin,
} from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { canEditRelease } from '@/components/related/relatedRecordsPermissions';
import RelatedRecordsSection from '@/components/related/RelatedRecordsSection';
import EditLinksButton from '@/components/related/EditLinksButton';
import EditRelatedDialog from '@/components/related/EditRelatedDialog';
import { useLinkableEntityOptions } from '@/hooks/useLinkableEntityOptions';
import { normalizeToArray } from '@/utils/arrays';
import ChangeHistoryPanel from '@/components/history/ChangeHistoryPanel';

const RELEASE_TYPES = ['Single', 'EP', 'Album', 'Compilation', 'Mixtape', 'Live', 'Other'];

export default function ReleaseDetail() {
  const { id } = useParams({ from: '/portal/releases/$id' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();

  const { data: release, isLoading, error } = useGetRelease(id);
  const updateRelease = useUpdateRelease();
  const linkRelease = useLinkReleaseToEntities();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editReleaseType, setEditReleaseType] = useState('');
  const [editTracklist, setEditTracklist] = useState<string[]>([]);
  const [editKeyDates, setEditKeyDates] = useState<string[]>([]);
  const [editWorkflowChecklist, setEditWorkflowChecklist] = useState<string[]>([]);
  const [editError, setEditError] = useState('');

  const [linksDialogOpen, setLinksDialogOpen] = useState(false);
  const {
    memberships,
    artists,
    works,
    projects,
    isLoading: optionsLoading,
    error: optionsError,
  } = useLinkableEntityOptions();

  // canEditRelease = canEditRecord(identity, isAdmin, owner)
  const canEdit = release
    ? canEditRelease(identity, isAdmin ?? false, release.owner)
    : false;

  const handleStartEdit = () => {
    if (!release) return;
    setEditTitle(release.title);
    setEditReleaseType(release.releaseType);
    setEditTracklist(normalizeToArray<string>(release.tracklist).slice());
    setEditKeyDates(normalizeToArray<string>(release.keyDates).slice());
    setEditWorkflowChecklist(normalizeToArray<string>(release.workflowChecklist).slice());
    setEditError('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditError('');
  };

  const handleSaveEdit = async () => {
    setEditError('');
    if (!editTitle.trim()) {
      setEditError('Title is required.');
      return;
    }
    if (!editReleaseType) {
      setEditError('Release type is required.');
      return;
    }
    try {
      await updateRelease.mutateAsync({
        releaseId: id,
        title: editTitle.trim(),
        releaseType: editReleaseType,
        tracklist: editTracklist.filter(Boolean),
        keyDates: editKeyDates.filter(Boolean),
        workflowChecklist: editWorkflowChecklist.filter(Boolean),
      });
      toast.success('Release updated successfully!');
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update release.';
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
    linkRelease.mutate(
      {
        releaseId: id,
        memberIds: selected.memberIds,
        artistIds: selected.artistIds,
        workIds: selected.workIds,
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

  const tracklistHelpers = makeArrayHelpers(editTracklist, setEditTracklist);
  const keyDatesHelpers = makeArrayHelpers(editKeyDates, setEditKeyDates);
  const workflowHelpers = makeArrayHelpers(editWorkflowChecklist, setEditWorkflowChecklist);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !release) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate({ to: '/portal/releases' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Release not found.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const safeTracklist = normalizeToArray<string>(release.tracklist);
  const safeKeyDates = normalizeToArray<string>(release.keyDates);
  const safeOwners = normalizeToArray<string>(release.owners);
  const safeWorkflowChecklist = normalizeToArray<string>(release.workflowChecklist);
  const safeLinkedMembers = normalizeToArray<string>(release.linkedMembers);
  const safeLinkedArtists = normalizeToArray<string>(release.linkedArtists);
  const safeLinkedWorks = normalizeToArray<string>(release.linkedWorks);
  const safeLinkedProjects = normalizeToArray<string>(release.linkedProjects);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/portal/releases' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Releases
        </Button>
        <div className="flex gap-2">
          {canEdit && !isEditing && (
            <Button variant="outline" onClick={handleStartEdit} className="gap-2">
              <Edit2 className="h-4 w-4" /> Edit Release
            </Button>
          )}
          <EditLinksButton onClick={() => setLinksDialogOpen(true)} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl">{release.title}</CardTitle>
            <Badge variant="secondary">{release.releaseType}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4 border border-border rounded-lg p-4 bg-muted/20">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Edit Release</h3>
              {editError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{editError}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Title <span className="text-destructive">*</span></Label>
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Release Type <span className="text-destructive">*</span></Label>
                  <Select value={editReleaseType} onValueChange={setEditReleaseType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RELEASE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tracklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Tracklist</Label>
                  <Button type="button" variant="outline" size="sm" onClick={tracklistHelpers.add} className="gap-1">
                    <Plus className="h-3 w-3" /> Add Track
                  </Button>
                </div>
                {editTracklist.map((track, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={track}
                      onChange={(e) => tracklistHelpers.update(i, e.target.value)}
                      placeholder={`Track ${i + 1}`}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => tracklistHelpers.remove(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Key Dates */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Key Dates</Label>
                  <Button type="button" variant="outline" size="sm" onClick={keyDatesHelpers.add} className="gap-1">
                    <Plus className="h-3 w-3" /> Add Date
                  </Button>
                </div>
                {editKeyDates.map((date, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={date}
                      onChange={(e) => keyDatesHelpers.update(i, e.target.value)}
                      placeholder="e.g. Release: 2024-06-01"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => keyDatesHelpers.remove(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Workflow Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Workflow Checklist</Label>
                  <Button type="button" variant="outline" size="sm" onClick={workflowHelpers.add} className="gap-1">
                    <Plus className="h-3 w-3" /> Add Item
                  </Button>
                </div>
                {editWorkflowChecklist.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => workflowHelpers.update(i, e.target.value)}
                      placeholder="Checklist item"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => workflowHelpers.remove(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveEdit} disabled={updateRelease.isPending} className="gap-2">
                  {updateRelease.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancelEdit} disabled={updateRelease.isPending} className="gap-2">
                  <X className="h-4 w-4" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {safeTracklist.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Tracklist</p>
                  <ol className="list-decimal list-inside space-y-0.5">
                    {safeTracklist.map((track, i) => (
                      <li key={i} className="text-sm">{String(track)}</li>
                    ))}
                  </ol>
                </div>
              )}
              {safeKeyDates.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Key Dates</p>
                  <div className="flex flex-wrap gap-1">
                    {safeKeyDates.map((d, i) => (
                      <Badge key={i} variant="outline">{String(d)}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {safeOwners.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Owners</p>
                  <div className="flex flex-wrap gap-1">
                    {safeOwners.map((o, i) => (
                      <Badge key={i} variant="secondary">{String(o)}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {safeWorkflowChecklist.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Workflow Checklist</p>
                  <ul className="space-y-0.5">
                    {safeWorkflowChecklist.map((item, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
                        {String(item)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <RelatedRecordsSection
        linkedMembers={safeLinkedMembers}
        linkedArtists={safeLinkedArtists}
        linkedWorks={safeLinkedWorks}
        linkedProjects={safeLinkedProjects}
      />

      <ChangeHistoryPanel recordId={id} />

      <EditRelatedDialog
        open={linksDialogOpen}
        onOpenChange={setLinksDialogOpen}
        title="Edit Links"
        availableMemberships={memberships}
        availableArtists={artists}
        availableWorks={works}
        availableProjects={projects}
        selectedMemberIds={safeLinkedMembers}
        selectedArtistIds={safeLinkedArtists}
        selectedWorkIds={safeLinkedWorks}
        selectedProjectIds={safeLinkedProjects}
        onSave={handleSaveLinks}
        isSaving={linkRelease.isPending}
        isLoadingOptions={optionsLoading}
        optionsError={optionsError as Error | null}
      />
    </div>
  );
}
