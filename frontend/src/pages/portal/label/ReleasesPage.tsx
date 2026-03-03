import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Copy, Loader2, Plus, Trash2, Disc, AlertCircle } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  useGetAllReleases,
  useGetEntitiesForCaller,
  useCreateRelease,
  useIsCallerAdmin,
  useBulkDeleteReleases,
  useDuplicateRelease,
} from '@/hooks/useQueries';
import type { Release } from '../../../backend';
import BulkDeleteConfirmDialog from '@/components/bulk/BulkDeleteConfirmDialog';

const RELEASE_TYPES = ['Single', 'EP', 'Album', 'Compilation', 'Mixtape', 'Live', 'Other'];

export default function ReleasesPage() {
  const navigate = useNavigate();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: allReleases, isLoading: loadingAll } = useGetAllReleases();
  const { data: callerEntities, isLoading: loadingCaller } = useGetEntitiesForCaller();
  const createRelease = useCreateRelease();
  const bulkDelete = useBulkDeleteReleases();
  const duplicate = useDuplicateRelease();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formReleaseType, setFormReleaseType] = useState('');
  const [formTracklist, setFormTracklist] = useState('');
  const [formKeyDates, setFormKeyDates] = useState('');
  const [formOwners, setFormOwners] = useState('');
  const [formError, setFormError] = useState('');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const isLoading = isAdmin ? loadingAll : loadingCaller;
  const releases: Release[] = isAdmin
    ? (allReleases ?? [])
    : (callerEntities?.releases ?? []);

  const allSelected = releases.length > 0 && selectedIds.size === releases.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < releases.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(releases.map((r) => r.id)));
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
        toast.success(`Successfully deleted ${deletedCount} release${deletedCount !== 1 ? 's' : ''}.`);
      }
      if (failedCount > 0) {
        toast.error(`${failedCount} release${failedCount !== 1 ? 's' : ''} could not be deleted.`);
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
      toast.success('Release duplicated successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to duplicate release.';
      toast.error(msg);
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleOpenDialog = () => {
    setFormTitle('');
    setFormReleaseType('');
    setFormTracklist('');
    setFormKeyDates('');
    setFormOwners('');
    setFormError('');
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    setFormError('');
    if (!formTitle.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (!formReleaseType) {
      setFormError('Release type is required.');
      return;
    }

    const tracklist = formTracklist.split('\n').map((t) => t.trim()).filter(Boolean);
    const keyDates = formKeyDates.split('\n').map((d) => d.trim()).filter(Boolean);
    const owners = formOwners.split('\n').map((o) => o.trim()).filter(Boolean);

    try {
      await createRelease.mutateAsync({
        title: formTitle.trim(),
        releaseType: formReleaseType,
        tracklist,
        keyDates,
        owners,
      });
      toast.success('Release created successfully!');
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create release.';
      setFormError(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Disc className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Releases</h1>
            <p className="text-sm text-muted-foreground">
              {isAdmin ? 'All releases' : 'Your releases'}
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
            New Release
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : releases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Disc className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground text-lg font-medium">No releases yet</p>
          <p className="text-muted-foreground/60 text-sm mt-1">Create your first release to get started.</p>
          <Button onClick={handleOpenDialog} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            New Release
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
                    aria-label="Select all releases"
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tracks</TableHead>
                <TableHead>ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {releases.map((release) => {
                const isSelected = selectedIds.has(release.id);
                return (
                  <TableRow
                    key={release.id}
                    className={`cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-muted/30' : ''}`}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest('[role="checkbox"]') || target.closest('button')) return;
                      navigate({ to: `/portal/releases/${release.id}` });
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectRow(release.id, !!checked)}
                        aria-label={`Select ${release.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{release.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{release.releaseType}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {release.tracklist?.length ?? 0} track(s)
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{release.id}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDuplicate(release.id, e)}
                        disabled={duplicatingId === release.id}
                        title="Duplicate release"
                      >
                        {duplicatingId === release.id ? (
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
        entityType="release"
        entityTypePlural="releases"
        isPending={bulkDelete.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleBulkDelete}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Release</DialogTitle>
            <DialogDescription>
              Add a new release to your label catalog.
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
              <Label htmlFor="release-title">Title <span className="text-destructive">*</span></Label>
              <Input
                id="release-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Release title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="release-type">Release Type <span className="text-destructive">*</span></Label>
              <Select value={formReleaseType} onValueChange={setFormReleaseType}>
                <SelectTrigger id="release-type">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {RELEASE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="release-tracklist">Tracklist (one per line)</Label>
              <Textarea
                id="release-tracklist"
                value={formTracklist}
                onChange={(e) => setFormTracklist(e.target.value)}
                placeholder="Track names, one per line"
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="release-keydates">Key Dates (one per line)</Label>
              <Textarea
                id="release-keydates"
                value={formKeyDates}
                onChange={(e) => setFormKeyDates(e.target.value)}
                placeholder="e.g. Release: 2024-06-01"
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="release-owners">Owners (one per line)</Label>
              <Textarea
                id="release-owners"
                value={formOwners}
                onChange={(e) => setFormOwners(e.target.value)}
                placeholder="Owner names, one per line"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={createRelease.isPending}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createRelease.isPending}>
              {createRelease.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Release
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
