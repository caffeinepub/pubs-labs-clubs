import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Edit2, Save, X, Loader2, AlertCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetMembershipDetails,
  useUpdateMembership,
  useUpdateMembershipStatus,
  useUpdateMembershipLinks,
  useIsCallerAdmin,
} from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { canEditMembership } from '@/components/related/relatedRecordsPermissions';
import RelatedRecordsSection from '@/components/related/RelatedRecordsSection';
import EditLinksButton from '@/components/related/EditLinksButton';
import EditRelatedDialog from '@/components/related/EditRelatedDialog';
import { useLinkableEntityOptions } from '@/hooks/useLinkableEntityOptions';
import { normalizeToArray } from '@/utils/arrays';
import { T as MemberStatusT } from '../../../backend';
import ChangeHistoryPanel from '@/components/history/ChangeHistoryPanel';

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active': return 'default';
    case 'applicant': return 'secondary';
    case 'paused': return 'outline';
    case 'inactive': return 'destructive';
    default: return 'secondary';
  }
}

export default function MembershipDetail() {
  const { id } = useParams({ from: '/portal/memberships/$id' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();

  const { data: membership, isLoading, error } = useGetMembershipDetails(id);
  const updateMembership = useUpdateMembership();
  const updateStatus = useUpdateMembershipStatus();
  const updateLinks = useUpdateMembershipLinks();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState<MemberStatusT>(MemberStatusT.applicant);
  const [editError, setEditError] = useState('');

  const [linksDialogOpen, setLinksDialogOpen] = useState(false);
  const {
    artists,
    works,
    releases,
    projects,
    isLoading: optionsLoading,
    error: optionsError,
  } = useLinkableEntityOptions();

  // canEditMembership(identity, isAdmin, membershipPrincipal)
  const canEdit = membership
    ? canEditMembership(identity, isAdmin ?? false, membership.profile.principal)
    : false;

  const handleStartEdit = () => {
    if (!membership) return;
    setEditName(membership.profile.name);
    setEditEmail(membership.profile.email);
    setEditStatus(membership.profile.status as MemberStatusT);
    setEditError('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditError('');
  };

  const handleSaveEdit = async () => {
    setEditError('');
    if (!editName.trim()) {
      setEditError('Name is required.');
      return;
    }
    if (!editEmail.trim()) {
      setEditError('Email is required.');
      return;
    }
    try {
      await updateMembership.mutateAsync({
        id,
        name: editName.trim(),
        email: editEmail.trim(),
        status: editStatus,
      });
      toast.success('Membership updated successfully!');
      setIsEditing(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update membership.';
      setEditError(msg);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!isAdmin) return;
    try {
      await updateStatus.mutateAsync({ id, status: newStatus as MemberStatusT });
      toast.success('Status updated successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status.';
      toast.error(msg);
    }
  };

  const handleSaveLinks = (selected: {
    memberIds: string[];
    artistIds: string[];
    workIds: string[];
    releaseIds: string[];
    projectIds: string[];
  }) => {
    updateLinks.mutate(
      {
        id,
        artistIds: selected.artistIds,
        workIds: selected.workIds,
        releaseIds: selected.releaseIds,
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !membership) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate({ to: '/portal/memberships' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Membership not found.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const profile = membership.profile;
  const safeLinkedArtists = normalizeToArray<string>(membership.linkedArtists);
  const safeLinkedWorks = normalizeToArray<string>(membership.linkedWorks);
  const safeLinkedReleases = normalizeToArray<string>(membership.linkedReleases);
  const safeLinkedProjects = normalizeToArray<string>(membership.linkedProjects);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/portal/memberships' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Memberships
        </Button>
        <div className="flex gap-2">
          {canEdit && !isEditing && (
            <Button variant="outline" onClick={handleStartEdit} className="gap-2">
              <Edit2 className="h-4 w-4" /> Edit Profile
            </Button>
          )}
          <EditLinksButton onClick={() => setLinksDialogOpen(true)} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{profile.name}</CardTitle>
              <p className="text-muted-foreground text-sm mt-1">{profile.email}</p>
            </div>
            <Badge variant={statusVariant(profile.status as string)}>
              {profile.status as string}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4 border border-border rounded-lg p-4 bg-muted/20">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Edit Profile</h3>
              {editError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{editError}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-name">Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-email">Email <span className="text-destructive">*</span></Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>
                {isAdmin && (
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-status">
                      Status <span className="text-xs text-muted-foreground">(Admin only)</span>
                    </Label>
                    <Select value={editStatus as string} onValueChange={(v) => setEditStatus(v as MemberStatusT)}>
                      <SelectTrigger id="edit-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="applicant">Applicant</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveEdit} disabled={updateMembership.isPending} className="gap-2">
                  {updateMembership.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancelEdit} disabled={updateMembership.isPending} className="gap-2">
                  <X className="h-4 w-4" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Member ID</p>
                <p className="font-mono text-sm mt-0.5">{profile.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Tier</p>
                <p className="text-sm mt-0.5">{profile.tier}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Notes</p>
                <p className="text-sm mt-0.5">{profile.notes || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Agreements</p>
                <p className="text-sm mt-0.5">
                  {normalizeToArray<string>(profile.agreements).length > 0
                    ? normalizeToArray<string>(profile.agreements).join(', ')
                    : '—'}
                </p>
              </div>
            </div>
          )}

          {isAdmin && !isEditing && (
            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Admin: Change Status</span>
              </div>
              <div className="flex items-center gap-3">
                <Select
                  value={profile.status as string}
                  onValueChange={handleStatusChange}
                  disabled={updateStatus.isPending}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applicant">Applicant</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {updateStatus.isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <RelatedRecordsSection
        linkedArtists={safeLinkedArtists}
        linkedWorks={safeLinkedWorks}
        linkedReleases={safeLinkedReleases}
        linkedProjects={safeLinkedProjects}
      />

      <ChangeHistoryPanel recordId={id} />

      <EditRelatedDialog
        open={linksDialogOpen}
        onOpenChange={setLinksDialogOpen}
        title="Edit Links"
        availableArtists={artists}
        availableWorks={works}
        availableReleases={releases}
        availableProjects={projects}
        selectedArtistIds={safeLinkedArtists}
        selectedWorkIds={safeLinkedWorks}
        selectedReleaseIds={safeLinkedReleases}
        selectedProjectIds={safeLinkedProjects}
        onSave={handleSaveLinks}
        isSaving={updateLinks.isPending}
        isLoadingOptions={optionsLoading}
        optionsError={optionsError as Error | null}
      />
    </div>
  );
}
