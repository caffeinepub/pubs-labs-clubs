import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  useGetAllReleases,
  useGetCallerUserRole,
  useGetEntitiesForCaller,
  useCreateRelease,
} from '../../../hooks/useQueries';
import { UserRole, Release } from '../../../backend';
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
import { Plus, Disc, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function formatDate(ts: bigint) {
  try {
    return new Date(Number(ts) / 1_000_000).toLocaleDateString();
  } catch {
    return '—';
  }
}

export default function ReleasesPage() {
  const navigate = useNavigate();
  const { data: userRole } = useGetCallerUserRole();
  const isAdmin = userRole === UserRole.admin;

  const { data: allReleases, isLoading: loadingAll } = useGetAllReleases();
  const { data: callerEntities, isLoading: loadingCaller } = useGetEntitiesForCaller();

  const createMutation = useCreateRelease();

  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Single');

  const isLoading = isAdmin ? loadingAll : loadingCaller;

  const releases: Release[] = isAdmin
    ? (allReleases ?? [])
    : (callerEntities?.releases ?? []);

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    try {
      await createMutation.mutateAsync({
        title: newTitle.trim(),
        releaseType: newType,
        tracklist: [],
        keyDates: [],
        owners: [],
      });
      toast.success('Release created');
      setCreateOpen(false);
      setNewTitle('');
      setNewType('Single');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to create release');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Disc size={24} className="text-primary" />
            Releases
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin ? 'All releases' : 'Your releases'}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-2">
          <Plus size={16} />
          New Release
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : releases.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Disc size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground font-medium">No releases yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1 mb-4">Create your first release to get started.</p>
          <Button onClick={() => setCreateOpen(true)} size="sm" variant="outline" className="gap-2">
            <Plus size={14} />
            Create Release
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tracks</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {releases.map((release) => (
                <TableRow
                  key={release.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => navigate({ to: `/portal/releases/${release.id}` })}
                >
                  <TableCell className="font-medium">{release.title || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{release.releaseType || '—'}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {Array.isArray(release.tracklist) ? release.tracklist.length : 0}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(release.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Release</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="release-title">Title</Label>
              <Input
                id="release-title"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Release title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="release-type">Release Type</Label>
              <Input
                id="release-type"
                value={newType}
                onChange={e => setNewType(e.target.value)}
                placeholder="e.g. Single, EP, Album"
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
