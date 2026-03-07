import CommentsSection from "@/components/comments/CommentsSection";
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
import { useLinkableEntityOptions } from "@/hooks/useLinkableEntityOptions";
import { normalizeToArray } from "@/utils/arrays";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Edit2, Loader2, Save, Trash2, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { useInternetIdentity } from "../../../hooks/useInternetIdentity";
import {
  type Release,
  useDeleteRelease,
  useGetReleases,
  useUpdateRelease,
} from "../../../hooks/useQueries";

const RELEASE_TYPES = ["Single", "EP", "LP", "Album", "Compilation"];

export default function ReleaseDetail() {
  const { id } = useParams({ from: "/portal/releases/$id" });
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();
  const { identity } = useInternetIdentity();

  const { data: releases = [] } = useGetReleases();
  const updateRelease = useUpdateRelease();
  const deleteRelease = useDeleteRelease();

  const release = releases.find((r) => r.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState("");
  const [editTracklist, setEditTracklist] = useState("");
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
    if (release) {
      setEditTitle(release.title);
      setEditType(release.releaseType);
      setEditTracklist(normalizeToArray<string>(release.tracklist).join("\n"));
    }
  }, [release]);

  const canEdit =
    isAdmin ||
    (identity &&
      release?.owner &&
      release.owner === identity.getPrincipal().toString());

  const handleSave = async () => {
    if (!release) return;
    try {
      await updateRelease.mutateAsync({
        releaseId: release.id,
        updates: {
          title: editTitle,
          releaseType: editType,
          tracklist: editTracklist.split("\n").filter(Boolean),
        },
      });
      toast.success("Release updated");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update release");
    }
  };

  const handleDelete = async () => {
    if (!release) return;
    try {
      await deleteRelease.mutateAsync([release.id]);
      toast.success("Release deleted");
      navigate({ to: "/portal/releases" });
    } catch {
      toast.error("Failed to delete release");
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
    if (!release) return;
    await updateRelease.mutateAsync({
      releaseId: release.id,
      updates: {
        linkedMembers: selections.memberIds,
        linkedArtists: selections.artistIds,
        linkedWorks: selections.publishingIds,
        linkedProjects: selections.projectIds,
      },
    });
  };

  if (!release) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const safeLinkedMembers = normalizeToArray<string>(release.linkedMembers);
  const safeLinkedArtists = normalizeToArray<string>(release.linkedArtists);
  const safeLinkedWorks = normalizeToArray<string>(release.linkedWorks);
  const safeLinkedProjects = normalizeToArray<string>(release.linkedProjects);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/portal/releases" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{release.title || "Release"}</h1>
          <p className="text-xs text-muted-foreground font-mono">
            {release.id}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateRelease.isPending}
                >
                  {updateRelease.isPending ? (
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
                  disabled={deleteRelease.isPending}
                >
                  {deleteRelease.isPending ? (
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
                <label
                  htmlFor="release-edit-title"
                  className="text-sm font-medium"
                >
                  Title
                </label>
                <Input
                  id="release-edit-title"
                  className="mt-1"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="release-edit-type"
                  className="text-sm font-medium"
                >
                  Release Type
                </label>
                <Select value={editType} onValueChange={setEditType}>
                  <SelectTrigger id="release-edit-type" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RELEASE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label
                  htmlFor="release-edit-tracklist"
                  className="text-sm font-medium"
                >
                  Tracklist (one per line)
                </label>
                <Textarea
                  id="release-edit-tracklist"
                  className="mt-1"
                  rows={5}
                  value={editTracklist}
                  onChange={(e) => setEditTracklist(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  Title
                </p>
                <p className="mt-1">{release.title || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  Type
                </p>
                <Badge variant="outline" className="mt-1">
                  {release.releaseType}
                </Badge>
              </div>
              {release.tracklist.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Tracklist
                  </p>
                  <ol className="mt-1 space-y-1">
                    {release.tracklist.map((track) => (
                      <li key={track} className="text-sm">
                        {track}
                      </li>
                    ))}
                  </ol>
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
            linkedProjects={safeLinkedProjects}
          />
        </CardContent>
      </Card>

      <ChangeHistoryPanel recordId={id} />

      <CommentsSection recordId={id} />

      <EditRelatedDialog
        open={showLinksDialog}
        onOpenChange={setShowLinksDialog}
        title="Edit Related Records"
        memberOptions={memberOptions}
        selectedMemberIds={safeLinkedMembers}
        publishingOptions={publishingOptions}
        selectedPublishingIds={safeLinkedWorks}
        releaseOptions={releaseOptions}
        selectedReleaseIds={[]}
        projectOptions={projectOptions}
        selectedProjectIds={safeLinkedProjects}
        artistOptions={artistOptions}
        selectedArtistIds={safeLinkedArtists}
        onSave={handleSaveLinks}
        isSaving={updateRelease.isPending}
        isLoadingOptions={optionsLoading}
        optionsError={optionsError}
      />
    </div>
  );
}
