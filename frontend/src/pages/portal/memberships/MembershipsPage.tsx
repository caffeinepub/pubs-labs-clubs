import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, Users, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  useGetCallerMemberships,
  useGetAllMembershipProfiles,
  useCreateMembershipProfile,
  useIsCallerAdmin,
} from '@/hooks/useQueries';
import type { Membership, MembershipProfile } from '../../../backend';

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active': return 'default';
    case 'applicant': return 'secondary';
    case 'paused': return 'outline';
    case 'inactive': return 'destructive';
    default: return 'secondary';
  }
}

export default function MembershipsPage() {
  const navigate = useNavigate();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: callerMemberships, isLoading: loadingCaller } = useGetCallerMemberships();
  const { data: allProfiles, isLoading: loadingAll } = useGetAllMembershipProfiles();
  const createMembership = useCreateMembershipProfile();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formId, setFormId] = useState('');
  const [formError, setFormError] = useState('');

  const isLoading = isAdmin ? loadingAll : loadingCaller;

  const profiles: MembershipProfile[] = isAdmin
    ? (allProfiles ?? [])
    : (callerMemberships ?? []).map((m: Membership) => m.profile);

  const handleOpenDialog = () => {
    setFormName('');
    setFormEmail('');
    setFormId(`member-${Date.now()}`);
    setFormError('');
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    setFormError('');
    if (!formName.trim()) {
      setFormError('Name is required.');
      return;
    }
    if (!formEmail.trim()) {
      setFormError('Email is required.');
      return;
    }
    if (!formId.trim()) {
      setFormError('Member ID is required.');
      return;
    }

    try {
      await createMembership.mutateAsync({ id: formId.trim(), name: formName.trim(), email: formEmail.trim() });
      toast.success('Membership created successfully!');
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create membership.';
      setFormError(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Memberships</h1>
            <p className="text-sm text-muted-foreground">
              {isAdmin ? 'All membership profiles' : 'Your membership profiles'}
            </p>
          </div>
        </div>
        <Button onClick={handleOpenDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          New Membership
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground text-lg font-medium">No memberships yet</p>
          <p className="text-muted-foreground/60 text-sm mt-1">Create your first membership to get started.</p>
          <Button onClick={handleOpenDialog} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            New Membership
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow
                  key={profile.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate({ to: `/portal/memberships/${profile.id}` })}
                >
                  <TableCell className="font-medium">{profile.name}</TableCell>
                  <TableCell className="text-muted-foreground">{profile.email}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(profile.status as string)}>
                      {profile.status as string}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{profile.tier}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{profile.id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Membership</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new membership profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="member-id">Member ID</Label>
              <Input
                id="member-id"
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                placeholder="e.g. member-001"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="member-name">Name <span className="text-destructive">*</span></Label>
              <Input
                id="member-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="member-email">Email <span className="text-destructive">*</span></Label>
              <Input
                id="member-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={createMembership.isPending}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMembership.isPending}>
              {createMembership.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Membership
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
