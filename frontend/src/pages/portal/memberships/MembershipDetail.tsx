import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGetMembershipDetails,
  useUpdateMembershipProfileFields,
  useUpdateMembershipStatus,
  useUpdateMembershipLinks,
  useGetCallerUserRole,
} from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useLinkableEntityOptions } from '@/hooks/useLinkableEntityOptions';
import RelatedRecordsSection from '@/components/related/RelatedRecordsSection';
import EditLinksButton from '@/components/related/EditLinksButton';
import EditRelatedDialog from '@/components/related/EditRelatedDialog';
import { normalizeToArray } from '@/utils/arrays';
import { T as MemberStatusT } from '../../../backend';
import SectionPlaceholder from '@/components/feedback/SectionPlaceholder';
import { findingsForSection } from '@/utils/portalAudit';

function statusBadgeVariant(
  status: MemberStatusT
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case MemberStatusT.active:
      return 'default';
    case MemberStatusT.applicant:
      return 'secondary';
    case MemberStatusT.paused:
      return 'outline';
    case MemberStatusT.inactive:
      return 'destructive';
    default:
      return 'secondary';
  }
}

function formatDate(ts: bigint): string {
  try {
    return new Date(Number(ts) / 1_000_000).toLocaleString();
  } catch {
    return '—';
  }
}

// Detail-page specific findings (tier benefits, agreements, notes)
const detailFindings = findingsForSection('Memberships').filter((f) =>
  ['mem-tier-management', 'mem-benefits-display', 'mem-agreements', 'mem-notes-admin'].includes(f.id)
);

