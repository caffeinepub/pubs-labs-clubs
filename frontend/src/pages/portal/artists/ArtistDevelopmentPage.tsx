import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Copy, Loader2, Plus, Trash2, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useGetAllArtistDevelopment,
  useGetEntitiesForCaller,
  useCreateArtistDevelopment,
  useIsCallerAdmin,
  useBulkDeleteArtistDevelopment,
  useDuplicateArtistDevelopment,
} from '@/hooks/useQueries';
import type { ArtistDevelopment } from '../../../types/entities';
import BulkDeleteConfirmDialog from '@/components/bulk/BulkDeleteConfirmDialog';
import { useTableSort } from '@/hooks/useTableSort';
import SortableTableHeader from '@/components/table/SortableTableHeader';

export default function ArtistDevelopmentPage() {
  const navigate = useNavigate();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: allEntries, isLoading: loadingAll } = useGetAllArtistDevelopment();
  const { data: callerEntities, isLoading: loadingCaller } = useGetEntitiesForCaller();
  const createEntry = useCreateArtistDevelopment();
  const bulkDelete = useBulkDeleteArtistDevelopment();
  const duplicate = useDuplicateArtistDevelopment();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formArtistId, setFormArtistId] = useState('');
  const [formGoals, setFormGoals] = useState('');
  const [formPlans, setFormPlans] = useState('');
  const [formMilestones, setFormMilestones] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const isLoading = isAdmin ? loadingAll : loadingCaller;
  const entries: ArtistDevelopment[] = isAdmin
    ? (allEntries ?? [])
    : (callerEntities?.artistDevelopment ?? []);

  const { sortBy, sortDirection, handleSort, sortedData: sortedEntries } = useTableSort(entries);

  const allSelected = sortedEntries.length > 0 && selectedIds.size === sortedEntries.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < sortedEntries.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedEntries.map((e) => e.id)));
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
        toast.error(`${failedCount} artist development entr${failedCount !== 1 ? 'ies' : 'y'} could not be deleted.`);
      }
      setSelectedIds(new Set());
      setConfirmOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bulk delete failed.';
      toast.error(msg);
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDuplicatingId(id);
    try {
      await duplicate.mutateAsync(id);
      toast.success('Artist development entry duplicated successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to duplicate artist development entry.';
      toast.error(msg);
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleOpenDialog = () => {
    setFormArtistId('');
    setFormGoals('');
    setFormPlans('');
    setFormMilestones('');
    setFormNotes('');
    setFormError('');
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    setFormError('');
    if (!formArtistId.trim()) {
      setFormError('Artist ID is required.');
      return;
    }

    const goals = formGoals.split('\n').map((g) => g.trim()).filter(Boolean);
    const plans = formPlans.split('\n').map((p) => p.trim()).filter(Boolean);
    const milestones = formMilestones.split('\n').map((m) => m.trim()).filter(Boolean);

    try {
      await createEntry.mutateAsync({
        artistId: formArtistId.trim(),
        goals,
        plans,
        milestones,
        internalNotes: formNotes.trim(),
      });
      toast.success('Artist development entry created successfully!');
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create artist development entry.';
      setFormError(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Artist Development</h1>
            <p className="text-sm text-muted-foreground">
              {isAdmin ? 'All artist development entries' : 'Your artist development entries'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete {selectedIds.size} Selected
            </Button>
          )}
          <Button onClick={handleOpenDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : sortedEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground text-lg font-medium">No artist development entries yet</p>
          <p className="text-muted-foreground/60 text-sm mt-1">Create your first entry to get started.</p>
          <Button onClick={handleOpenDialog} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all entries"
                  />
                </TableHead>
                <SortableTableHeader
                  label="Artist ID"
                  sortKey="artistId"
                  currentSortBy={sortBy}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortableTableHeader
                  label="Goals"
                  sortKey="goals"
                  currentSortBy={sortBy}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortableTableHeader
                  label="Plans"
                  sortKey="plans"
                  currentSortBy={sortBy}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortableTableHeader
                  label="Milestones"
                  sortKey="milestones"
                  currentSortBy={sortBy}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortableTableHeader
                  label="Created"
                  sortKey="created_at"
                  currentSortBy={sortBy}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEntries.map((entry) => {
                const isSelected = selectedIds.has(entry.id);
                return (
                  <TableRow
                    key={entry.id}
                    className={`cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-muted/30' : ''}`}
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
                    <TableCell className="font-medium">{entry.artistId}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.goals.length > 0
                        ? entry.goals.slice(0, 2).join(', ') +
                          (entry.goals.length > 2 ? ` +${entry.goals.length - 2} more` : '')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.plans.length > 0
                        ? entry.plans.slice(0, 2).join(', ') +
                          (entry.plans.length > 2 ? ` +${entry.plans.length - 2} more` : '')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.milestones.length > 0
                        ? entry.milestones.slice(0, 2).join(', ') +
                          (entry.milestones.length > 2 ? ` +${entry.milestones.length - 2} more` : '')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(Number(entry.created_at) / 1_000_000).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDuplicate(entry.id, e)}
                        disabled={duplicatingId === entry.id}
                        title="Duplicate entry"
                      >
                        {duplicatingId === entry.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="ml-1 hidden sm:inline">Duplicate</span>
                      </Button>
                    </TableCell>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Artist Development Entry</DialogTitle>
            <DialogDescription>
              Add a new artist development plan and goals.
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
              <Label htmlFor="artist-id">Artist ID <span className="text-destructive">*</span></Label>
              <Input
                id="artist-id"
                value={formArtistId}
                onChange={(e) => setFormArtistId(e.target.value)}
                placeholder="Artist identifier"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="artist-goals">Goals (one per line)</Label>
              <Textarea
                id="artist-goals"
                value={formGoals}
                onChange={(e) => setFormGoals(e.target.value)}
                placeholder="Development goals, one per line"
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="artist-plans">Plans (one per line)</Label>
              <Textarea
                id="artist-plans"
                value={formPlans}
                onChange={(e) => setFormPlans(e.target.value)}
                placeholder="Action plans, one per line"
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="artist-milestones">Milestones (one per line)</Label>
              <Textarea
                id="artist-milestones"
                value={formMilestones}
                onChange={(e) => setFormMilestones(e.target.value)}
                placeholder="Key milestones, one per line"
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="artist-notes">Internal Notes</Label>
              <Textarea
                id="artist-notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Internal notes..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={createEntry.isPending}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createEntry.isPending}>
              {createEntry.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
