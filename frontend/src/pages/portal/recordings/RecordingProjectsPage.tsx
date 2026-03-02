import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, Mic, Loader2, AlertCircle } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  useGetAllRecordingProjects,
  useGetEntitiesForCaller,
  useCreateRecordingProject,
  useIsCallerAdmin,
} from '@/hooks/useQueries';
import type { RecordingProject } from '../../../backend';
import { ProjectStatus } from '../../../backend';

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'in_progress': return 'default';
    case 'completed': return 'secondary';
    case 'planned': return 'outline';
    case 'archived': return 'destructive';
    default: return 'outline';
  }
}

function formatStatus(status: string): string {
  return status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function RecordingProjectsPage() {
  const navigate = useNavigate();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: allProjects, isLoading: loadingAll } = useGetAllRecordingProjects();
  const { data: callerEntities, isLoading: loadingCaller } = useGetEntitiesForCaller();
  const createProject = useCreateRecordingProject();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formParticipants, setFormParticipants] = useState('');
  const [formSessionDate, setFormSessionDate] = useState('');
  const [formStatus, setFormStatus] = useState<ProjectStatus>(ProjectStatus.planned);
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  const isLoading = isAdmin ? loadingAll : loadingCaller;
  const projects: RecordingProject[] = isAdmin
    ? (allProjects ?? [])
    : (callerEntities?.recordingProjects ?? []);

  const handleOpenDialog = () => {
    setFormTitle('');
    setFormParticipants('');
    setFormSessionDate(new Date().toISOString().split('T')[0]);
    setFormStatus(ProjectStatus.planned);
    setFormNotes('');
    setFormError('');
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    setFormError('');
    if (!formTitle.trim()) {
      setFormError('Title is required.');
      return;
    }

    const participants = formParticipants.split('\n').map((p) => p.trim()).filter(Boolean);
    const sessionDateMs = formSessionDate
      ? BigInt(new Date(formSessionDate).getTime()) * BigInt(1_000_000)
      : BigInt(Date.now()) * BigInt(1_000_000);

    try {
      await createProject.mutateAsync({
        title: formTitle.trim(),
        participants,
        sessionDate: sessionDateMs,
        status: formStatus,
        notes: formNotes.trim(),
      });
      toast.success('Recording project created successfully!');
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create recording project.';
      setFormError(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mic className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Recording Projects</h1>
            <p className="text-sm text-muted-foreground">
              {isAdmin ? 'All recording projects' : 'Your recording projects'}
            </p>
          </div>
        </div>
        <Button onClick={handleOpenDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Mic className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground text-lg font-medium">No recording projects yet</p>
          <p className="text-muted-foreground/60 text-sm mt-1">Create your first project to get started.</p>
          <Button onClick={handleOpenDialog} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow
                  key={project.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate({ to: `/portal/recordings/${project.id}` })}
                >
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(project.status as string)}>
                      {formatStatus(project.status as string)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.participants?.length ?? 0} participant(s)
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{project.id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Recording Project</DialogTitle>
            <DialogDescription>
              Start a new recording project session.
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
              <Label htmlFor="project-title">Title <span className="text-destructive">*</span></Label>
              <Input
                id="project-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Project title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-status">Status</Label>
              <Select value={formStatus as string} onValueChange={(v) => setFormStatus(v as ProjectStatus)}>
                <SelectTrigger id="project-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-date">Session Date</Label>
              <Input
                id="project-date"
                type="date"
                value={formSessionDate}
                onChange={(e) => setFormSessionDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-participants">Participants (one per line)</Label>
              <Textarea
                id="project-participants"
                value={formParticipants}
                onChange={(e) => setFormParticipants(e.target.value)}
                placeholder="Participant names, one per line"
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-notes">Notes</Label>
              <Textarea
                id="project-notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Session notes..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={createProject.isPending}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createProject.isPending}>
              {createProject.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