export default function MembershipDetail() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: role } = useGetCallerUserRole();
  const isAdmin = role === 'admin';

  const { data: membership, isLoading, isError } = useGetMembershipDetails(id);

  // Determine if current user can edit profile fields (owner or admin)
  const callerPrincipal = identity?.getPrincipal().toString();
  const ownerPrincipal = membership?.profile?.principal?.toString();
  const canEdit = isAdmin || (!!callerPrincipal && callerPrincipal === ownerPrincipal);

  // Profile field editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [profileError, setProfileError] = useState('');

  // Admin status editing state
  const [editingStatus, setEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<MemberStatusT>(MemberStatusT.applicant);

  // Related records editing state
  const [isEditingRelated, setIsEditingRelated] = useState(false);

  const updateProfileMutation = useUpdateMembershipProfileFields();
  const updateStatusMutation = useUpdateMembershipStatus();
  const updateLinksMutation = useUpdateMembershipLinks();

  const {
    memberships: linkableMemberships,
    artists,
    works,
    releases,
    projects,
    isLoading: optionsLoading,
    error: optionsError,
  } = useLinkableEntityOptions();

  // Sync editing state when membership data loads
  useEffect(() => {
    if (membership?.profile) {
      setEditName(membership.profile.name);
      setEditEmail(membership.profile.email);
      setSelectedStatus(membership.profile.status as MemberStatusT);
    }
  }, [membership]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !membership) {
    return (
      <div className="text-center py-16 text-destructive">
        Failed to load membership details.
      </div>
    );
  }

  const profile = membership.profile;

  // Normalize linked IDs
  const safeLinkedArtists = normalizeToArray<string>(membership.linkedArtists);
  const safeLinkedWorks = normalizeToArray<string>(membership.linkedWorks);
  const safeLinkedReleases = normalizeToArray<string>(membership.linkedReleases);
  const safeLinkedProjects = normalizeToArray<string>(membership.linkedProjects);

  const handleSaveProfile = async () => {
    setProfileError('');
    if (!editName.trim() || !editEmail.trim()) {
      setProfileError('Name and email are required.');
      return;
    }
    try {
      await updateProfileMutation.mutateAsync({
        id,
        name: editName.trim(),
        email: editEmail.trim(),
      });
      setEditingProfile(false);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile.');
    }
  };

  const handleSaveStatus = async () => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: selectedStatus });
      setEditingStatus(false);
    } catch {
      // error handled by mutation
    }
  };

  const handleSaveRelated = (data: {
    memberIds: string[];
    artistIds: string[];
    workIds: string[];
    releaseIds: string[];
    projectIds: string[];
  }) => {
    updateLinksMutation.mutate(
      {
        id,
        artistIds: data.artistIds,
        workIds: data.workIds,
        releaseIds: data.releaseIds,
        projectIds: data.projectIds,
      },
      {
        onSuccess: () => setIsEditingRelated(false),
      }
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/portal/memberships' })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{profile.name || 'Unnamed Member'}</h1>
          <p className="text-muted-foreground">Member ID: {profile.id}</p>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Profile</span>
            {canEdit && !editingProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditName(profile.name);
                  setEditEmail(profile.email);
                  setEditingProfile(true);
                }}
              >
                <Pencil className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingProfile ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
              {profileError && (
                <p className="text-sm text-destructive">{profileError}</p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingProfile(false)}
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label className="text-muted-foreground text-xs">Name</Label>
                <p className="text-base font-medium">{profile.name || '—'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Email</Label>
                <p className="text-base">{profile.email || '—'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Tier</Label>
                <p className="text-base">{profile.tier || 'Basic'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Created</Label>
                <p className="text-base">{formatDate(profile.created_at)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Last Updated</Label>
                <p className="text-base">{formatDate(profile.updated_at)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Status</span>
            {isAdmin && !editingStatus && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStatus(profile.status as MemberStatusT);
                  setEditingStatus(true);
                }}
              >
                <Pencil className="h-3 w-3 mr-1" />
                Change
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editingStatus ? (
            <div className="space-y-3">
              <Select
                value={selectedStatus}
                onValueChange={(v) => setSelectedStatus(v as MemberStatusT)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MemberStatusT.applicant}>Applicant</SelectItem>
                  <SelectItem value={MemberStatusT.active}>Active</SelectItem>
                  <SelectItem value={MemberStatusT.paused}>Paused</SelectItem>
                  <SelectItem value={MemberStatusT.inactive}>Inactive</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveStatus}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingStatus(false)}
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Badge variant={statusBadgeVariant(profile.status as MemberStatusT)}>
              {String(profile.status).charAt(0).toUpperCase() + String(profile.status).slice(1)}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Tier & Benefits Placeholder */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Planned Features for This Page
        </p>
        {detailFindings.map((finding) => (
          <SectionPlaceholder
            key={finding.id}
            title={finding.featureDescription}
            description={finding.context ?? finding.featureDescription}
            priority={finding.suggestedPriority}
          />
        ))}
      </div>

      <Separator />

      {/* Related Records */}
      <div className="space-y-4">
        {canEdit && (
          <div className="flex justify-end">
            <EditLinksButton onClick={() => setIsEditingRelated(true)} />
          </div>
        )}
        <RelatedRecordsSection
          linkedArtists={safeLinkedArtists}
          linkedWorks={safeLinkedWorks}
          linkedReleases={safeLinkedReleases}
          linkedProjects={safeLinkedProjects}
        />
      </div>

      <EditRelatedDialog
        open={isEditingRelated}
        onOpenChange={setIsEditingRelated}
        title="Edit Links"
        availableMemberships={linkableMemberships}
        availableArtists={artists}
        availableWorks={works}
        availableReleases={releases}
        availableProjects={projects}
        selectedMemberIds={[]}
        selectedArtistIds={safeLinkedArtists}
        selectedWorkIds={safeLinkedWorks}
        selectedReleaseIds={safeLinkedReleases}
        selectedProjectIds={safeLinkedProjects}
        onSave={handleSaveRelated}
        isSaving={updateLinksMutation.isPending}
        isLoadingOptions={optionsLoading}
        optionsError={optionsError}
      />
    </div>
  );
}
