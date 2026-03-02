import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { PlusCircle, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import {
  useGetAllMembershipProfiles,
  useGetCallerMemberships,
  useCreateMembershipProfile,
} from '@/hooks/useQueries';
import { useGetCallerUserRole } from '@/hooks/useQueries';
import type { MembershipProfile, T as MemberStatusT } from '../../../backend';

function statusBadgeVariant(status: MemberStatusT): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active': return 'default';
    case 'applicant': return 'secondary';
    case 'paused': return 'outline';
    case 'inactive': return 'destructive';
    default: return 'secondary';
  }
}

function statusLabel(status: MemberStatusT): string {
  switch (status) {
    case 'active': return 'Active';
    case 'applicant': return 'Applicant';
    case 'paused': return 'Paused';
    case 'inactive': return 'Inactive';
    default: return String(status);
  }
}

function formatDate(ts: bigint): string {
  try {
    return new Date(Number(ts) / 1_000_000).toLocaleDateString();
  } catch {
    return '—';
  }
}

export default function MembershipsPage() {
  const navigate = useNavigate();
  const { data: role } = useGetCallerUserRole();
  const isAdmin = role === 'admin';

  // Admins see all profiles; regular users see their own memberships
  const adminQuery = useGetAllMembershipProfiles();
  const callerQuery = useGetCallerMemberships();

  const isLoading = isAdmin ? adminQuery.isLoading : callerQuery.isLoading;
  const isError = isAdmin ? adminQuery.isError : callerQuery.isError;

  // Normalize to MembershipProfile[]
  const profiles: MembershipProfile[] = isAdmin
    ? (adminQuery.data ?? [])
    : (callerQuery.data ?? []).map((m) => m.profile);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [formError, setFormError] = useState('');

  const createMutation = useCreateMembershipProfile();

  const handleCreate = async () => {
    setFormError('');
    if (!newId.trim() || !newName.trim() || !newEmail.trim()) {
      setFormError('All fields are required.');
      return;
    }
    try {
      await createMutation.mutateAsync({ id: newId.trim(), name: newName.trim(), email: newEmail.trim() });
      setDialogOpen(false);
      setNewId('');
      setNewName('');
      setNewEmail('');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create membership.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Memberships</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin ? 'Manage all member profiles and statuses.' : 'View and manage your membership.'}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          New Membership
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-10 text-center text-destructive">
            Failed to load memberships. Please try again.
          </CardContent>
        </Card>
      ) : profiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Users className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">No Memberships Found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Get started by creating your first membership.
              </p>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Create Membership
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow
                    key={profile.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate({ to: `/portal/memberships/${profile.id}` })}
                  >
                    <TableCell className="font-medium">{profile.name || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{profile.email || '—'}</TableCell>
                    <TableCell>{profile.tier || 'Basic'}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(profile.status)}>
                        {statusLabel(profile.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(profile.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Membership</DialogTitle>
            <DialogDescription>
              Enter a unique ID, name, and email for the new member.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="member-id">Member ID</Label>
              <Input
                id="member-id"
                placeholder="e.g. member-001"
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="member-name">Full Name</Label>
              <Input
                id="member-name"
                placeholder="Jane Smith"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="member-email">Email</Label>
              <Input
                id="member-email"
                type="email"
                placeholder="jane@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
