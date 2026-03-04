import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate, useParams } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Loader2, Save } from "lucide-react";
import React, { useState, useEffect } from "react";
import type { T as MemberStatus } from "../../../backend";
import EditLinksButton from "../../../components/related/EditLinksButton";
import EditRelatedDialog from "../../../components/related/EditRelatedDialog";
import RelatedRecordsSection from "../../../components/related/RelatedRecordsSection";
import { canEditMembership } from "../../../components/related/relatedRecordsPermissions";
import { useActor } from "../../../hooks/useActor";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { useInternetIdentity } from "../../../hooks/useInternetIdentity";
import { useLinkableEntityOptions } from "../../../hooks/useLinkableEntityOptions";
import {
  useGetMembershipDetails,
  useUpdateMembership,
  useUpdateMembershipLinks,
  useUpdateMembershipStatus,
} from "../../../hooks/useQueries";
import { normalizeToArray } from "../../../utils/arrays";

export default function MembershipDetail() {
  const { id } = useParams({ from: "/portal/memberships/$id" });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { isAdmin } = useCurrentUser();
  const { isFetching: actorFetching } = useActor();

  const { data: membership, isLoading } = useGetMembershipDetails(id);
  const updateMutation = useUpdateMembership();
  const updateStatusMutation = useUpdateMembershipStatus();
  const updateLinksMutation = useUpdateMembershipLinks();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [linksDialogOpen, setLinksDialogOpen] = useState(false);

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
    if (membership) {
      setName(membership.profile.name);
      setEmail(membership.profile.email);
    }
  }, [membership]);

  const canEdit = canEditMembership(
    identity,
    isAdmin,
    membership?.profile.principal,
  );

  const handleSave = async () => {
    if (!membership) return;
    if (actorFetching) {
      setSaveError(
        "The system is still initializing. Please wait a moment and try again.",
      );
      return;
    }
    setSaveError(null);
    try {
      await updateMutation.mutateAsync({
        id,
        name,
        email,
        status: membership.profile.status,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save changes.";
      setSaveError(
        message.includes("Actor not available")
          ? "The system is still initializing. Please wait a moment and try again."
          : message,
      );
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!membership) return;
    if (actorFetching) {
      setSaveError(
        "The system is still initializing. Please wait a moment and try again.",
      );
      return;
    }
    setSaveError(null);
    try {
      await updateStatusMutation.mutateAsync({
        id,
        status: status as MemberStatus,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update status.";
      setSaveError(
        message.includes("Actor not available")
          ? "The system is still initializing. Please wait a moment and try again."
          : message,
      );
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
    if (actorFetching)
      throw new Error(
        "Actor not available. Please wait a moment and try again.",
      );
    await updateLinksMutation.mutateAsync({
      id,
      artistIds: selections.artistIds,
      workIds: selections.publishingIds,
      releaseIds: selections.releaseIds,
      projectIds: selections.projectIds,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Membership not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const safeLinkedArtists = normalizeToArray<string>(membership.linkedArtists);
  const safeLinkedWorks = normalizeToArray<string>(membership.linkedWorks);
  const safeLinkedReleases = normalizeToArray<string>(
    membership.linkedReleases,
  );
  const safeLinkedProjects = normalizeToArray<string>(
    membership.linkedProjects,
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/portal/memberships" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{membership.profile.name}</h1>
          <p className="text-muted-foreground text-sm">Membership ID: {id}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {canEdit && (
            <EditLinksButton onClick={() => setLinksDialogOpen(true)} />
          )}
        </div>
      </div>

      {saveError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      {actorFetching && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Initializing connection… save will be available shortly.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {canEdit ? (
              <>
                <div className="space-y-1">
                  <Label htmlFor="member-name">Name</Label>
                  <Input
                    id="member-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="member-email">Email</Label>
                  <Input
                    id="member-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending || actorFetching}
                  className="w-full"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : actorFetching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Initializing…
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{membership.profile.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{membership.profile.email}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status &amp; Tier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Current Status
              </p>
              {isAdmin ? (
                <Select
                  value={membership.profile.status as string}
                  onValueChange={handleStatusChange}
                  disabled={updateStatusMutation.isPending || actorFetching}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applicant">Applicant</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge>{membership.profile.status as string}</Badge>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tier</p>
              <p className="font-medium">{membership.profile.tier}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">
                {new Date(
                  Number(membership.profile.created_at) / 1_000_000,
                ).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <RelatedRecordsSection
        linkedArtists={safeLinkedArtists}
        linkedWorks={safeLinkedWorks}
        linkedReleases={safeLinkedReleases}
        linkedProjects={safeLinkedProjects}
      />

      <EditRelatedDialog
        open={linksDialogOpen}
        onOpenChange={setLinksDialogOpen}
        title="Edit Membership Links"
        memberOptions={memberOptions}
        selectedMemberIds={[]}
        publishingOptions={publishingOptions}
        selectedPublishingIds={safeLinkedWorks}
        releaseOptions={releaseOptions}
        selectedReleaseIds={safeLinkedReleases}
        projectOptions={projectOptions}
        selectedProjectIds={safeLinkedProjects}
        artistOptions={artistOptions}
        selectedArtistIds={safeLinkedArtists}
        onSave={handleSaveLinks}
        isSaving={updateLinksMutation.isPending}
        isLoadingOptions={optionsLoading}
        optionsError={optionsError}
      />
    </div>
  );
}
