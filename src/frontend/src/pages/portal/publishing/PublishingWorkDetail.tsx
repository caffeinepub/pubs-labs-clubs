import EditLinksButton from "@/components/related/EditLinksButton";
import EditRelatedDialog from "@/components/related/EditRelatedDialog";
import RelatedRecordsSection from "@/components/related/RelatedRecordsSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLinkableEntityOptions } from "@/hooks/useLinkableEntityOptions";
import { normalizeToArray } from "@/utils/arrays";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Edit2, Loader2, Save, Trash2, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { useInternetIdentity } from "../../../hooks/useInternetIdentity";
import {
  type PublishingWork,
  useDeletePublishingWork,
  useGetPublishingWorks,
  useUpdatePublishingWork,
} from "../../../hooks/useQueries";

export default function PublishingWorkDetail() {
  const { id } = useParams({ from: "/portal/publishing/$id" });
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();
  const { identity } = useInternetIdentity();

  const { data: works = [] } = useGetPublishingWorks();
  const updateMutation = useUpdatePublishingWork();
  const deleteMutation = useDeletePublishingWork();

  const work = works.find((w) => w.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editRegistrationStatus, setEditRegistrationStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editContributors, setEditContributors] = useState("");
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
    if (work) {
      setEditTitle(work.title);
      setEditRegistrationStatus(work.registrationStatus);
      setEditNotes(work.notes);
      setEditContributors(
        normalizeToArray<string>(work.contributors).join("\n"),
      );
    }
  }, [work]);

  // owner is stored as string in the local PublishingWork interface
  const canEdit =
    isAdmin ||
    (identity &&
      work?.owner &&
      work.owner === identity.getPrincipal().toString());

  const handleSave = async () => {
    if (!work) return;
    try {
      await updateMutation.mutateAsync({
        workId: work.id,
        updates: {
          title: editTitle,
          registrationStatus: editRegistrationStatus,
          notes: editNotes,
          contributors: editContributors.split("\n").filter(Boolean),
        },
      });
      toast.success("Publishing work updated");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update publishing work");
    }
  };

  const handleDelete = async () => {
    if (!work) return;
    try {
      await deleteMutation.mutateAsync([work.id]);
      toast.success("Publishing work deleted");
      navigate({ to: "/portal/publishing" });
    } catch {
      toast.error("Failed to delete publishing work");
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
    if (!work) return;
    await updateMutation.mutateAsync({
      workId: work.id,
      updates: {
        linkedMembers: selections.memberIds,
        linkedArtists: selections.artistIds,
        linkedReleases: selections.releaseIds,
        linkedProjects: selections.projectIds,
      },
    });
  };

  if (!work) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const safeLinkedMembers = normalizeToArray<string>(work.linkedMembers);
  const safeLinkedArtists = normalizeToArray<string>(work.linkedArtists);
  const safeLinkedReleases = normalizeToArray<string>(work.linkedReleases);
  const safeLinkedProjects = normalizeToArray<string>(work.linkedProjects);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/portal/publishing" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {work.title || "Publishing Work"}
          </h1>
          <p className="text-xs text-muted-foreground font-mono">{work.id}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
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
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
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
                <label htmlFor="pw-edit-title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="pw-edit-title"
                  className="mt-1"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="pw-edit-reg-status"
                  className="text-sm font-medium"
                >
                  Registration Status
                </label>
                <Input
                  id="pw-edit-reg-status"
                  className="mt-1"
                  value={editRegistrationStatus}
                  onChange={(e) => setEditRegistrationStatus(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="pw-edit-contributors"
                  className="text-sm font-medium"
                >
                  Contributors (one per line)
                </label>
                <Textarea
                  id="pw-edit-contributors"
                  className="mt-1"
                  rows={3}
                  value={editContributors}
                  onChange={(e) => setEditContributors(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="pw-edit-notes" className="text-sm font-medium">
                  Notes
                </label>
                <Textarea
                  id="pw-edit-notes"
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
                <p className="mt-1">{work.title || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  Registration Status
                </p>
                <Badge variant="outline" className="mt-1 capitalize">
                  {work.registrationStatus}
                </Badge>
              </div>
              {work.contributors.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Contributors
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {work.contributors.map((c) => (
                      <Badge key={c} variant="secondary">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {work.notes && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Notes
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">
                    {work.notes}
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
            linkedReleases={safeLinkedReleases}
            linkedProjects={safeLinkedProjects}
          />
        </CardContent>
      </Card>

      <EditRelatedDialog
        open={showLinksDialog}
        onOpenChange={setShowLinksDialog}
        title="Edit Related Records"
        memberOptions={memberOptions}
        selectedMemberIds={safeLinkedMembers}
        publishingOptions={publishingOptions}
        selectedPublishingIds={[]}
        releaseOptions={releaseOptions}
        selectedReleaseIds={safeLinkedReleases}
        projectOptions={projectOptions}
        selectedProjectIds={safeLinkedProjects}
        artistOptions={artistOptions}
        selectedArtistIds={safeLinkedArtists}
        onSave={handleSaveLinks}
        isSaving={updateMutation.isPending}
        isLoadingOptions={optionsLoading}
        optionsError={optionsError}
      />
    </div>
  );
}
