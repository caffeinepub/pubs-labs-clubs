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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import CustomFieldsSection from "../../../components/custom-fields/CustomFieldsSection";
import {
  type Release,
  useCreateRelease,
  useDeleteRelease,
  useDuplicateRelease,
  useGetReleases,
} from "../../../hooks/useQueries";

export default function ReleasesPage() {
  const navigate = useNavigate();
  const { data: releases = [], isLoading } = useGetReleases();
  const createMutation = useCreateRelease();
  const deleteMutation = useDeleteRelease();
  const duplicateMutation = useDuplicateRelease();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newReleaseType, setNewReleaseType] = useState("Single");
  const [newTracklist, setNewTracklist] = useState("");
  const [newKeyDates, setNewKeyDates] = useState("");
  const [customFieldValues, setCustomFieldValues] = useState<
    Record<string, string>
  >({});

  const { sortedData, sortBy, sortDirection, handleSort } = useTableSort(
    releases,
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
      setSelected(new Set(sortedData.map((r) => r.id)));
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      await createMutation.mutateAsync({
        owner: "",
        title: newTitle.trim(),
        releaseType: newReleaseType,
        tracklist: newTracklist
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        keyDates: newKeyDates
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean),
        owners: [],
        workflowChecklist: [],
        linkedMembers: [],
        linkedArtists: [],
        linkedWorks: [],
        linkedProjects: [],
      });
      toast.success("Release created");
      setShowCreate(false);
      setNewTitle("");
      setNewReleaseType("Single");
      setNewTracklist("");
      setNewKeyDates("");
    } catch {
      toast.error("Failed to create release");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await deleteMutation.mutateAsync(Array.from(selected));
      toast.success(`Deleted ${selected.size} release(s)`);
      setSelected(new Set());
      setShowDeleteConfirm(false);
    } catch {
      toast.error("Failed to delete releases");
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await duplicateMutation.mutateAsync(id);
      toast.success("Release duplicated");
    } catch {
      toast.error("Failed to duplicate release");
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
          <h1 className="text-2xl font-bold">Releases</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage label releases and catalog.
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
            New Release
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
              sortKey="releaseType"
              currentSortBy={sortBy}
              currentDirection={sortDirection}
              onSort={handleSort}
              label="Type"
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
                No releases yet.
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((release) => (
              <TableRow
                key={release.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() =>
                  navigate({ to: `/portal/releases/${release.id}` })
                }
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selected.has(release.id)}
                    onCheckedChange={() => toggleSelect(release.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {release.title || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{release.releaseType}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(
                    Number(release.created_at / BigInt(1_000_000)),
                  ).toLocaleDateString()}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDuplicate(release.id, e)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Release</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="release-title">
                  Release Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="release-title"
                  data-ocid="release.create.input"
                  placeholder="Enter release title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="release-type">Release Type</Label>
                <Select
                  value={newReleaseType}
                  onValueChange={setNewReleaseType}
                >
                  <SelectTrigger
                    id="release-type"
                    data-ocid="release.create.type_select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="EP">EP</SelectItem>
                    <SelectItem value="Album">Album</SelectItem>
                    <SelectItem value="Compilation">Compilation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="release-tracklist">
                  Tracklist{" "}
                  <span className="text-muted-foreground text-xs">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="release-tracklist"
                  data-ocid="release.create.tracklist_input"
                  placeholder="e.g. Track 1, Track 2"
                  value={newTracklist}
                  onChange={(e) => setNewTracklist(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Separate track names with commas
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="release-keydates">
                  Key Dates{" "}
                  <span className="text-muted-foreground text-xs">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="release-keydates"
                  data-ocid="release.create.keydates_input"
                  placeholder="e.g. 2026-06-01 Release Date"
                  value={newKeyDates}
                  onChange={(e) => setNewKeyDates(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Separate dates with commas
                </p>
              </div>
              <CustomFieldsSection
                sectionId="releases"
                values={customFieldValues}
                onChange={(fieldId, value) =>
                  setCustomFieldValues((prev) => ({
                    ...prev,
                    [fieldId]: value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreate(false)}
              data-ocid="release.create.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newTitle.trim() || createMutation.isPending}
              data-ocid="release.create.submit_button"
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
        entityLabel="release"
        entityLabelPlural="releases"
        isPending={deleteMutation.isPending}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
