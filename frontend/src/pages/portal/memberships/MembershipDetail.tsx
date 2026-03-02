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

  // Status editing state (admin only)
  const [editingStatus, setEditingStatus] = useState(false);
  const [editStatus, setEditStatus] = useState<MemberStatusT>(MemberStatusT.applicant);
  const [statusError, setStatusError] = useState('');

  // Edit links dialog
  const [editLinksOpen, setEditLinksOpen] = useState(false);

  const updateProfileMutation = useUpdateMembershipProfileFields();
  const updateStatusMutation = useUpdateMembershipStatus();
  const updateLinksMutation = useUpdateMembershipLinks();

  // Linkable entity options for the Edit Links dialog
  const {
    artists: availableArtists,
    works: availableWorks,
    releases: availableReleases,
    projects: availableProjects,
    isLoading: optionsLoading,
    error: optionsError,
  } = useLinkableEntityOptions();

  // Sync edit fields when membership loads
  useEffect(() => {
    if (membership?.profile) {
      setEditName(membership.profile.name ?? '');
      setEditEmail(membership.profile.email ?? '');
      setEditStatus(membership.profile.status ?? MemberStatusT.applicant);
    }
  }, [membership]);

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
    setStatusError('');
    try {
      await updateStatusMutation.mutateAsync({ id, status: editStatus });
      setEditingStatus(false);
    } catch (err: unknown) {
      setStatusError(err instanceof Error ? err.message : 'Failed to update status.');
    }
  };

  const handleSaveLinks = async (selected: {
    memberIds: string[];
    artistIds: string[];
    workIds: string[];
    releaseIds: string[];
    projectIds: string[];
  }) => {
    await updateLinksMutation.mutateAsync({
      id,
      artistIds: selected.artistIds,
      workIds: selected.workIds,
      releaseIds: selected.releaseIds,
      projectIds: selected.projectIds,
    });
    setEditLinksOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !membership) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/portal/memberships' })}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Memberships
        </Button>
        <Card>
          <CardContent className="py-10 text-center text-destructive">
            Membership not found or you do not have permission to view it.
          </CardContent>
        </Card>
      </div>
    );
  }

  const profile = membership.profile;
  const tier = membership.tier;
  const linkedArtists = normalizeToArray<string>(membership.linkedArtists);
  const linkedWorks = normalizeToArray<string>(membership.linkedWorks);
  const linkedReleases = normalizeToArray<string>(membership.linkedReleases);
  const linkedProjects = normalizeToArray<string>(membership.linkedProjects);

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/portal/memberships' })}
        className="gap-2 -ml-2"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Memberships
      </Button>

      {/* Profile Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{profile.name || 'Unnamed Member'}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">ID: {profile.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusBadgeVariant(profile.status)}>{profile.status}</Badge>
            {canEdit && !editingProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditName(profile.name ?? '');
                  setEditEmail(profile.email ?? '');
                  setEditingProfile(true);
                }}
                className="gap-1"
              >
                <Pencil className="h-3 w-3" /> Edit
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {editingProfile ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Full Name</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>
              </div>
              {profileError && <p className="text-sm text-destructive">{profileError}</p>}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  className="gap-1"
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingProfile(false)}
                  className="gap-1"
                >
                  <X className="h-3 w-3" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Name</p>
                <p className="font-medium">{profile.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Email</p>
                <p className="font-medium">{profile.email || '—'}</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Tier info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Tier</p>
              <p className="font-medium">{tier?.name || profile.tier || 'Basic'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Tier Fee</p>
              <p className="font-medium">
                {tier?.fee !== undefined ? String(tier.fee) : '—'}
              </p>
            </div>
          </div>

          {tier?.description && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Tier Description
              </p>
              <p className="text-sm">{tier.description}</p>
            </div>
          )}

          {normalizeToArray<string>(tier?.benefits).length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Benefits</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {normalizeToArray<string>(tier?.benefits).map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}

          <Separator />

          {/* Status section */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Status</p>
              {editingStatus ? (
                <div className="flex items-center gap-2 mt-1">
                  <Select
                    value={editStatus}
                    onValueChange={(v) => setEditStatus(v as MemberStatusT)}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={MemberStatusT.applicant}>Applicant</SelectItem>
                      <SelectItem value={MemberStatusT.active}>Active</SelectItem>
                      <SelectItem value={MemberStatusT.paused}>Paused</SelectItem>
                      <SelectItem value={MemberStatusT.inactive}>Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={handleSaveStatus}
                    disabled={updateStatusMutation.isPending}
                    className="gap-1"
                  >
                    {updateStatusMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingStatus(false)}
                    className="gap-1"
                  >
                    <X className="h-3 w-3" /> Cancel
                  </Button>
                </div>
              ) : (
                <Badge variant={statusBadgeVariant(profile.status)}>{profile.status}</Badge>
              )}
              {statusError && <p className="text-sm text-destructive mt-1">{statusError}</p>}
            </div>
            {isAdmin && !editingStatus && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditStatus(profile.status);
                  setEditingStatus(true);
                }}
                className="gap-1"
              >
                <Pencil className="h-3 w-3" /> Change Status
              </Button>
            )}
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">Created: </span>
              {formatDate(profile.created_at)}
            </div>
            <div>
              <span className="font-medium text-foreground">Updated: </span>
              {formatDate(profile.updated_at)}
            </div>
          </div>

          {profile.notes && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm">{profile.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Related Records */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Related Records</CardTitle>
          {canEdit && <EditLinksButton onClick={() => setEditLinksOpen(true)} />}
        </CardHeader>
        <CardContent>
          <RelatedRecordsSection
            linkedMembers={[]}
            linkedArtists={linkedArtists}
            linkedWorks={linkedWorks}
            linkedReleases={linkedReleases}
            linkedProjects={linkedProjects}
          />
        </CardContent>
      </Card>

      {/* Edit Links Dialog */}
      <EditRelatedDialog
        open={editLinksOpen}
        onOpenChange={setEditLinksOpen}
        title="Edit Linked Records"
        availableArtists={availableArtists}
        availableWorks={availableWorks}
        availableReleases={availableReleases}
        availableProjects={availableProjects}
        selectedArtistIds={linkedArtists}
        selectedWorkIds={linkedWorks}
        selectedReleaseIds={linkedReleases}
        selectedProjectIds={linkedProjects}
        onSave={handleSaveLinks}
        isSaving={updateLinksMutation.isPending}
        isLoadingOptions={optionsLoading}
        optionsError={optionsError}
      />
    </div>
  );
}
