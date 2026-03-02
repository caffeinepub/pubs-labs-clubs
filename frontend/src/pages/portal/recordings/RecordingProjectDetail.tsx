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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGetRecordingProject,
  useUpdateRecordingProject,
  useLinkProjectToEntities,
  useIsCallerAdmin,
} from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { canEditRecordingProject } from '@/components/related/relatedRecordsPermissions';
import RelatedRecordsSection from '@/components/related/RelatedRecordsSection';
import EditLinksButton from '@/components/related/EditLinksButton';
import EditRelatedDialog from '@/components/related/EditRelatedDialog';
import { useLinkableEntityOptions } from '@/hooks/useLinkableEntityOptions';
import { normalizeToArray } from '@/utils/arrays';
import { ProjectStatus } from '../../../backend';

function formatStatus(status: string): string {
  return status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'in_progress': return 'default';
    case 'completed': return 'secondary';
    case 'planned': return 'outline';
    case 'archived': return 'destructive';
    default: return 'outline';
  }
}

export default function RecordingProjectDetail() {
  const { id } = useParams({ from: '/portal/recordings/$id' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();

  const { data: project, isLoading, error } = useGetRecordingProject(id);
  const updateProject = useUpdateRecordingProject();
  const linkProject = useLinkProjectToEntities();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editParticipants, setEditParticipants] = useState<string[]>([]);
  const [editSessionDate, setEditSessionDate] = useState('');
  const [editStatus, setEditStatus] = useState<ProjectStatus>(ProjectStatus.planned);
  const [editNotes, setEditNotes] = useState('');
  const [editError, setEditError] = useState('');

  const [linksDialogOpen, setLinksDialogOpen] = useState(false);
  const {
    memberships,
    artists,
    works,
    releases,
    isLoading: optionsLoading,
    error: optionsError,
  } = useLinkableEntityOptions();

  // canEditRecordingProject = canEditRecord(identity, isAdmin, owner)
  const canEdit = project
    ? canEditRecordingProject(identity, isAdmin ?? false, project.owner)
    : false;

  const handleStartEdit = () => {
    if (!project) return;
    setEditTitle(project.title);
    setEditParticipants(normalizeToArray<string>(project.participants).slice());
    const dateMs = Number(project.sessionDate) / 1_000_000;
    setEditSessionDate(new Date(dateMs).toISOString().split('T')[0]);
    setEditStatus(project.status as ProjectStatus);
    setEditNotes(project.notes ?? '');
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
    const sessionDateMs = editSessionDate
      ? BigInt(new Date(editSessionDate).getTime()) * BigInt(1_000_000)
      : project!.sessionDate;

    try {
      await updateProject.mutateAsync({
        projectId: id,
        title: editTitle.trim(),
        participants: editParticipants.filter(Boolean),
        sessionDate: sessionDateMs,
        status: editStatus,
        notes: editNotes,
      });
      toast.success('Recording project updated successfully!');
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update recording project.';
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
    linkProject.mutate(
      {
        projectId: id,
        memberIds: selected.memberIds,
        artistIds: selected.artistIds,
        workIds: selected.workIds,
        releaseIds: selected.releaseIds,
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

  const participantHelpers = {
    add: () => setEditParticipants([...editParticipants, '']),
    remove: (i: number) => setEditParticipants(editParticipants.filter((_, idx) => idx !== i)),
    update: (i: number, val: string) => {
      const updated = [...editParticipants];
      updated[i] = val;
      setEditParticipants(updated);
    },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate({ to: '/portal/recordings' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Recording project not found.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const safeParticipants = normalizeToArray<string>(project.participants);
  const safeLinkedMembers = normalizeToArray<string>(project.linkedMembers);
  const safeLinkedArtists = normalizeToArray<string>(project.linkedArtists);
  const safeLinkedWorks = normalizeToArray<string>(project.linkedWorks);
  const safeLinkedReleases = normalizeToArray<string>(project.linkedReleases);

  const sessionDateDisplay = (() => {
    try {
      const ms = Number(project.sessionDate) / 1_000_000;
      return new Date(ms).toLocaleDateString();
    } catch {
      return '—';
    }
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/portal/recordings' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Recording Projects
        </Button>
        <div className="flex gap-2">
          {canEdit && !isEditing && (
            <Button variant="outline" onClick={handleStartEdit} className="gap-2">
              <Edit2 className="h-4 w-4" /> Edit Project
            </Button>
          )}
          <EditLinksButton onClick={() => setLinksDialogOpen(true)} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl">{project.title}</CardTitle>
            <Badge variant={statusVariant(project.status as string)}>
              {formatStatus(project.status as string)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4 border border-border rounded-lg p-4 bg-muted/20">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Edit Project</h3>
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
                  <Label>Status</Label>
                  <Select value={editStatus as string} onValueChange={(v) => setEditStatus(v as ProjectStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Session Date</Label>
                  <Input
                    type="date"
                    value={editSessionDate}
                    onChange={(e) => setEditSessionDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Participants */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Participants</Label>
                  <Button type="button" variant="outline" size="sm" onClick={participantHelpers.add} className="gap-1">
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
                {editParticipants.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={p}
                      onChange={(e) => participantHelpers.update(i, e.target.value)}
                      placeholder="Participant name"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => participantHelpers.remove(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveEdit} disabled={updateProject.isPending} className="gap-2">
                  {updateProject.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancelEdit} disabled={updateProject.isPending} className="gap-2">
                  <X className="h-4 w-4" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Session Date</p>
                  <p className="text-sm mt-0.5">{sessionDateDisplay}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Notes</p>
                  <p className="text-sm mt-0.5 whitespace-pre-wrap">{project.notes || '—'}</p>
                </div>
              </div>
              {safeParticipants.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Participants</p>
                  <div className="flex flex-wrap gap-1">
                    {safeParticipants.map((p, i) => (
                      <Badge key={i} variant="secondary">{String(p)}</Badge>
                    ))}
                  </div>
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
        linkedReleases={safeLinkedReleases}
      />

      <EditRelatedDialog
        open={linksDialogOpen}
        onOpenChange={setLinksDialogOpen}
        title="Edit Links"
        availableMemberships={memberships}
        availableArtists={artists}
        availableWorks={works}
        availableReleases={releases}
        selectedMemberIds={safeLinkedMembers}
        selectedArtistIds={safeLinkedArtists}
        selectedWorkIds={safeLinkedWorks}
        selectedReleaseIds={safeLinkedReleases}
        onSave={handleSaveLinks}
        isSaving={linkProject.isPending}
        isLoadingOptions={optionsLoading}
        optionsError={optionsError as Error | null}
      />
    </div>
  );
}
