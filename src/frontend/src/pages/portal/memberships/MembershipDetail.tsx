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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Loader2, Save } from "lucide-react";
import React, { useState, useEffect } from "react";
import type { T as MemberStatus } from "../../../backend";
import CommentsSection from "../../../components/comments/CommentsSection";
import ChangeHistoryPanel from "../../../components/history/ChangeHistoryPanel";
import EditLinksButton from "../../../components/related/EditLinksButton";
import EditRelatedDialog from "../../../components/related/EditRelatedDialog";
import RelatedRecordsSection from "../../../components/related/RelatedRecordsSection";
import { canEditMembership } from "../../../components/related/relatedRecordsPermissions";
import { useActor } from "../../../hooks/useActor";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { useInternetIdentity } from "../../../hooks/useInternetIdentity";
import { useLinkableEntityOptions } from "../../../hooks/useLinkableEntityOptions";
import { useMembershipSupplementalData } from "../../../hooks/useMembershipSupplementalData";
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
  const [phone, setPhone] = useState("");
  const [suppTier, setSuppTier] = useState("");
  const [role, setRole] = useState("");
  const [genre, setGenre] = useState("");
  const [bio, setBio] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [linksDialogOpen, setLinksDialogOpen] = useState(false);

  const { supplemental, update: updateSupplemental } =
    useMembershipSupplementalData(id);

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

  // Load supplemental data once it's available
  useEffect(() => {
    setPhone(supplemental.phone ?? "");
    setSuppTier(supplemental.tier ?? "");
    setRole(supplemental.role ?? "");
    setGenre(supplemental.genre ?? "");
    setBio(supplemental.bio ?? "");
  }, [
    supplemental.phone,
    supplemental.tier,
    supplemental.role,
    supplemental.genre,
    supplemental.bio,
  ]);

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
      // Persist supplemental fields to localStorage
      updateSupplemental({
        phone: phone.trim() || undefined,
        tier: suppTier || undefined,
        role: role || undefined,
        genre: genre.trim() || undefined,
        bio: bio.trim() || undefined,
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
                    data-ocid="membership.name.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="member-email">Email</Label>
                  <Input
                    id="member-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-ocid="membership.input"
                  />
                </div>

                {/* Additional Details section */}
                <div className="pt-1">
                  <Separator className="mb-3" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Additional Details
                  </p>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="detail-phone">Phone</Label>
                      <Input
                        id="detail-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +1 (555) 000-0000"
                        data-ocid="membership.phone.input"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="detail-tier">Member Tier</Label>
                      <Select value={suppTier} onValueChange={setSuppTier}>
                        <SelectTrigger
                          id="detail-tier"
                          data-ocid="membership.tier.select"
                        >
                          <SelectValue
                            placeholder={
                              membership.profile.tier || "Select tier…"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Artist">Artist</SelectItem>
                          <SelectItem value="Publishing">Publishing</SelectItem>
                          <SelectItem value="Label">Label</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="detail-role">Primary Role</Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger
                          id="detail-role"
                          data-ocid="membership.role.select"
                        >
                          <SelectValue placeholder="Select role…" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Artist">Artist</SelectItem>
                          <SelectItem value="Producer">Producer</SelectItem>
                          <SelectItem value="Songwriter">Songwriter</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Executive">Executive</SelectItem>
                          <SelectItem value="A&R">A&R</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="detail-genre">Genre / Discipline</Label>
                      <Input
                        id="detail-genre"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        placeholder="e.g. Hip-Hop, R&B, Classical"
                        data-ocid="membership.genre.input"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="detail-bio">Bio</Label>
                      <Textarea
                        id="detail-bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value.slice(0, 500))}
                        placeholder="Short bio for this member"
                        rows={3}
                        data-ocid="membership.bio.textarea"
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {bio.length} / 500
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending || actorFetching}
                  className="w-full"
                  data-ocid="membership.save_button"
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

                {/* Read-only supplemental fields */}
                {(supplemental.phone ||
                  supplemental.tier ||
                  supplemental.role ||
                  supplemental.genre ||
                  supplemental.bio) && (
                  <>
                    <Separator />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Additional Details
                    </p>
                    {supplemental.phone && (
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{supplemental.phone}</p>
                      </div>
                    )}
                    {supplemental.tier && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Member Tier
                        </p>
                        <p className="font-medium">{supplemental.tier}</p>
                      </div>
                    )}
                    {supplemental.role && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Primary Role
                        </p>
                        <p className="font-medium">{supplemental.role}</p>
                      </div>
                    )}
                    {supplemental.genre && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Genre / Discipline
                        </p>
                        <p className="font-medium">{supplemental.genre}</p>
                      </div>
                    )}
                    {supplemental.bio && (
                      <div>
                        <p className="text-sm text-muted-foreground">Bio</p>
                        <p className="font-medium text-sm leading-relaxed">
                          {supplemental.bio}
                        </p>
                      </div>
                    )}
                  </>
                )}
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
              <p className="font-medium">
                {supplemental.tier ?? membership.profile.tier}
              </p>
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

      <ChangeHistoryPanel recordId={id} />

      <CommentsSection recordId={id} />

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
