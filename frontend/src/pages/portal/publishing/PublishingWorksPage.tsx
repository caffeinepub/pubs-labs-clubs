import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  useGetAllPublishingWorks,
  useGetCallerUserRole,
  useGetEntitiesForCaller,
  useCreatePublishingWork,
} from '../../../hooks/useQueries';
import { UserRole, PublishingWork } from '../../../backend';
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
import { Plus, Music, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function formatDate(ts: bigint) {
  try {
    return new Date(Number(ts) / 1_000_000).toLocaleDateString();
  } catch {
    return '—';
  }
}

export default function PublishingWorksPage() {
  const navigate = useNavigate();
  const { data: userRole } = useGetCallerUserRole();
  const isAdmin = userRole === UserRole.admin;

  const { data: allWorks, isLoading: loadingAll } = useGetAllPublishingWorks();
  const { data: callerEntities, isLoading: loadingCaller } = useGetEntitiesForCaller();

  const createMutation = useCreatePublishingWork();

  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStatus, setNewStatus] = useState('unregistered');

  const isLoading = isAdmin ? loadingAll : loadingCaller;

  const works: PublishingWork[] = isAdmin
    ? (allWorks ?? [])
    : (callerEntities?.publishingWorks ?? []);

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    try {
      await createMutation.mutateAsync({
        title: newTitle.trim(),
        contributors: [],
        ownershipSplits: [],
        iswc: null,
        isrc: null,
        registrationStatus: newStatus,
      });
      toast.success('Publishing work created');
      setCreateOpen(false);
      setNewTitle('');
      setNewStatus('unregistered');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to create publishing work');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Music size={24} className="text-primary" />
            Publishing Works
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin ? 'All publishing works' : 'Your publishing works'}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-2">
          <Plus size={16} />
          New Work
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : works.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Music size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground font-medium">No publishing works yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1 mb-4">Add your first publishing work to get started.</p>
          <Button onClick={() => setCreateOpen(true)} size="sm" variant="outline" className="gap-2">
            <Plus size={14} />
            Create Work
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Registration Status</TableHead>
                <TableHead>Contributors</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {works.map((work) => (
                <TableRow
                  key={work.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => navigate({ to: `/portal/publishing/${work.id}` })}
                >
                  <TableCell className="font-medium">{work.title || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{work.registrationStatus || '—'}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {Array.isArray(work.contributors) ? work.contributors.length : 0}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(work.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Publishing Work</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="work-title">Title</Label>
              <Input
                id="work-title"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Song or work title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="work-status">Registration Status</Label>
              <Input
                id="work-status"
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                placeholder="e.g. unregistered, pending, registered"
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
