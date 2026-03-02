import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  useGetAllRecordingProjects,
  useGetCallerUserRole,
  useGetEntitiesForCaller,
  useCreateRecordingProject,
} from '../../../hooks/useQueries';
import { UserRole, RecordingProject, ProjectStatus } from '../../../backend';
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
import { Plus, Mic2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function formatDate(ts: bigint) {
  try {
    return new Date(Number(ts) / 1_000_000).toLocaleDateString();
  } catch {
    return '—';
  }
}

function statusColor(status: string) {
  switch (status) {
    case 'in_progress': return 'default';
    case 'completed': return 'secondary';
    case 'planned': return 'outline';
    case 'archived': return 'destructive';
    default: return 'secondary';
  }
}

export default function RecordingProjectsPage() {
  const navigate = useNavigate();
  const { data: userRole } = useGetCallerUserRole();
  const isAdmin = userRole === UserRole.admin;

  const { data: allProjects, isLoading: loadingAll } = useGetAllRecordingProjects();
  const { data: callerEntities, isLoading: loadingCaller } = useGetEntitiesForCaller();

  const createMutation = useCreateRecordingProject();

  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const isLoading = isAdmin ? loadingAll : loadingCaller;

  const projects: RecordingProject[] = isAdmin
    ? (allProjects ?? [])
    : (callerEntities?.recordingProjects ?? []);

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    try {
      await createMutation.mutateAsync({
        title: newTitle.trim(),
        participants: [],
        sessionDate: BigInt(Date.now()) * BigInt(1_000_000),
        status: ProjectStatus.planned,
        notes: newNotes.trim(),
      });
      toast.success('Recording project created');
      setCreateOpen(false);
      setNewTitle('');
      setNewNotes('');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to create recording project');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Mic2 size={24} className="text-primary" />
            Recording Projects
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin ? 'All recording projects' : 'Your recording projects'}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-2">
          <Plus size={16} />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Mic2 size={40} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground font-medium">No recording projects yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1 mb-4">Start your first recording project to get started.</p>
          <Button onClick={() => setCreateOpen(true)} size="sm" variant="outline" className="gap-2">
            <Plus size={14} />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Session Date</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow
                  key={project.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => navigate({ to: `/portal/recordings/${project.id}` })}
                >
                  <TableCell className="font-medium">{project.title || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={statusColor(project.status as string) as any}>
                      {String(project.status).replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {Array.isArray(project.participants) ? project.participants.length : 0}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(project.sessionDate)}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(project.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Recording Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="project-title">Title</Label>
              <Input
                id="project-title"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Project title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-notes">Notes</Label>
              <Input
                id="project-notes"
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                placeholder="Optional notes"
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
