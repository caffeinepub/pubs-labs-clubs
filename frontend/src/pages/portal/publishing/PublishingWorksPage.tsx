import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Copy, Loader2, Plus, Trash2, BookOpen, AlertCircle } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import {
  useGetAllPublishingWorks,
  useGetEntitiesForCaller,
  useCreatePublishingWork,
  useIsCallerAdmin,
  useBulkDeletePublishingWorks,
  useDuplicatePublishingWork,
} from '@/hooks/useQueries';
import type { PublishingWork } from '../../../backend';
import BulkDeleteConfirmDialog from '@/components/bulk/BulkDeleteConfirmDialog';

export default function PublishingWorksPage() {
  const navigate = useNavigate();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: allWorks, isLoading: loadingAll } = useGetAllPublishingWorks();
  const { data: callerEntities, isLoading: loadingCaller } = useGetEntitiesForCaller();
  const createWork = useCreatePublishingWork();
  const bulkDelete = useBulkDeletePublishingWorks();
  const duplicate = useDuplicatePublishingWork();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formRegistrationStatus, setFormRegistrationStatus] = useState('');
  const [formContributors, setFormContributors] = useState('');
  const [formIswc, setFormIswc] = useState('');
  const [formIsrc, setFormIsrc] = useState('');
  const [formError, setFormError] = useState('');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const isLoading = isAdmin ? loadingAll : loadingCaller;
  const works: PublishingWork[] = isAdmin
    ? (allWorks ?? [])
    : (callerEntities?.publishingWorks ?? []);

  const allSelected = works.length > 0 && selectedIds.size === works.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < works.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(works.map((w) => w.id)));
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
        toast.success(`Successfully deleted ${deletedCount} publishing work${deletedCount !== 1 ? 's' : ''}.`);
      }
      if (failedCount > 0) {
        toast.error(`${failedCount} publishing work${failedCount !== 1 ? 's' : ''} could not be deleted.`);
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
      toast.success('Publishing work duplicated successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to duplicate publishing work.';
      toast.error(msg);
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleOpenDialog = () => {
    setFormTitle('');
    setFormRegistrationStatus('');
    setFormContributors('');
    setFormIswc('');
    setFormIsrc('');
    setFormError('');
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    setFormError('');
    if (!formTitle.trim()) {
      setFormError('Title is required.');
      return;
    }

    const contributors = formContributors
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean);

    try {
      await createWork.mutateAsync({
        title: formTitle.trim(),
        contributors,
        ownershipSplits: [],
        iswc: formIswc.trim() || null,
        isrc: formIsrc.trim() || null,
        registrationStatus: formRegistrationStatus.trim() || 'unregistered',
      });
      toast.success('Publishing work created successfully!');
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create publishing work.';
      setFormError(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Publishing Works</h1>
            <p className="text-sm text-muted-foreground">
              {isAdmin ? 'All publishing works' : 'Your publishing catalog'}
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
            New Work
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : works.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground text-lg font-medium">No publishing works yet</p>
          <p className="text-muted-foreground/60 text-sm mt-1">Add your first publishing work to get started.</p>
          <Button onClick={handleOpenDialog} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            New Work
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
                    aria-label="Select all publishing works"
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Contributors</TableHead>
                <TableHead>ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {works.map((work) => {
                const isSelected = selectedIds.has(work.id);
                return (
                  <TableRow
                    key={work.id}
                    className={`cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-muted/30' : ''}`}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest('[role="checkbox"]') || target.closest('button')) return;
                      navigate({ to: `/portal/publishing/${work.id}` });
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectRow(work.id, !!checked)}
                        aria-label={`Select ${work.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{work.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{work.registrationStatus || 'unregistered'}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {work.contributors.length > 0
                        ? work.contributors.slice(0, 2).join(', ') +
                          (work.contributors.length > 2 ? ` +${work.contributors.length - 2}` : '')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{work.id}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDuplicate(work.id, e)}
                        disabled={duplicatingId === work.id}
                        title="Duplicate publishing work"
                      >
                        {duplicatingId === work.id ? (
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
        entityType="publishing work"
        entityTypePlural="publishing works"
        isPending={bulkDelete.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleBulkDelete}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Publishing Work</DialogTitle>
            <DialogDescription>
              Add a new work to your publishing catalog.
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
              <Label htmlFor="work-title">Title <span className="text-destructive">*</span></Label>
              <Input
                id="work-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Work title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="work-status">Registration Status</Label>
              <Input
                id="work-status"
                value={formRegistrationStatus}
                onChange={(e) => setFormRegistrationStatus(e.target.value)}
                placeholder="e.g. registered, unregistered"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="work-contributors">Contributors (one per line)</Label>
              <Textarea
                id="work-contributors"
                value={formContributors}
                onChange={(e) => setFormContributors(e.target.value)}
                placeholder="Contributor names, one per line"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="work-iswc">ISWC</Label>
                <Input
                  id="work-iswc"
                  value={formIswc}
                  onChange={(e) => setFormIswc(e.target.value)}
                  placeholder="T-000.000.000-0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="work-isrc">ISRC</Label>
                <Input
                  id="work-isrc"
                  value={formIsrc}
                  onChange={(e) => setFormIsrc(e.target.value)}
                  placeholder="CC-XXX-YY-NNNNN"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={createWork.isPending}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createWork.isPending}>
              {createWork.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Work
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
