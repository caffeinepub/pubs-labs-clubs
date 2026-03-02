import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllRecordingProjects, useCreateRecordingProject } from '../../../hooks/useQueries';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, Plus } from 'lucide-react';
import EmptyState from '../../../components/feedback/EmptyState';
import LoadingState from '../../../components/feedback/LoadingState';
import { ProjectStatus } from '../../../backend';

export default function RecordingProjectsPage() {
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();
  const { data: projects = [], isLoading } = useGetAllRecordingProjects();
  const createMutation = useCreateRecordingProject();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    participants: '',
    sessionDate: '',
    status: ProjectStatus.planned,
    notes: ''
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const sessionDateMs = new Date(formData.sessionDate).getTime();
    createMutation.mutate({
      title: formData.title,
      participants: formData.participants.split(',').map(p => p.trim()).filter(Boolean),
      sessionDate: BigInt(sessionDateMs * 1000000),
      status: formData.status,
      notes: formData.notes
    }, {
      onSuccess: () => {
        setDialogOpen(false);
        setFormData({
          title: '',
          participants: '',
          sessionDate: '',
          status: ProjectStatus.planned,
          notes: ''
        });
      }
    });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Recording Projects</h1>
          <p className="text-muted-foreground">Manage production projects and sessions (reference links only)</p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Recording Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Project title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="participants">Participants (comma-separated)</Label>
                  <Input
                    id="participants"
                    value={formData.participants}
                    onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                    placeholder="Artist, Producer, Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionDate">Session Date *</Label>
                  <Input
                    id="sessionDate"
                    type="date"
                    value={formData.sessionDate}
                    onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as ProjectStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ProjectStatus.planned}>Planned</SelectItem>
                      <SelectItem value={ProjectStatus.in_progress}>In Progress</SelectItem>
                      <SelectItem value={ProjectStatus.completed}>Completed</SelectItem>
                      <SelectItem value={ProjectStatus.archived}>Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Project notes..."
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Project'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={Mic}
          title="No recording projects yet"
          description="Create your first recording project to start managing production sessions."
          actionLabel={isAdmin ? "Create Project" : undefined}
          onAction={isAdmin ? () => setDialogOpen(true) : undefined}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card 
              key={project.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate({ to: '/portal/recordings/$id', params: { id: project.id } })}
            >
              <CardHeader>
                <CardTitle className="truncate">{project.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground capitalize">{project.status.replace('_', ' ')}</p>
                  <p className="text-xs text-muted-foreground">
                    {project.participants.length} participant{project.participants.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(Number(project.sessionDate) / 1000000).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
