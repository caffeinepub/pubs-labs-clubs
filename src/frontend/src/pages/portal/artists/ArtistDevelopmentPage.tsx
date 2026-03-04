import BulkDeleteConfirmDialog from "@/components/bulk/BulkDeleteConfirmDialog";
import SortableTableHeader from "@/components/table/SortableTableHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ArtistDevelopment,
  useCreateArtistDevelopment,
  useDeleteArtistDevelopment,
  useDuplicateArtistDevelopment,
  useGetArtistDevelopments,
} from "@/hooks/useQueries";
import { useTableSort } from "@/hooks/useTableSort";
import { useNavigate } from "@tanstack/react-router";
import { Copy, Loader2, Plus, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";

export default function ArtistDevelopmentPage() {
  const navigate = useNavigate();
  const { data: entries = [], isLoading } = useGetArtistDevelopments();
  const createEntry = useCreateArtistDevelopment();
  const deleteEntries = useDeleteArtistDevelopment();
  const duplicateEntry = useDuplicateArtistDevelopment();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formArtistId, setFormArtistId] = useState("");

  const { sortedData, sortBy, sortDirection, handleSort } = useTableSort(
    entries,
    "artistId",
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === sortedData.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sortedData.map((e) => e.id)));
    }
  };

  const handleCreate = async () => {
    if (!formArtistId.trim()) return;
    try {
      await createEntry.mutateAsync({ artistId: formArtistId.trim() });
      toast.success("Artist development record created");
      setShowCreate(false);
      setFormArtistId("");
    } catch {
      toast.error("Failed to create record");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await deleteEntries.mutateAsync(Array.from(selected));
      toast.success(`Deleted ${selected.size} record(s)`);
      setSelected(new Set());
      setShowDeleteConfirm(false);
    } catch {
      toast.error("Failed to delete records");
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await duplicateEntry.mutateAsync(id);
      toast.success("Record duplicated");
    } catch {
      toast.error("Failed to duplicate record");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Artist Development</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage artist development and CRM records.
          </p>
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete ({selected.size})
            </Button>
          )}
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Record
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={
                  selected.size === sortedData.length && sortedData.length > 0
                }
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <SortableTableHeader
              sortKey="artistId"
              currentSortBy={sortBy}
              currentDirection={sortDirection}
              onSort={handleSort}
              label="Artist ID"
            />
            <SortableTableHeader
              sortKey="created_at"
              currentSortBy={sortBy}
              currentDirection={sortDirection}
              onSort={handleSort}
              label="Created"
            />
            <TableHead>Goals</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground py-8"
              >
                No artist development records yet.
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((entry) => (
              <TableRow
                key={entry.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate({ to: `/portal/artists/${entry.id}` })}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selected.has(entry.id)}
                    onCheckedChange={() => toggleSelect(entry.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {entry.artistId || "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(
                    Number(entry.created_at / BigInt(1_000_000)),
                  ).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(entry.goals ?? []).slice(0, 2).map((g) => (
                      <Badge key={g} variant="outline" className="text-xs">
                        {g}
                      </Badge>
                    ))}
                    {(entry.goals ?? []).length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{entry.goals.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDuplicate(entry.id, e)}
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Artist Development Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label htmlFor="artist-id-input" className="text-sm font-medium">
                Artist ID / Name
              </label>
              <Input
                id="artist-id-input"
                className="mt-1"
                placeholder="Enter artist identifier"
                value={formArtistId}
                onChange={(e) => setFormArtistId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formArtistId.trim() || createEntry.isPending}
            >
              {createEntry.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirm */}
      <BulkDeleteConfirmDialog
        open={showDeleteConfirm}
        count={selected.size}
        entityLabel="artist development record"
        entityLabelPlural="artist development records"
        isPending={deleteEntries.isPending}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
