import BulkDeleteConfirmDialog from "@/components/bulk/BulkDeleteConfirmDialog";
import CustomFieldsSection from "@/components/custom-fields/CustomFieldsSection";
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
import { Textarea } from "@/components/ui/textarea";
import {
  type RecordingProject,
  useCreateRecordingProject,
  useDeleteRecordingProject,
  useDuplicateRecordingProject,
  useGetRecordingProjects,
} from "@/hooks/useQueries";
import { useTableSort } from "@/hooks/useTableSort";
import { useNavigate } from "@tanstack/react-router";
import { Copy, Loader2, Plus, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";

export default function RecordingProjectsPage() {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useGetRecordingProjects();
  const createProject = useCreateRecordingProject();
  const deleteProjects = useDeleteRecordingProject();
  const duplicateProject = useDuplicateRecordingProject();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formStatus, setFormStatus] = useState("planned");
  const [formSessionDate, setFormSessionDate] = useState("");
  const [formParticipants, setFormParticipants] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [customFieldValues, setCustomFieldValues] = useState<
    Record<string, string>
  >({});

  const { sortedData, sortBy, sortDirection, handleSort } = useTableSort(
    projects,
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
      setSelected(new Set(sortedData.map((p) => p.id)));
    }
  };

  const handleCreate = async () => {
    if (!formTitle.trim()) return;
    try {
      await createProject.mutateAsync({
        owner: "",
        title: formTitle.trim(),
        participants: formParticipants
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
        sessionDate: formSessionDate
          ? BigInt(new Date(formSessionDate).getTime()) * BigInt(1_000_000)
          : BigInt(0),
        status: formStatus,
        notes: formNotes.trim(),
        assetReferences: [],
        linkedMembers: [],
        linkedArtists: [],
        linkedWorks: [],
        linkedReleases: [],
      });
      toast.success("Recording project created");
      setShowCreate(false);
      setFormTitle("");
      setFormStatus("planned");
      setFormSessionDate("");
      setFormParticipants("");
      setFormNotes("");
    } catch {
      toast.error("Failed to create project");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await deleteProjects.mutateAsync(Array.from(selected));
      toast.success(`Deleted ${selected.size} project(s)`);
      setSelected(new Set());
      setShowDeleteConfirm(false);
    } catch {
      toast.error("Failed to delete projects");
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await duplicateProject.mutateAsync(id);
      toast.success("Project duplicated");
    } catch {
      toast.error("Failed to duplicate project");
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
          <h1 className="text-2xl font-bold">Recording Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage recording sessions and projects.
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
            New Project
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
              sortKey="status"
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
                No recording projects yet.
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((project) => (
              <TableRow
                key={project.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() =>
                  navigate({ to: `/portal/recordings/${project.id}` })
                }
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selected.has(project.id)}
                    onCheckedChange={() => toggleSelect(project.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {project.title || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(
                    Number(project.created_at / BigInt(1_000_000)),
                  ).toLocaleDateString()}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDuplicate(project.id, e)}
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
            <DialogTitle>New Recording Project</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="rp-create-title">
                  Project Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="rp-create-title"
                  data-ocid="recording.create.input"
                  placeholder="Enter project title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rp-create-status">Status</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger
                    id="rp-create-status"
                    data-ocid="recording.create.select"
                  >
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
                <Label htmlFor="rp-create-session-date">
                  Session Date{" "}
                  <span className="text-muted-foreground text-xs">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="rp-create-session-date"
                  type="date"
                  data-ocid="recording.create.session_date_input"
                  value={formSessionDate}
                  onChange={(e) => setFormSessionDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rp-create-participants">
                  Participants{" "}
                  <span className="text-muted-foreground text-xs">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="rp-create-participants"
                  data-ocid="recording.create.participants_input"
                  placeholder="e.g. Producer, Engineer"
                  value={formParticipants}
                  onChange={(e) => setFormParticipants(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Separate names or roles with commas
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rp-create-notes">
                  Notes{" "}
                  <span className="text-muted-foreground text-xs">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="rp-create-notes"
                  data-ocid="recording.create.textarea"
                  placeholder="Additional notes..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <CustomFieldsSection
                sectionId="recordings"
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
              data-ocid="recording.create.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formTitle.trim() || createProject.isPending}
              data-ocid="recording.create.submit_button"
            >
              {createProject.isPending ? (
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
        entityLabel="recording project"
        entityLabelPlural="recording projects"
        isPending={deleteProjects.isPending}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
