import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllArtistDevelopment, useCreateArtistDevelopment } from '../../../hooks/useQueries';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TrendingUp, Plus } from 'lucide-react';
import EmptyState from '../../../components/feedback/EmptyState';
import LoadingState from '../../../components/feedback/LoadingState';

export default function ArtistDevelopmentPage() {
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();
  const { data: artists = [], isLoading } = useGetAllArtistDevelopment();
  const createMutation = useCreateArtistDevelopment();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    artistId: '',
    goals: '',
    plans: '',
    milestones: '',
    internalNotes: ''
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      artistId: formData.artistId,
      goals: formData.goals.split(',').map(g => g.trim()).filter(Boolean),
      plans: formData.plans.split(',').map(p => p.trim()).filter(Boolean),
      milestones: formData.milestones.split(',').map(m => m.trim()).filter(Boolean),
      internalNotes: formData.internalNotes
    }, {
      onSuccess: () => {
        setDialogOpen(false);
        setFormData({
          artistId: '',
          goals: '',
          plans: '',
          milestones: '',
          internalNotes: ''
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
          <h1 className="text-3xl font-bold mb-2">Artist Development</h1>
          <p className="text-muted-foreground">Manage artist/client profiles and development plans</p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Artist Development Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="artistId">Artist/Client ID *</Label>
                  <Input
                    id="artistId"
                    value={formData.artistId}
                    onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
                    placeholder="Artist name or ID"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goals">Goals (comma-separated)</Label>
                  <Input
                    id="goals"
                    value={formData.goals}
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                    placeholder="Release album, Tour, Build fanbase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plans">Plans (comma-separated)</Label>
                  <Input
                    id="plans"
                    value={formData.plans}
                    onChange={(e) => setFormData({ ...formData, plans: e.target.value })}
                    placeholder="Studio sessions, Marketing campaign"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="milestones">Milestones (comma-separated)</Label>
                  <Input
                    id="milestones"
                    value={formData.milestones}
                    onChange={(e) => setFormData({ ...formData, milestones: e.target.value })}
                    placeholder="First single, 10k streams, First show"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="internalNotes">Internal Notes (Admin only)</Label>
                  <Textarea
                    id="internalNotes"
                    value={formData.internalNotes}
                    onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                    placeholder="Internal notes..."
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Entry'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {artists.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No artist development entries yet"
          description="Create your first entry to start managing artist/client development plans."
          actionLabel={isAdmin ? "Create Entry" : undefined}
          onAction={isAdmin ? () => setDialogOpen(true) : undefined}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {artists.map((artist) => (
            <Card 
              key={artist.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate({ to: '/portal/artists/$id', params: { id: artist.id } })}
            >
              <CardHeader>
                <CardTitle className="truncate">{artist.artistId}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    {artist.goals.length} goal{artist.goals.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {artist.milestones.length} milestone{artist.milestones.length !== 1 ? 's' : ''}
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
