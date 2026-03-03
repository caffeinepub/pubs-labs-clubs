import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  useGetAllArtistDevelopment,
  useGetCallerUserRole,
  useGetEntitiesForCaller,
  useCreateArtistDevelopment,
  useBulkDeleteArtistDevelopment,
} from '../../../hooks/useQueries';
import { UserRole, ArtistDevelopment } from '../../../backend';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Plus, TrendingUp, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import BulkDeleteConfirmDialog from '@/components/bulk/BulkDeleteConfirmDialog';

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
  const bulkDelete = useBulkDeleteArtistDevelopment();

  const [createOpen, setCreateOpen] = useState(false);
  const [newArtistId, setNewArtistId] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isLoading = isAdmin ? loadingAll : loadingCaller;

  const entries: ArtistDevelopment[] = isAdmin
    ? (allEntries ?? [])
    : (callerEntities?.artistDevelopment ?? []);

  const allSelected = entries.length > 0 && selectedIds.size === entries.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < entries.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(entries.map((e) => e.id)));
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    try {
      const result = await bulkDelete.mutateAsync(Array.from(selectedIds));
      const deletedCount = result.deleted.length;
      const failedCount = result.failed.length;
      if (deletedCount > 0) {
        toast.success(`Successfully deleted ${deletedCount} artist development entr${deletedCount !== 1 ? 'ies' : 'y'}.`);
      }
      if (failedCount > 0) {
        toast.error(`${failedCount} entr${failedCount !== 1 ? 'ies' : 'y'} could not be deleted.`);
      }
      setSelectedIds(new Set());
      setConfirmOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bulk delete failed.';
      toast.error(msg);
    }
  };

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
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 size={14} />
              Delete {selectedIds.size} Selected
            </Button>
          )}
          <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-2">
            <Plus size={16} />
            New Entry
          </Button>
        </div>
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
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    data-state={someSelected ? 'indeterminate' : allSelected ? 'checked' : 'unchecked'}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all artist development entries"
                    className={someSelected ? 'opacity-70' : ''}
                  />
                </TableHead>
                <TableHead>Artist ID</TableHead>
                <TableHead>Goals</TableHead>
                <TableHead>Milestones</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => {
                const isSelected = selectedIds.has(entry.id);
                return (
                  <TableRow
                    key={entry.id}
                    className={`cursor-pointer hover:bg-accent/50 transition-colors ${isSelected ? 'bg-muted/30' : ''}`}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest('[role="checkbox"]') || target.closest('button')) return;
                      navigate({ to: `/portal/artists/${entry.id}` });
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectRow(entry.id, !!checked)}
                        aria-label={`Select ${entry.artistId}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{entry.artistId || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {Array.isArray(entry.goals) ? entry.goals.length : 0}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {Array.isArray(entry.milestones) ? entry.milestones.length : 0}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(entry.created_at)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <BulkDeleteConfirmDialog
        open={confirmOpen}
        count={selectedIds.size}
        entityType="artist development entry"
        entityTypePlural="artist development entries"
        isPending={bulkDelete.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleBulkDelete}
      />

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
