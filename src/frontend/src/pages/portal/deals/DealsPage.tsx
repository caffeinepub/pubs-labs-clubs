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
  type Deal,
  useCreateDeal,
  useDeleteDeal,
  useDuplicateDeal,
  useGetDeals,
} from "@/hooks/useQueries";
import { useTableSort } from "@/hooks/useTableSort";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Copy,
  Download,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";

const DEAL_TYPES = [
  "Recording",
  "Publishing",
  "Co-Publishing",
  "Distribution",
  "Sync",
  "Other",
];

const DEAL_STATUSES = [
  "Draft",
  "Negotiation",
  "Executed",
  "Active",
  "Expired",
  "Renewed",
  "Terminated",
];

function dealStatusClass(status: string): string {
  switch (status) {
    case "Active":
      return "bg-green-500/15 text-green-600 border-green-500/30 dark:text-green-400";
    case "Renewed":
      return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400";
    case "Executed":
      return "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400";
    case "Negotiation":
      return "bg-yellow-500/15 text-yellow-700 border-yellow-500/30 dark:text-yellow-400";
    case "Expired":
    case "Terminated":
      return "bg-destructive/15 text-destructive border-destructive/30";
    default:
      return "";
  }
}

function exportToCsv(deals: Deal[]): void {
  const headers = [
    "Title",
    "Deal Type",
    "Parties",
    "Advance Amount",
    "Royalty Rate",
    "Territory",
    "Status",
    "Start Date",
    "End Date",
  ];
  const rows = deals.map((d) => [
    d.title,
    d.dealType,
    d.parties,
    String(Number(d.advanceAmount)),
    d.royaltyRate,
    d.territory,
    d.status,
    d.startDate,
    d.endDate,
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${c}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "deals.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function DealsPage() {
  const navigate = useNavigate();
  const { data: deals = [], isLoading } = useGetDeals();
  const createDeal = useCreateDeal();
  const deleteDeal = useDeleteDeal();
  const duplicateDeal = useDuplicateDeal();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [search, setSearch] = useState("");

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newDealType, setNewDealType] = useState("Recording");
  const [newParties, setNewParties] = useState("");
  const [newAdvanceAmount, setNewAdvanceAmount] = useState("");
  const [newRoyaltyRate, setNewRoyaltyRate] = useState("");
  const [newTerritory, setNewTerritory] = useState("");
  const [newTermLength, setNewTermLength] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newOptionPeriods, setNewOptionPeriods] = useState("");
  const [newStatus, setNewStatus] = useState("Draft");
  const [newNotes, setNewNotes] = useState("");
  const [newContractDocUrl, setNewContractDocUrl] = useState("");
  const [customFieldValues, setCustomFieldValues] = useState<
    Record<string, string>
  >({});

  const filtered = deals.filter(
    (d) =>
      !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.parties.toLowerCase().includes(search.toLowerCase()) ||
      d.dealType.toLowerCase().includes(search.toLowerCase()),
  );

  const { sortedData, sortBy, sortDirection, handleSort } = useTableSort(
    filtered,
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
      setSelected(new Set(sortedData.map((d) => d.id)));
    }
  };

  const resetCreateForm = () => {
    setNewTitle("");
    setNewDealType("Recording");
    setNewParties("");
    setNewAdvanceAmount("");
    setNewRoyaltyRate("");
    setNewTerritory("");
    setNewTermLength("");
    setNewStartDate("");
    setNewEndDate("");
    setNewOptionPeriods("");
    setNewStatus("Draft");
    setNewNotes("");
    setNewContractDocUrl("");
    setCustomFieldValues({});
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      await createDeal.mutateAsync({
        title: newTitle.trim(),
        dealType: newDealType,
        parties: newParties.trim(),
        advanceAmount: BigInt(Number(newAdvanceAmount) || 0),
        royaltyRate: newRoyaltyRate.trim(),
        territory: newTerritory.trim(),
        termLength: newTermLength.trim(),
        startDate: newStartDate,
        endDate: newEndDate,
        optionPeriods: newOptionPeriods.trim(),
        status: newStatus,
        notes: newNotes.trim(),
        contractDocUrl: newContractDocUrl.trim(),
        linkedMembers: [],
        linkedArtists: [],
      });
      toast.success("Deal created");
      setShowCreate(false);
      resetCreateForm();
    } catch {
      toast.error("Failed to create deal");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await deleteDeal.mutateAsync(Array.from(selected));
      toast.success(`Deleted ${selected.size} deal(s)`);
      setSelected(new Set());
      setShowDeleteConfirm(false);
    } catch {
      toast.error("Failed to delete deals");
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await duplicateDeal.mutateAsync(id);
      toast.success("Deal duplicated");
    } catch {
      toast.error("Failed to duplicate deal");
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
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deals</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage recording contracts, publishing agreements, and licensing
            deals.
          </p>
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              data-ocid="deals.bulk_delete_button"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete ({selected.size})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCsv(deals)}
            data-ocid="deals.export_button"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
            data-ocid="deals.create_button"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Deal
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 items-center">
        <Input
          placeholder="Search by title, parties, or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
          data-ocid="deals.search_input"
        />
        {search && (
          <Button variant="ghost" size="sm" onClick={() => setSearch("")}>
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={
                  selected.size === sortedData.length && sortedData.length > 0
                }
                onCheckedChange={toggleSelectAll}
                data-ocid="deals.select_all_checkbox"
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
              sortKey="dealType"
              currentSortBy={sortBy}
              currentDirection={sortDirection}
              onSort={handleSort}
              label="Type"
            />
            <SortableTableHeader
              sortKey="parties"
              currentSortBy={sortBy}
              currentDirection={sortDirection}
              onSort={handleSort}
              label="Parties"
            />
            <SortableTableHeader
              sortKey="advanceAmount"
              currentSortBy={sortBy}
              currentDirection={sortDirection}
              onSort={handleSort}
              label="Advance"
            />
            <SortableTableHeader
              sortKey="status"
              currentSortBy={sortBy}
              currentDirection={sortDirection}
              onSort={handleSort}
              label="Status"
            />
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground py-12"
              >
                {search
                  ? "No deals match your search."
                  : "No deals yet — create your first deal to get started."}
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((deal) => (
              <TableRow
                key={deal.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate({ to: `/portal/deals/${deal.id}` })}
                data-ocid="deals.list_row"
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selected.has(deal.id)}
                    onCheckedChange={() => toggleSelect(deal.id)}
                    data-ocid="deals.row_checkbox"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {deal.title || "—"}
                    {deal.optionPeriods && deal.status === "Active" && (
                      <span title="Has option periods">
                        <AlertCircle
                          className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0"
                          aria-label="Has option periods"
                        />
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {deal.dealType}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                  {deal.parties || "—"}
                </TableCell>
                <TableCell className="text-sm font-mono">
                  {Number(deal.advanceAmount) > 0
                    ? `$${Number(deal.advanceAmount).toLocaleString()}`
                    : "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={dealStatusClass(deal.status)}
                  >
                    {deal.status}
                  </Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDuplicate(deal.id, e)}
                    title="Duplicate"
                    data-ocid="deals.duplicate_button"
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
            <DialogTitle>New Deal</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="deal-create-title">
                  Deal Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="deal-create-title"
                  data-ocid="deals.create.title_input"
                  placeholder="e.g. Recording Agreement — Artist Name"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="deal-create-type">Deal Type</Label>
                  <Select value={newDealType} onValueChange={setNewDealType}>
                    <SelectTrigger
                      id="deal-create-type"
                      data-ocid="deals.create.type_select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEAL_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="deal-create-status">Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger
                      id="deal-create-status"
                      data-ocid="deals.create.status_select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEAL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deal-create-parties">Parties Involved</Label>
                <Input
                  id="deal-create-parties"
                  data-ocid="deals.create.parties_input"
                  placeholder="e.g. Higgins Music, Artist Name"
                  value={newParties}
                  onChange={(e) => setNewParties(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="deal-create-advance">
                    Advance Amount ($)
                  </Label>
                  <Input
                    id="deal-create-advance"
                    data-ocid="deals.create.advance_input"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={newAdvanceAmount}
                    onChange={(e) => setNewAdvanceAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="deal-create-royalty">Royalty Rate</Label>
                  <Input
                    id="deal-create-royalty"
                    data-ocid="deals.create.royalty_input"
                    placeholder="e.g. 15% or $0.12/unit"
                    value={newRoyaltyRate}
                    onChange={(e) => setNewRoyaltyRate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="deal-create-territory">Territory</Label>
                  <Input
                    id="deal-create-territory"
                    data-ocid="deals.create.territory_input"
                    placeholder="e.g. Worldwide"
                    value={newTerritory}
                    onChange={(e) => setNewTerritory(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="deal-create-term">Term Length</Label>
                  <Input
                    id="deal-create-term"
                    data-ocid="deals.create.term_input"
                    placeholder="e.g. 2 years"
                    value={newTermLength}
                    onChange={(e) => setNewTermLength(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="deal-create-start">Start Date</Label>
                  <Input
                    id="deal-create-start"
                    data-ocid="deals.create.start_input"
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="deal-create-end">End Date</Label>
                  <Input
                    id="deal-create-end"
                    data-ocid="deals.create.end_input"
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deal-create-options">
                  Option Periods{" "}
                  <span className="text-muted-foreground text-xs">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="deal-create-options"
                  data-ocid="deals.create.options_input"
                  placeholder="e.g. 3 × 1-year options"
                  value={newOptionPeriods}
                  onChange={(e) => setNewOptionPeriods(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deal-create-contract">
                  Contract Document URL{" "}
                  <span className="text-muted-foreground text-xs">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="deal-create-contract"
                  data-ocid="deals.create.contract_input"
                  placeholder="https://..."
                  value={newContractDocUrl}
                  onChange={(e) => setNewContractDocUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deal-create-notes">
                  Notes{" "}
                  <span className="text-muted-foreground text-xs">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="deal-create-notes"
                  data-ocid="deals.create.notes_textarea"
                  placeholder="Internal notes, key terms, context..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <CustomFieldsSection
                sectionId="deals"
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
              onClick={() => {
                setShowCreate(false);
                resetCreateForm();
              }}
              data-ocid="deals.create.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newTitle.trim() || createDeal.isPending}
              data-ocid="deals.create.submit_button"
            >
              {createDeal.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Create Deal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirm */}
      <BulkDeleteConfirmDialog
        open={showDeleteConfirm}
        count={selected.size}
        entityLabel="deal"
        entityLabelPlural="deals"
        isPending={deleteDeal.isPending}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
