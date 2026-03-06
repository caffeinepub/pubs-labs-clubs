import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Copy, Loader2, Plus, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import type { Membership, MembershipProfile } from "../../../backend";
import BulkDeleteConfirmDialog from "../../../components/bulk/BulkDeleteConfirmDialog";
import CustomFieldsSection from "../../../components/custom-fields/CustomFieldsSection";
import SortableTableHeader from "../../../components/table/SortableTableHeader";
import { useActor } from "../../../hooks/useActor";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import {
  getSupplemental,
  setSupplemental,
} from "../../../hooks/useMembershipSupplementalData";
import {
  useBulkDeleteMembershipProfiles,
  useCreateMembership,
  useDuplicateMembership,
  useGetAllMembershipProfiles,
  useGetCallerMemberships,
} from "../../../hooks/useQueries";
import { useTableSort } from "../../../hooks/useTableSort";

export default function MembershipsPage() {
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();
  const { isFetching: actorFetching } = useActor();

  const { data: callerMemberships = [], isLoading: loadingCaller } =
    useGetCallerMemberships();
  const { data: allProfiles = [], isLoading: loadingAll } =
    useGetAllMembershipProfiles();

  const createMutation = useCreateMembership();
  const bulkDeleteMutation = useBulkDeleteMembershipProfiles();
  const duplicateMutation = useDuplicateMembership();

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newTier, setNewTier] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newGenre, setNewGenre] = useState("");
  const [newBio, setNewBio] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [customFieldValues, setCustomFieldValues] = useState<
    Record<string, string>
  >({});

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const profiles: MembershipProfile[] = isAdmin
    ? allProfiles
    : (callerMemberships as Membership[]).map((m) => m.profile);

  const { sortedData, sortBy, sortDirection, handleSort } = useTableSort(
    profiles,
    "created_at",
    "desc",
  );

  const isLoading = loadingCaller || loadingAll;

  const resetCreateForm = () => {
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setNewTier("");
    setNewRole("");
    setNewGenre("");
    setNewBio("");
    setCreateError(null);
    setCustomFieldValues({});
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    if (actorFetching) {
      setCreateError(
        "The system is still initializing. Please wait a moment and try again.",
      );
      return;
    }
    setCreateError(null);
    try {
      const id = `mem-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      await createMutation.mutateAsync({
        id,
        name: newName.trim(),
        email: newEmail.trim(),
      });
      // Persist supplemental profile data to localStorage
      if (newPhone || newTier || newRole || newGenre || newBio) {
        setSupplemental(id, {
          phone: newPhone.trim() || undefined,
          tier: newTier || undefined,
          role: newRole || undefined,
          genre: newGenre.trim() || undefined,
          bio: newBio.trim() || undefined,
        });
      }
      setCreateOpen(false);
      resetCreateForm();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create membership.";
      setCreateError(
        message.includes("Actor not available")
          ? "The system is still initializing. Please wait a moment and try again."
          : message,
      );
    }
  };

  const handleBulkDelete = async () => {
    if (actorFetching) {
      setPageError(
        "The system is still initializing. Please wait a moment and try again.",
      );
      setBulkDeleteOpen(false);
      return;
    }
    setPageError(null);
    try {
      await bulkDeleteMutation.mutateAsync(Array.from(selectedIds));
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete memberships.";
      setPageError(
        message.includes("Actor not available")
          ? "The system is still initializing. Please wait a moment and try again."
          : message,
      );
      setBulkDeleteOpen(false);
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (actorFetching) {
      setPageError(
        "The system is still initializing. Please wait a moment and try again.",
      );
      return;
    }
    setPageError(null);
    try {
      await duplicateMutation.mutateAsync(id);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to duplicate membership.";
      setPageError(
        message.includes("Actor not available")
          ? "The system is still initializing. Please wait a moment and try again."
          : message,
      );
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedData.map((p) => p.id)));
    }
  };

  const statusColor: Record<
    string,
    "default" | "secondary" | "outline" | "destructive"
  > = {
    active: "default",
    applicant: "secondary",
    paused: "outline",
    inactive: "destructive",
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Memberships</h1>
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
              disabled={actorFetching || bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete ({selectedIds.size})
            </Button>
          )}
          <Button
            onClick={() => {
              resetCreateForm();
              setCreateOpen(true);
            }}
            disabled={actorFetching}
          >
            {actorFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            New Membership
          </Button>
        </div>
      </div>

      {pageError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{pageError}</AlertDescription>
        </Alert>
      )}

      {actorFetching && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Initializing connection to the network…
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={
                      sortedData.length > 0 &&
                      selectedIds.size === sortedData.length
                    }
                    onCheckedChange={toggleSelectAll}
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
                <SortableTableHeader
                  label="Created"
                  sortKey="created_at"
                  currentSortBy={sortBy}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No memberships found. Create your first one!
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((profile) => (
                  <TableRow
                    key={profile.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      navigate({ to: `/portal/memberships/${profile.id}` })
                    }
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(profile.id)}
                        onCheckedChange={() => toggleSelect(profile.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {profile.name}
                    </TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          statusColor[profile.status as string] ?? "secondary"
                        }
                      >
                        {profile.status as string}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getSupplemental(profile.id).tier ?? profile.tier}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(
                        Number(profile.created_at) / 1_000_000,
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDuplicate(profile.id, e)}
                        disabled={actorFetching || duplicateMutation.isPending}
                        title="Duplicate"
                      >
                        {duplicateMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!open) resetCreateForm();
          setCreateOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Membership</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {createError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1">
              <Label htmlFor="member-name">Name</Label>
              <Input
                id="member-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Member name"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                data-ocid="membership.name.input"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="member-email">Email</Label>
              <Input
                id="member-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="member@example.com"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                data-ocid="membership.input"
              />
            </div>

            {/* Additional Details */}
            <div className="pt-1">
              <Separator className="mb-3" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Additional Details
              </p>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="member-phone">Phone</Label>
                  <Input
                    id="member-phone"
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 000-0000"
                    data-ocid="membership.phone.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="member-tier">Member Tier</Label>
                  <Select value={newTier} onValueChange={setNewTier}>
                    <SelectTrigger
                      id="member-tier"
                      data-ocid="membership.tier.select"
                    >
                      <SelectValue placeholder="Select tier…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Artist">Artist</SelectItem>
                      <SelectItem value="Publishing">Publishing</SelectItem>
                      <SelectItem value="Label">Label</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="member-role">Primary Role</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger
                      id="member-role"
                      data-ocid="membership.role.select"
                    >
                      <SelectValue placeholder="Select role…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Artist">Artist</SelectItem>
                      <SelectItem value="Producer">Producer</SelectItem>
                      <SelectItem value="Songwriter">Songwriter</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Executive">Executive</SelectItem>
                      <SelectItem value="A&R">A&R</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="member-genre">Genre / Discipline</Label>
                  <Input
                    id="member-genre"
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    placeholder="e.g. Hip-Hop, R&B, Classical"
                    data-ocid="membership.genre.input"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="member-bio">Bio</Label>
                  <Textarea
                    id="member-bio"
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value.slice(0, 500))}
                    placeholder="Short bio for this member"
                    rows={3}
                    data-ocid="membership.bio.textarea"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {newBio.length} / 500
                  </p>
                </div>
              </div>
            </div>

            <CustomFieldsSection
              sectionId="memberships"
              values={customFieldValues}
              onChange={(fieldId, value) =>
                setCustomFieldValues((prev) => ({ ...prev, [fieldId]: value }))
              }
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              data-ocid="membership.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                !newName.trim() || createMutation.isPending || actorFetching
              }
              data-ocid="membership.submit_button"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : actorFetching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing…
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BulkDeleteConfirmDialog
        open={bulkDeleteOpen}
        count={selectedIds.size}
        entityLabel="membership"
        entityLabelPlural="memberships"
        isPending={bulkDeleteMutation.isPending}
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
