import EditLinksButton from "@/components/related/EditLinksButton";
import EditRelatedDialog from "@/components/related/EditRelatedDialog";
import RelatedRecordsSection from "@/components/related/RelatedRecordsSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useLinkableEntityOptions } from "@/hooks/useLinkableEntityOptions";
import {
  type ArtistDevelopment,
  useDeleteArtistDevelopment,
  useGetArtistDevelopments,
  useUpdateArtistDevelopment,
} from "@/hooks/useQueries";
import { normalizeToArray } from "@/utils/arrays";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Edit2, Loader2, Save, Trash2, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ArtistDevelopmentDetail() {
  const { id } = useParams({ from: "/portal/artists/$id" });
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();
  const { identity } = useInternetIdentity();

  const { data: entries = [] } = useGetArtistDevelopments();
  const updateArtist = useUpdateArtistDevelopment();
  const deleteArtist = useDeleteArtistDevelopment();

  const entry = entries.find((e) => e.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [editArtistId, setEditArtistId] = useState("");
  const [editGoals, setEditGoals] = useState("");
  const [editPlans, setEditPlans] = useState("");
  const [editMilestones, setEditMilestones] = useState("");
  const [editNotes, setEditNotes] = useState("");
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
    if (entry) {
      setEditArtistId(entry.artistId);
      setEditGoals(normalizeToArray<string>(entry.goals).join("\n"));
      setEditPlans(normalizeToArray<string>(entry.plans).join("\n"));
      setEditMilestones(normalizeToArray<string>(entry.milestones).join("\n"));
      setEditNotes(entry.internalNotes);
    }
  }, [entry]);

  const canEdit =
    isAdmin ||
    (identity &&
      entry?.owner &&
      entry.owner === identity.getPrincipal().toString());

  const handleSave = async () => {
    if (!entry) return;
    try {
      await updateArtist.mutateAsync({
        entryId: entry.id,
        updates: {
          artistId: editArtistId,
          goals: editGoals.split("\n").filter(Boolean),
          plans: editPlans.split("\n").filter(Boolean),
          milestones: editMilestones.split("\n").filter(Boolean),
          internalNotes: editNotes,
        },
      });
      toast.success("Record updated");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update record");
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    try {
      await deleteArtist.mutateAsync([entry.id]);
      toast.success("Record deleted");
      navigate({ to: "/portal/artists" });
    } catch {
      toast.error("Failed to delete record");
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
    if (!entry) return;
    await updateArtist.mutateAsync({
      entryId: entry.id,
      updates: {
        relatedMemberships: selections.memberIds,
        relatedPublishing: selections.publishingIds,
        relatedLabelEntities: selections.releaseIds,
        relatedRecordingProjects: selections.projectIds,
      },
    });
  };

  if (!entry) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const safeLinkedMembers = normalizeToArray<string>(entry.relatedMemberships);
  const safeLinkedWorks = normalizeToArray<string>(entry.relatedPublishing);
  const safeLinkedReleases = normalizeToArray<string>(
    entry.relatedLabelEntities,
  );
  const safeLinkedProjects = normalizeToArray<string>(
    entry.relatedRecordingProjects,
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/portal/artists" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {entry.artistId || "Artist Development"}
          </h1>
          <p className="text-xs text-muted-foreground font-mono">{entry.id}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateArtist.isPending}
                >
                  {updateArtist.isPending ? (
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
                  disabled={deleteArtist.isPending}
                >
                  {deleteArtist.isPending ? (
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
                  htmlFor="ad-edit-artist-id"
                  className="text-sm font-medium"
                >
                  Artist ID / Name
                </label>
                <Input
                  id="ad-edit-artist-id"
                  className="mt-1"
                  value={editArtistId}
                  onChange={(e) => setEditArtistId(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="ad-edit-goals" className="text-sm font-medium">
                  Goals (one per line)
                </label>
                <Textarea
                  id="ad-edit-goals"
                  className="mt-1"
                  rows={3}
                  value={editGoals}
                  onChange={(e) => setEditGoals(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="ad-edit-plans" className="text-sm font-medium">
                  Plans (one per line)
                </label>
                <Textarea
                  id="ad-edit-plans"
                  className="mt-1"
                  rows={3}
                  value={editPlans}
                  onChange={(e) => setEditPlans(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="ad-edit-milestones"
                  className="text-sm font-medium"
                >
                  Milestones (one per line)
                </label>
                <Textarea
                  id="ad-edit-milestones"
                  className="mt-1"
                  rows={3}
                  value={editMilestones}
                  onChange={(e) => setEditMilestones(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="ad-edit-notes" className="text-sm font-medium">
                  Internal Notes
                </label>
                <Textarea
                  id="ad-edit-notes"
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
                  Artist
                </p>
                <p className="mt-1">{entry.artistId || "—"}</p>
              </div>
              {entry.goals.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Goals
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.goals.map((g) => (
                      <Badge key={g} variant="secondary">
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {entry.plans.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Plans
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.plans.map((p) => (
                      <Badge key={p} variant="outline">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {entry.milestones.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Milestones
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.milestones.map((m) => (
                      <Badge key={m} variant="outline">
                        {m}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {entry.internalNotes && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Notes
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">
                    {entry.internalNotes}
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
            linkedWorks={safeLinkedWorks}
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
        selectedPublishingIds={safeLinkedWorks}
        releaseOptions={releaseOptions}
        selectedReleaseIds={safeLinkedReleases}
        projectOptions={projectOptions}
        selectedProjectIds={safeLinkedProjects}
        artistOptions={artistOptions}
        selectedArtistIds={[]}
        onSave={handleSaveLinks}
        isSaving={updateArtist.isPending}
        isLoadingOptions={optionsLoading}
        optionsError={optionsError}
      />
    </div>
  );
}
