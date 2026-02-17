import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllMembershipProfiles, useCreateMembershipProfile } from '../../../hooks/useQueries';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus } from 'lucide-react';
import EmptyState from '../../../components/feedback/EmptyState';
import LoadingState from '../../../components/feedback/LoadingState';
import { T as MemberStatus } from '../../../backend';

export default function MembershipsPage() {
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();
  const { data: memberships = [], isLoading } = useGetAllMembershipProfiles();
  const createMutation = useCreateMembershipProfile();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', email: '' });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData, {
      onSuccess: () => {
        setDialogOpen(false);
        setFormData({ id: '', name: '', email: '' });
      }
    });
  };

  const getStatusColor = (status: MemberStatus) => {
    switch (status) {
      case MemberStatus.active: return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case MemberStatus.applicant: return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case MemberStatus.paused: return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case MemberStatus.inactive: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
      default: return '';
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Memberships</h1>
          <p className="text-muted-foreground">Manage co-op member profiles and status</p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Membership
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Membership Profile</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="id">Membership ID *</Label>
                  <Input
                    id="id"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="MEMBER-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Member name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="member@example.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Membership'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {memberships.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No memberships yet"
          description="Create the first membership profile to get started with co-op member management."
          actionLabel={isAdmin ? "Create Membership" : undefined}
          onAction={isAdmin ? () => setDialogOpen(true) : undefined}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {memberships.map((membership) => (
            <Card 
              key={membership.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate({ to: '/portal/memberships/$id', params: { id: membership.id } })}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{membership.name}</span>
                  <Badge className={getStatusColor(membership.status)}>
                    {membership.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">{membership.email}</p>
                  <p className="text-xs text-muted-foreground">Tier: {membership.tier}</p>
                  <p className="text-xs text-muted-foreground">ID: {membership.id}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
