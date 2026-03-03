import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Copy, Loader2, Plus, Trash2, Users, AlertCircle } from 'lucide-react';
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
  useGetAllMembershipProfiles,
  useGetCallerMemberships,
  useCreateMembershipProfile,
  useIsCallerAdmin,
  useBulkDeleteMemberships,
  useDuplicateMembership,
} from '@/hooks/useQueries';
import type { Membership, MembershipProfile } from '../../../backend';
import BulkDeleteConfirmDialog from '@/components/bulk/BulkDeleteConfirmDialog';
import { useTableSort } from '@/hooks/useTableSort';
import SortableTableHeader from '@/components/table/SortableTableHeader';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  applicant: 'secondary',
  paused: 'outline',
  inactive: 'destructive',
};

export default function MembershipsPage() {
  const navigate = useNavigate();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: callerMemberships, isLoading: loadingCaller } = useGetCallerMemberships();
  const { data: allProfiles, isLoading: loadingAll } = useGetAllMembershipProfiles();
  const createMembership = useCreateMembershipProfile();
  const bulkDelete = useBulkDeleteMemberships();
  const duplicate = useDuplicateMembership();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formId, setFormId] = useState('');
  const [formError, setFormError] = useState('');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const isLoading = isAdmin ? loadingAll : loadingCaller;
  const profiles: MembershipProfile[] = isAdmin
    ? (allProfiles ?? [])
    : (callerMemberships ?? []).map((m: Membership) => m.profile);

  const { sortBy, sortDirection, handleSort, sortedData: sortedProfiles } = useTableSort(profiles);

  const allSelected = sortedProfiles.length > 0 && selectedIds.size === sortedProfiles.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < sortedProfiles.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedProfiles.map((p) => p.id)));
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
        toast.success(`Successfully deleted ${deletedCount} membership${deletedCount !== 1 ? 's' : ''}.`);
      }
      if (failedCount > 0) {
        toast.error(`${failedCount} membership${failedCount !== 1 ? 's' : ''} could not be deleted.`);
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
      toast.success('Membership duplicated successfully.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to duplicate membership.';
      toast.error(msg);
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleOpenDialog = () => {
    setFormName('');
    setFormEmail('');
    setFormId(`member-${Date.now()}`);
    setFormError('');
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    setFormError('');
    if (!formName.trim()) { setFormError('Name is required.'); return; }
    if (!formEmail.trim()) { setFormError('Email is required.'); return; }
    if (!formId.trim()) { setFormError('Member ID is required.'); return; }

    try {
      await createMembership.mutateAsync({ id: formId.trim(), name: formName.trim(), email: formEmail.trim() });
      toast.success('Membership created successfully!');
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create membership.';
      setFormError(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Memberships</h1>
            <p className="text-sm text-muted-foreground">
              {isAdmin ? 'All membership profiles' : 'Your membership profiles'}
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
            New Membership
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : sortedProfiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground text-lg font-medium">No memberships yet</p>
          <p className="text-muted-foreground/60 text-sm mt-1">Create your first membership to get started.</p>
          <Button onClick={handleOpenDialog} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            New Membership
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
                    aria-label="Select all memberships"
                  />
                </TableHead>
                <SortableTableHeader
                  label="Name"
                  sortKey="name"
                  currentSortBy={sortBy}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortableTableHeader
                  label="Email"
                  sortKey="email"
                  currentSortBy={sortBy}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortableTableHeader
                  label="Status"
                  sortKey="status"
                  currentSortBy={sortBy}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortableTableHeader
                  label="Tier"
                  sortKey="tier"
                  currentSortBy={sortBy}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
                <TableHead>ID</TableHead>
                <SortableTableHeader
                  label="Created"
                  sortKey="created_at"
                  currentSortBy={sortBy}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProfiles.map((profile) => {
                const isSelected = selectedIds.has(profile.id);
                return (
                  <TableRow
                    key={profile.id}
                    className={`cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-muted/30' : ''}`}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest('[role="checkbox"]') || target.closest('button')) return;
                      navigate({ to: `/portal/memberships/${profile.id}` });
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectRow(profile.id, !!checked)}
                        aria-label={`Select ${profile.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{profile.name}</TableCell>
                    <TableCell className="text-muted-foreground">{profile.email}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[profile.status as string] ?? 'secondary'}>
                        {profile.status as string}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{profile.tier}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{profile.id}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(Number(profile.created_at) / 1_000_000).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDuplicate(profile.id, e)}
                        disabled={duplicatingId === profile.id}
                        title="Duplicate membership"
                      >
                        {duplicatingId === profile.id ? (
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
        entityType="membership"
        entityTypePlural="memberships"
        isPending={bulkDelete.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleBulkDelete}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Membership</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new membership profile.
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
              <Label htmlFor="member-id">Member ID</Label>
              <Input
                id="member-id"
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                placeholder="e.g. member-001"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="member-name">Name <span className="text-destructive">*</span></Label>
              <Input
                id="member-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="member-email">Email <span className="text-destructive">*</span></Label>
              <Input
                id="member-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={createMembership.isPending}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMembership.isPending}>
              {createMembership.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Membership
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
