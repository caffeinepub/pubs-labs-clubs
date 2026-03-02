import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  useGetAllArtistDevelopment,
  useGetCallerUserRole,
  useGetEntitiesForCaller,
  useCreateArtistDevelopment,
} from '../../../hooks/useQueries';
import { UserRole, ArtistDevelopment } from '../../../backend';
import { Button } from '@/components/ui/button';
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
import { Plus, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function formatDate(ts: bigint) {
  try {
    return new Date(Number(ts) / 1_000_000).toLocaleDateString();
  } catch {
    return '—';
  }
}

export default function ArtistDevelopmentPage() {
  const navigate = useNavigate();
  const { data: userRole } = useGetCallerUserRole();
  const isAdmin = userRole === UserRole.admin;

  const { data: allEntries, isLoading: loadingAll } = useGetAllArtistDevelopment();
  const { data: callerEntities, isLoading: loadingCaller } = useGetEntitiesForCaller();

  const createMutation = useCreateArtistDevelopment();

  const [createOpen, setCreateOpen] = useState(false);
  const [newArtistId, setNewArtistId] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const isLoading = isAdmin ? loadingAll : loadingCaller;

  const entries: ArtistDevelopment[] = isAdmin
    ? (allEntries ?? [])
    : (callerEntities?.artistDevelopment ?? []);

  const handleCreate = async () => {
    if (!newArtistId.trim()) {
      toast.error('Artist ID is required');
      return;
    }
    try {
      await createMutation.mutateAsync({
        artistId: newArtistId.trim(),
        goals: [],
        plans: [],
        milestones: [],
        internalNotes: newNotes.trim(),
      });
      toast.success('Artist development entry created');
      setCreateOpen(false);
      setNewArtistId('');
      setNewNotes('');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to create artist development entry');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp size={24} className="text-primary" />
            Artist Development
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin ? 'All artist development entries' : 'Your artist development entries'}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-2">
          <Plus size={16} />
          New Entry
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <TrendingUp size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground font-medium">No artist development entries yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1 mb-4">Create your first entry to get started.</p>
          <Button onClick={() => setCreateOpen(true)} size="sm" variant="outline" className="gap-2">
            <Plus size={14} />
            Create Entry
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artist ID</TableHead>
                <TableHead>Goals</TableHead>
                <TableHead>Milestones</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow
                  key={entry.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => navigate({ to: `/portal/artists/${entry.id}` })}
                >
                  <TableCell className="font-medium">{entry.artistId || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {Array.isArray(entry.goals) ? entry.goals.length : 0}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {Array.isArray(entry.milestones) ? entry.milestones.length : 0}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(entry.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Artist Development Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="artist-id">Artist ID</Label>
              <Input
                id="artist-id"
                value={newArtistId}
                onChange={e => setNewArtistId(e.target.value)}
                placeholder="Artist name or identifier"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="artist-notes">Internal Notes</Label>
              <Input
                id="artist-notes"
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                placeholder="Optional internal notes"
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
