import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { 
  useGetMembershipDetails, 
  useUpdateMembershipProfile,
  useLinkMembershipToEntities
} from '../../../hooks/useQueries';
import { useLinkableEntityOptions } from '../../../hooks/useLinkableEntityOptions';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { useInternetIdentity } from '../../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import LoadingState from '../../../components/feedback/LoadingState';
import ErrorBanner from '../../../components/feedback/ErrorBanner';
import RelatedRecordsSection from '../../../components/related/RelatedRecordsSection';
import EditRelatedDialog from '../../../components/related/EditRelatedDialog';
import EditLinksButton from '../../../components/related/EditLinksButton';
import { canEditMembership } from '../../../components/related/relatedRecordsPermissions';
import { T as MemberStatus } from '../../../backend';
import { normalizeToArray } from '../../../utils/arrays';

export default function MembershipDetail() {
  const { id } = useParams({ from: '/portal/memberships/$id' });
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();
  const { identity } = useInternetIdentity();
  const { data: membership, isLoading, error } = useGetMembershipDetails(id);
  const updateMutation = useUpdateMembershipProfile();
  const linkMutation = useLinkMembershipToEntities();

  const [formData, setFormData] = useState({
    name: membership?.profile.name || '',
    email: membership?.profile.email || '',
    status: membership?.profile.status || MemberStatus.applicant
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingRelated, setIsEditingRelated] = useState(false);

  // Fetch linkable entity options using the role-aware hook
  const { 
    artists, 
    works, 
    releases, 
    projects, 
    isLoading: optionsLoading, 
    error: optionsError 
  } = useLinkableEntityOptions();

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorBanner message={(error as Error).message} />;
  }

  if (!membership) {
    return <ErrorBanner message="Membership not found" />;
  }

  const canEdit = canEditMembership(identity, isAdmin, membership.profile.principal);

  // Normalize all array-valued fields to handle upgrade-time undefined/null values
  const safeAgreements = normalizeToArray<string>(membership.profile.agreements);
  const safeTierBenefits = normalizeToArray<string>(membership.tier?.benefits);
  const safeLinkedArtists = normalizeToArray<string>(membership.linkedArtists);
  const safeLinkedWorks = normalizeToArray<string>(membership.linkedWorks);
  const safeLinkedReleases = normalizeToArray<string>(membership.linkedReleases);
  const safeLinkedProjects = normalizeToArray<string>(membership.linkedProjects);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(
      { id, ...formData },
      {
        onSuccess: () => {
          setIsEditing(false);
        }
      }
    );
  };

  const handleSaveRelated = (data: {
    memberIds: string[];
    artistIds: string[];
    workIds: string[];
    releaseIds: string[];
    projectIds: string[];
  }) => {
    linkMutation.mutate(
      {
        memberId: id,
        artistIds: data.artistIds,
        workIds: data.workIds,
        releaseIds: data.releaseIds,
        projectIds: data.projectIds
      },
      {
        onSuccess: () => {
          setIsEditingRelated(false);
        }
      }
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/portal/memberships' })}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{membership.profile.name}</h1>
          <p className="text-muted-foreground">Membership ID: {membership.profile.id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Profile Details</span>
            {isAdmin && !isEditing && (
              <Button onClick={() => {
                setFormData({
                  name: membership.profile.name,
                  email: membership.profile.email,
                  status: membership.profile.status
                });
                setIsEditing(true);
              }}>
                Edit
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as MemberStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={MemberStatus.applicant}>Applicant</SelectItem>
                    <SelectItem value={MemberStatus.active}>Active</SelectItem>
                    <SelectItem value={MemberStatus.paused}>Paused</SelectItem>
                    <SelectItem value={MemberStatus.inactive}>Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="text-lg">{membership.profile.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="text-lg">{membership.profile.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <p className="text-lg capitalize">{membership.profile.status}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Tier</Label>
                <p className="text-lg">{membership.profile.tier}</p>
              </div>
              {safeTierBenefits.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Benefits</Label>
                  <ul className="list-disc list-inside text-lg">
                    {safeTierBenefits.map((benefit, idx) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}
              {safeAgreements.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Agreements</Label>
                  <ul className="list-disc list-inside text-lg">
                    {safeAgreements.map((agreement, idx) => (
                      <li key={idx}>{agreement}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p className="text-lg">
                  {new Date(Number(membership.profile.created_at) / 1000000).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
        availableArtists={artists}
        availableWorks={works}
        availableReleases={releases}
        availableProjects={projects}
        selectedArtistIds={safeLinkedArtists}
        selectedWorkIds={safeLinkedWorks}
        selectedReleaseIds={safeLinkedReleases}
        selectedProjectIds={safeLinkedProjects}
        onSave={handleSaveRelated}
        isSaving={linkMutation.isPending}
        isLoadingOptions={optionsLoading}
        optionsError={optionsError}
      />
    </div>
  );
}
