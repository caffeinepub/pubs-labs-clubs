import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllPublishingWorks, useCreatePublishingWork } from '../../../hooks/useQueries';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Music, Plus } from 'lucide-react';
import EmptyState from '../../../components/feedback/EmptyState';
import LoadingState from '../../../components/feedback/LoadingState';
import { validateOwnershipSplits } from '../../../utils/validation';
import { toast } from 'sonner';

export default function PublishingWorksPage() {
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();
  const { data: works = [], isLoading } = useGetAllPublishingWorks();
  const createMutation = useCreatePublishingWork();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    contributors: '',
    splits: '',
    iswc: '',
    isrc: '',
    registrationStatus: 'pending'
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const contributorsArray = formData.contributors.split(',').map(c => c.trim()).filter(Boolean);
    const splitsArray = formData.splits.split(',').map(s => s.trim()).filter(Boolean);
    
    if (contributorsArray.length !== splitsArray.length) {
      toast.error('Number of contributors must match number of splits');
      return;
    }

    const ownershipSplits: [string, bigint][] = contributorsArray.map((contributor, idx) => {
      const split = parseInt(splitsArray[idx]);
      return [contributor, BigInt(split)];
    });

    const validation = validateOwnershipSplits(ownershipSplits);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    createMutation.mutate({
      title: formData.title,
      contributors: contributorsArray,
      ownershipSplits,
      iswc: formData.iswc || null,
      isrc: formData.isrc || null,
      registrationStatus: formData.registrationStatus
    }, {
      onSuccess: () => {
        setDialogOpen(false);
        setFormData({
          title: '',
          contributors: '',
          splits: '',
          iswc: '',
          isrc: '',
          registrationStatus: 'pending'
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
          <h1 className="text-3xl font-bold mb-2">Publishing Catalog</h1>
          <p className="text-muted-foreground">Manage music publishing works and rights</p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Work
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Publishing Work</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Song title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contributors">Contributors * (comma-separated)</Label>
                  <Input
                    id="contributors"
                    value={formData.contributors}
                    onChange={(e) => setFormData({ ...formData, contributors: e.target.value })}
                    placeholder="John Doe, Jane Smith"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="splits">Ownership Splits % * (comma-separated, must total ≤100)</Label>
                  <Input
                    id="splits"
                    value={formData.splits}
                    onChange={(e) => setFormData({ ...formData, splits: e.target.value })}
                    placeholder="50, 50"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="iswc">ISWC</Label>
                    <Input
                      id="iswc"
                      value={formData.iswc}
                      onChange={(e) => setFormData({ ...formData, iswc: e.target.value })}
                      placeholder="T-123.456.789-0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isrc">ISRC</Label>
                    <Input
                      id="isrc"
                      value={formData.isrc}
                      onChange={(e) => setFormData({ ...formData, isrc: e.target.value })}
                      placeholder="USRC17607839"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Work'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {works.length === 0 ? (
        <EmptyState
          icon={Music}
          title="No publishing works yet"
          description="Create your first publishing work to start managing your catalog."
          actionLabel={isAdmin ? "Create Work" : undefined}
          onAction={isAdmin ? () => setDialogOpen(true) : undefined}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {works.map((work) => (
            <Card 
              key={work.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate({ to: '/portal/publishing/$id', params: { id: work.id } })}
            >
              <CardHeader>
                <CardTitle className="truncate">{work.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    {work.contributors.length} contributor{work.contributors.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">Status: {work.registrationStatus}</p>
                  {work.iswc && <p className="text-xs text-muted-foreground">ISWC: {work.iswc}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
