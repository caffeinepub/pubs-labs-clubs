import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, BookOpen, Loader2, AlertCircle, X } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
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
  useGetAllPublishingWorks,
  useGetEntitiesForCaller,
  useCreatePublishingWork,
  useIsCallerAdmin,
} from '@/hooks/useQueries';
import type { PublishingWork } from '../../../backend';

export default function PublishingWorksPage() {
  const navigate = useNavigate();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: allWorks, isLoading: loadingAll } = useGetAllPublishingWorks();
  const { data: callerEntities, isLoading: loadingCaller } = useGetEntitiesForCaller();
  const createWork = useCreatePublishingWork();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formRegistrationStatus, setFormRegistrationStatus] = useState('');
  const [formContributors, setFormContributors] = useState('');
  const [formIswc, setFormIswc] = useState('');
  const [formIsrc, setFormIsrc] = useState('');
  const [formError, setFormError] = useState('');

  const isLoading = isAdmin ? loadingAll : loadingCaller;
  const works: PublishingWork[] = isAdmin
    ? (allWorks ?? [])
    : (callerEntities?.publishingWorks ?? []);

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
        <Button onClick={handleOpenDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          New Work
        </Button>
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
                <TableHead>Title</TableHead>
                <TableHead>Registration Status</TableHead>
                <TableHead>Contributors</TableHead>
                <TableHead>ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {works.map((work) => (
                <TableRow
                  key={work.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate({ to: `/portal/publishing/${work.id}` })}
                >
                  <TableCell className="font-medium">{work.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{work.registrationStatus || 'unregistered'}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {work.contributors?.length ?? 0} contributor(s)
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{work.id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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
                placeholder="Song or work title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="work-reg-status">Registration Status</Label>
              <Input
                id="work-reg-status"
                value={formRegistrationStatus}
                onChange={(e) => setFormRegistrationStatus(e.target.value)}
                placeholder="e.g. registered, pending, unregistered"
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
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="work-isrc">ISRC</Label>
                <Input
                  id="work-isrc"
                  value={formIsrc}
                  onChange={(e) => setFormIsrc(e.target.value)}
                  placeholder="Optional"
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
