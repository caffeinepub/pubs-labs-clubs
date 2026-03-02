import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../../hooks/useInternetIdentity';
import {
  useGetAllMembershipProfiles,
  useGetCallerMemberships,
  useGetCallerUserRole,
  useCreateMembershipProfile,
} from '../../../hooks/useQueries';
import { UserRole, MembershipProfile } from '../../../backend';
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
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function statusColor(status: string) {
  switch (status) {
    case 'active': return 'default';
    case 'applicant': return 'secondary';
    case 'paused': return 'outline';
    case 'inactive': return 'destructive';
    default: return 'secondary';
  }
}

function formatDate(ts: bigint) {
  try {
    return new Date(Number(ts) / 1_000_000).toLocaleDateString();
  } catch {
    return '—';
  }
}

export default function MembershipsPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userRole } = useGetCallerUserRole();
  const isAdmin = userRole === UserRole.admin;

  const { data: allProfiles, isLoading: loadingAll } = useGetAllMembershipProfiles();
  const { data: callerMemberships, isLoading: loadingCaller } = useGetCallerMemberships();

  const createMutation = useCreateMembershipProfile();

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const isLoading = isAdmin ? loadingAll : loadingCaller;

  const profiles: MembershipProfile[] = isAdmin
    ? (allProfiles ?? [])
    : (callerMemberships ?? []).map(m => m.profile);

  const handleCreate = async () => {
    if (!newName.trim() || !newEmail.trim()) {
      toast.error('Name and email are required');
      return;
    }
    const id = `member-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    try {
      await createMutation.mutateAsync({ id, name: newName.trim(), email: newEmail.trim() });
      toast.success('Membership profile created');
      setCreateOpen(false);
      setNewName('');
      setNewEmail('');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to create membership');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users size={24} className="text-primary" />
            Memberships
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin ? 'All membership profiles' : 'Your membership profiles'}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-2">
          <Plus size={16} />
          New Membership
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Users size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground font-medium">No memberships yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1 mb-4">Create your first membership profile to get started.</p>
          <Button onClick={() => setCreateOpen(true)} size="sm" variant="outline" className="gap-2">
            <Plus size={14} />
            Create Membership
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
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
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => navigate({ to: `/portal/memberships/${profile.id}` })}
                >
                  <TableCell className="font-medium">{profile.name || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{profile.email || '—'}</TableCell>
                  <TableCell>{profile.tier || 'Basic'}</TableCell>
                  <TableCell>
                    <Badge variant={statusColor(profile.status as string) as any}>
                      {String(profile.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(profile.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Membership Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-name">Name</Label>
              <Input
                id="new-name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="gap-2">
              {createMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
