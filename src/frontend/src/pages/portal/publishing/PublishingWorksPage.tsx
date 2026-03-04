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
import { useTableSort } from "@/hooks/useTableSort";
import { useNavigate } from "@tanstack/react-router";
import { Copy, Loader2, Plus, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type PublishingWork,
  useCreatePublishingWork,
  useDeletePublishingWork,
  useDuplicatePublishingWork,
  useGetPublishingWorks,
} from "../../../hooks/useQueries";

export default function PublishingWorksPage() {
  const navigate = useNavigate();
  const { data: works = [], isLoading } = useGetPublishingWorks();
  const createMutation = useCreatePublishingWork();
  const deleteMutation = useDeletePublishingWork();
  const duplicateMutation = useDuplicatePublishingWork();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const { sortedData, sortBy, sortDirection, handleSort } = useTableSort(
    works,
    "title",
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
      setSelected(new Set(sortedData.map((w) => w.id)));
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      await createMutation.mutateAsync({
        owner: "",
        title: newTitle.trim(),
        contributors: [],
        ownershipSplits: [],
        iswc: null,
        isrc: null,
        registrationStatus: "pending",
        notes: "",
        linkedMembers: [],
        linkedArtists: [],
        linkedReleases: [],
        linkedProjects: [],
      });
      toast.success("Publishing work created");
      setShowCreate(false);
      setNewTitle("");
    } catch {
      toast.error("Failed to create publishing work");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await deleteMutation.mutateAsync(Array.from(selected));
      toast.success(`Deleted ${selected.size} work(s)`);
      setSelected(new Set());
      setShowDeleteConfirm(false);
    } catch {
      toast.error("Failed to delete works");
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await duplicateMutation.mutateAsync(id);
      toast.success("Work duplicated");
    } catch {
      toast.error("Failed to duplicate work");
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
          <h1 className="text-2xl font-bold">Publishing Works</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your publishing catalog and works.
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
            New Work
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
              sortKey="title"
              currentSortBy={sortBy}
              currentDirection={sortDirection}
              onSort={handleSort}
              label="Title"
            />
            <SortableTableHeader
              sortKey="registrationStatus"
              currentSortBy={sortBy}
              currentDirection={sortDirection}
              onSort={handleSort}
              label="Status"
            />
            <SortableTableHeader
              sortKey="created_at"
              currentSortBy={sortBy}
              currentDirection={sortDirection}
              onSort={handleSort}
              label="Created"
            />
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
                No publishing works yet.
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((work) => (
              <TableRow
                key={work.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() =>
                  navigate({ to: `/portal/publishing/${work.id}` })
                }
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selected.has(work.id)}
                    onCheckedChange={() => toggleSelect(work.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {work.title || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {work.registrationStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(
                    Number(work.created_at / BigInt(1_000_000)),
                  ).toLocaleDateString()}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDuplicate(work.id, e)}
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
            <DialogTitle>New Publishing Work</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label htmlFor="pw-create-title" className="text-sm font-medium">
                Work Title
              </label>
              <Input
                id="pw-create-title"
                className="mt-1"
                placeholder="Enter work title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
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
              disabled={!newTitle.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? (
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
        entityLabel="publishing work"
        entityLabelPlural="publishing works"
        isPending={deleteMutation.isPending}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
