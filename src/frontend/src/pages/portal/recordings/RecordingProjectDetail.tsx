import ChangeHistoryPanel from "@/components/history/ChangeHistoryPanel";
import EditLinksButton from "@/components/related/EditLinksButton";
import EditRelatedDialog from "@/components/related/EditRelatedDialog";
import RelatedRecordsSection from "@/components/related/RelatedRecordsSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useLinkableEntityOptions } from "@/hooks/useLinkableEntityOptions";
import {
  type RecordingProject,
  useDeleteRecordingProject,
  useGetRecordingProjects,
  useUpdateRecordingProject,
} from "@/hooks/useQueries";
import { normalizeToArray } from "@/utils/arrays";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Edit2, Loader2, Save, Trash2, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

const STATUS_OPTIONS = ["planned", "in_progress", "completed", "archived"];

export default function RecordingProjectDetail() {
  const { id } = useParams({ from: "/portal/recordings/$id" });
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();
  const { identity } = useInternetIdentity();

  const { data: projects = [] } = useGetRecordingProjects();
  const updateProject = useUpdateRecordingProject();
  const deleteProject = useDeleteRecordingProject();

  const project = projects.find((p) => p.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editParticipants, setEditParticipants] = useState("");
  const [showLinksDialog, setShowLinksDialog] = useState(false);

  const {
    memberOptions,
    publishingOptions,
    releaseOptions,
    projectOptions,
    artistOptions,
    isLoading: optionsLoading,
    error: optionsError,
  } = useLinkableEntityOptions();

  useEffect(() => {
    if (project) {
      setEditTitle(project.title);
      setEditStatus(project.status);
      setEditNotes(project.notes);
      setEditParticipants(
        normalizeToArray<string>(project.participants).join("\n"),
      );
    }
  }, [project]);

  const canEdit =
    isAdmin ||
    (identity &&
      project?.owner &&
      project.owner === identity.getPrincipal().toString());

  const handleSave = async () => {
    if (!project) return;
    try {
      await updateProject.mutateAsync({
        projectId: project.id,
        updates: {
          title: editTitle,
          status: editStatus,
          notes: editNotes,
          participants: editParticipants.split("\n").filter(Boolean),
        },
      });
      toast.success("Project updated");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update project");
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    try {
      await deleteProject.mutateAsync([project.id]);
      toast.success("Project deleted");
      navigate({ to: "/portal/recordings" });
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const handleSaveLinks = async (selections: {
    memberIds: string[];
    artistIds: string[];
    workIds: string[];
    publishingIds: string[];
    releaseIds: string[];
    projectIds: string[];
  }) => {
    if (!project) return;
    await updateProject.mutateAsync({
      projectId: project.id,
      updates: {
        linkedMembers: selections.memberIds,
        linkedArtists: selections.artistIds,
        linkedWorks: selections.publishingIds,
        linkedReleases: selections.releaseIds,
      },
    });
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const safeLinkedMembers = normalizeToArray<string>(project.linkedMembers);
  const safeLinkedArtists = normalizeToArray<string>(project.linkedArtists);
  const safeLinkedWorks = normalizeToArray<string>(project.linkedWorks);
  const safeLinkedReleases = normalizeToArray<string>(project.linkedReleases);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/portal/recordings" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {project.title || "Recording Project"}
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            {project.id}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateProject.isPending}
                >
                  {updateProject.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteProject.isPending}
                >
                  {deleteProject.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
                  Delete
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <label htmlFor="rp-edit-title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="rp-edit-title"
                  className="mt-1"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="rp-edit-status" className="text-sm font-medium">
                  Status
                </label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger id="rp-edit-status" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label
                  htmlFor="rp-edit-participants"
                  className="text-sm font-medium"
                >
                  Participants (one per line)
                </label>
                <Textarea
                  id="rp-edit-participants"
                  className="mt-1"
                  rows={3}
                  value={editParticipants}
                  onChange={(e) => setEditParticipants(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="rp-edit-notes" className="text-sm font-medium">
                  Notes
                </label>
                <Textarea
                  id="rp-edit-notes"
                  className="mt-1"
                  rows={4}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  Title
                </p>
                <p className="mt-1">{project.title || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  Status
                </p>
                <Badge variant="outline" className="mt-1 capitalize">
                  {project.status.replace("_", " ")}
                </Badge>
              </div>
              {project.participants.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Participants
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.participants.map((p) => (
                      <Badge key={p} variant="secondary">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {project.notes && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Notes
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">
                    {project.notes}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Related Records */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Related Records</CardTitle>
          {canEdit && (
            <EditLinksButton onClick={() => setShowLinksDialog(true)} />
          )}
        </CardHeader>
        <CardContent>
          <RelatedRecordsSection
            linkedMembers={safeLinkedMembers}
            linkedArtists={safeLinkedArtists}
            linkedWorks={safeLinkedWorks}
            linkedReleases={safeLinkedReleases}
          />
        </CardContent>
      </Card>

      <ChangeHistoryPanel recordId={id} />

      <EditRelatedDialog
        open={showLinksDialog}
        onOpenChange={setShowLinksDialog}
        title="Edit Related Records"
        memberOptions={memberOptions}
        selectedMemberIds={safeLinkedMembers}
        publishingOptions={publishingOptions}
        selectedPublishingIds={safeLinkedWorks}
        releaseOptions={releaseOptions}
        selectedReleaseIds={safeLinkedReleases}
        projectOptions={projectOptions}
        selectedProjectIds={[]}
        artistOptions={artistOptions}
        selectedArtistIds={safeLinkedArtists}
        onSave={handleSaveLinks}
        isSaving={updateProject.isPending}
        isLoadingOptions={optionsLoading}
        optionsError={optionsError}
      />
    </div>
  );
}
