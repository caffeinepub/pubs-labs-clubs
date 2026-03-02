import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllReleases, useCreateRelease } from '../../../hooks/useQueries';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Disc, Plus } from 'lucide-react';
import EmptyState from '../../../components/feedback/EmptyState';
import LoadingState from '../../../components/feedback/LoadingState';

export default function ReleasesPage() {
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();
  const { data: releases = [], isLoading } = useGetAllReleases();
  const createMutation = useCreateRelease();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    releaseType: 'single',
    tracklist: '',
    keyDates: '',
    owners: ''
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title: formData.title,
      releaseType: formData.releaseType,
      tracklist: formData.tracklist.split(',').map(t => t.trim()).filter(Boolean),
      keyDates: formData.keyDates.split(',').map(d => d.trim()).filter(Boolean),
      owners: formData.owners.split(',').map(o => o.trim()).filter(Boolean)
    }, {
      onSuccess: () => {
        setDialogOpen(false);
        setFormData({
          title: '',
          releaseType: 'single',
          tracklist: '',
          keyDates: '',
          owners: ''
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
          <h1 className="text-3xl font-bold mb-2">Releases</h1>
          <p className="text-muted-foreground">Manage label releases and workflows</p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Release
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Release</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Release title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="releaseType">Release Type *</Label>
                  <Input
                    id="releaseType"
                    value={formData.releaseType}
                    onChange={(e) => setFormData({ ...formData, releaseType: e.target.value })}
                    placeholder="single, EP, album"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tracklist">Tracklist (comma-separated)</Label>
                  <Input
                    id="tracklist"
                    value={formData.tracklist}
                    onChange={(e) => setFormData({ ...formData, tracklist: e.target.value })}
                    placeholder="Track 1, Track 2, Track 3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keyDates">Key Dates (comma-separated)</Label>
                  <Input
                    id="keyDates"
                    value={formData.keyDates}
                    onChange={(e) => setFormData({ ...formData, keyDates: e.target.value })}
                    placeholder="2024-03-15: Release, 2024-03-01: Pre-save"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owners">Owners (comma-separated)</Label>
                  <Input
                    id="owners"
                    value={formData.owners}
                    onChange={(e) => setFormData({ ...formData, owners: e.target.value })}
                    placeholder="Artist Name, Producer Name"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Release'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {releases.length === 0 ? (
        <EmptyState
          icon={Disc}
          title="No releases yet"
          description="Create your first release to start managing label operations."
          actionLabel={isAdmin ? "Create Release" : undefined}
          onAction={isAdmin ? () => setDialogOpen(true) : undefined}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {releases.map((release) => (
            <Card 
              key={release.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate({ to: '/portal/releases/$id', params: { id: release.id } })}
            >
              <CardHeader>
                <CardTitle className="truncate">{release.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground capitalize">{release.releaseType}</p>
                  <p className="text-xs text-muted-foreground">
                    {release.tracklist.length} track{release.tracklist.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {release.owners.length} owner{release.owners.length !== 1 ? 's' : ''}
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
