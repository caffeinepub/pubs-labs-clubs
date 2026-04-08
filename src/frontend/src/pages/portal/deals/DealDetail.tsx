import CommentsSection from "@/components/comments/CommentsSection";
import ChangeHistoryPanel from "@/components/history/ChangeHistoryPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Edit2,
  ExternalLink,
  Loader2,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type Deal,
  useDeleteDeal,
  useGetDeals,
  useUpdateDeal,
} from "../../../hooks/useQueries";

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

interface EditState {
  title: string;
  dealType: string;
  parties: string;
  advanceAmount: string;
  royaltyRate: string;
  territory: string;
  termLength: string;
  startDate: string;
  endDate: string;
  optionPeriods: string;
  status: string;
  notes: string;
  contractDocUrl: string;
}

function dealToEditState(deal: Deal): EditState {
  return {
    title: deal.title,
    dealType: deal.dealType,
    parties: deal.parties,
    advanceAmount: String(Number(deal.advanceAmount)),
    royaltyRate: deal.royaltyRate,
    territory: deal.territory,
    termLength: deal.termLength,
    startDate: deal.startDate,
    endDate: deal.endDate,
    optionPeriods: deal.optionPeriods,
    status: deal.status,
    notes: deal.notes,
    contractDocUrl: deal.contractDocUrl,
  };
}

export default function DealDetail() {
  const { id } = useParams({ from: "/portal/deals/$id" });
  const navigate = useNavigate();

  const { data: deals = [] } = useGetDeals();
  const updateDeal = useUpdateDeal();
  const deleteDeal = useDeleteDeal();

  const deal = deals.find((d) => d.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [edit, setEdit] = useState<EditState | null>(null);

  useEffect(() => {
    if (deal) {
      setEdit(dealToEditState(deal));
    }
  }, [deal]);

  const setField = (key: keyof EditState, value: string) => {
    setEdit((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    if (!deal || !edit) return;
    try {
      await updateDeal.mutateAsync({
        dealId: deal.id,
        updates: {
          title: edit.title,
          dealType: edit.dealType,
          parties: edit.parties,
          advanceAmount: BigInt(Number(edit.advanceAmount) || 0),
          royaltyRate: edit.royaltyRate,
          territory: edit.territory,
          termLength: edit.termLength,
          startDate: edit.startDate,
          endDate: edit.endDate,
          optionPeriods: edit.optionPeriods,
          status: edit.status,
          notes: edit.notes,
          contractDocUrl: edit.contractDocUrl,
        },
      });
      toast.success("Deal updated");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update deal");
    }
  };

  const handleDelete = async () => {
    if (!deal) return;
    try {
      await deleteDeal.mutateAsync([deal.id]);
      toast.success("Deal deleted");
      navigate({ to: "/portal/deals" });
    } catch {
      toast.error("Failed to delete deal");
    }
  };

  if (!deal || !edit) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasOptionAlert = deal.optionPeriods && deal.status === "Active";

  return (
    <div className="space-y-6 max-w-3xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/portal/deals" })}
          aria-label="Back to Deals"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold truncate">
              {deal.title || "Deal"}
            </h1>
            <Badge variant="outline" className={dealStatusClass(deal.status)}>
              {deal.status}
            </Badge>
            {hasOptionAlert && (
              <Badge
                variant="outline"
                className="bg-yellow-500/15 text-yellow-700 border-yellow-500/30 dark:text-yellow-400 flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                Option Periods
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {deal.id}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {isEditing ? (
            <>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateDeal.isPending}
                data-ocid="deals.detail.save_button"
              >
                {updateDeal.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEdit(dealToEditState(deal));
                }}
                data-ocid="deals.detail.cancel_button"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
                data-ocid="deals.detail.edit_button"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteDeal.isPending}
                data-ocid="deals.detail.delete_button"
              >
                {deleteDeal.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1" />
                )}
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Option Period Alert Banner */}
      {hasOptionAlert && !isEditing && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg border bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>
            <strong>Option Periods:</strong> {deal.optionPeriods}
          </span>
        </div>
      )}

      {/* Deal Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Deal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {isEditing ? (
            <>
              <div>
                <label
                  htmlFor="deal-edit-title"
                  className="text-sm font-medium"
                >
                  Title
                </label>
                <Input
                  id="deal-edit-title"
                  className="mt-1"
                  value={edit.title}
                  onChange={(e) => setField("title", e.target.value)}
                  data-ocid="deals.detail.title_input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="deal-edit-type"
                    className="text-sm font-medium"
                  >
                    Deal Type
                  </label>
                  <Select
                    value={edit.dealType}
                    onValueChange={(v) => setField("dealType", v)}
                  >
                    <SelectTrigger
                      id="deal-edit-type"
                      className="mt-1"
                      data-ocid="deals.detail.type_select"
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
                <div>
                  <label
                    htmlFor="deal-edit-status"
                    className="text-sm font-medium"
                  >
                    Status
                  </label>
                  <Select
                    value={edit.status}
                    onValueChange={(v) => setField("status", v)}
                  >
                    <SelectTrigger
                      id="deal-edit-status"
                      className="mt-1"
                      data-ocid="deals.detail.status_select"
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

              <div>
                <label
                  htmlFor="deal-edit-parties"
                  className="text-sm font-medium"
                >
                  Parties Involved
                </label>
                <Input
                  id="deal-edit-parties"
                  className="mt-1"
                  value={edit.parties}
                  onChange={(e) => setField("parties", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="deal-edit-advance"
                    className="text-sm font-medium"
                  >
                    Advance Amount ($)
                  </label>
                  <Input
                    id="deal-edit-advance"
                    className="mt-1"
                    type="number"
                    min="0"
                    value={edit.advanceAmount}
                    onChange={(e) => setField("advanceAmount", e.target.value)}
                    data-ocid="deals.detail.advance_input"
                  />
                </div>
                <div>
                  <label
                    htmlFor="deal-edit-royalty"
                    className="text-sm font-medium"
                  >
                    Royalty Rate
                  </label>
                  <Input
                    id="deal-edit-royalty"
                    className="mt-1"
                    placeholder="e.g. 15%"
                    value={edit.royaltyRate}
                    onChange={(e) => setField("royaltyRate", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="deal-edit-territory"
                    className="text-sm font-medium"
                  >
                    Territory
                  </label>
                  <Input
                    id="deal-edit-territory"
                    className="mt-1"
                    value={edit.territory}
                    onChange={(e) => setField("territory", e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="deal-edit-term"
                    className="text-sm font-medium"
                  >
                    Term Length
                  </label>
                  <Input
                    id="deal-edit-term"
                    className="mt-1"
                    value={edit.termLength}
                    onChange={(e) => setField("termLength", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="deal-edit-start"
                    className="text-sm font-medium"
                  >
                    Start Date
                  </label>
                  <Input
                    id="deal-edit-start"
                    className="mt-1"
                    type="date"
                    value={edit.startDate}
                    onChange={(e) => setField("startDate", e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="deal-edit-end"
                    className="text-sm font-medium"
                  >
                    End Date
                  </label>
                  <Input
                    id="deal-edit-end"
                    className="mt-1"
                    type="date"
                    value={edit.endDate}
                    onChange={(e) => setField("endDate", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="deal-edit-options"
                  className="text-sm font-medium"
                >
                  Option Periods
                </label>
                <Input
                  id="deal-edit-options"
                  className="mt-1"
                  placeholder="e.g. 3 × 1-year options"
                  value={edit.optionPeriods}
                  onChange={(e) => setField("optionPeriods", e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="deal-edit-contract"
                  className="text-sm font-medium"
                >
                  Contract Document URL
                </label>
                <Input
                  id="deal-edit-contract"
                  className="mt-1"
                  placeholder="https://..."
                  value={edit.contractDocUrl}
                  onChange={(e) => setField("contractDocUrl", e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="deal-edit-notes"
                  className="text-sm font-medium"
                >
                  Notes
                </label>
                <Textarea
                  id="deal-edit-notes"
                  className="mt-1"
                  rows={4}
                  value={edit.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Deal Type
                  </p>
                  <p className="mt-1 font-medium">{deal.dealType || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Status
                  </p>
                  <Badge
                    variant="outline"
                    className={`mt-1 ${dealStatusClass(deal.status)}`}
                  >
                    {deal.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  Parties Involved
                </p>
                <p className="mt-1">{deal.parties || "—"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Advance Amount
                  </p>
                  <p className="mt-1 font-mono font-semibold text-lg">
                    {Number(deal.advanceAmount) > 0
                      ? `$${Number(deal.advanceAmount).toLocaleString()}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Royalty Rate
                  </p>
                  <p className="mt-1">{deal.royaltyRate || "—"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Territory
                  </p>
                  <p className="mt-1">{deal.territory || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Term Length
                  </p>
                  <p className="mt-1">{deal.termLength || "—"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Start Date
                  </p>
                  <p className="mt-1">{deal.startDate || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    End Date
                  </p>
                  <p className="mt-1">{deal.endDate || "—"}</p>
                </div>
              </div>

              {deal.optionPeriods && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Option Periods
                  </p>
                  <p className="mt-1">{deal.optionPeriods}</p>
                </div>
              )}

              {deal.contractDocUrl && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Contract Document
                  </p>
                  <a
                    href={deal.contractDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    data-ocid="deals.detail.contract_link"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Contract
                  </a>
                </div>
              )}

              {deal.notes && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Notes
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">
                    {deal.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related Members */}
      {deal.linkedMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Linked Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {deal.linkedMembers.map((m) => (
                <Badge key={m} variant="secondary">
                  {m}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Artists */}
      {deal.linkedArtists.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Linked Artists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {deal.linkedArtists.map((a) => (
                <Badge key={a} variant="secondary">
                  {a}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ChangeHistoryPanel recordId={id} />

      <CommentsSection recordId={id} />
    </div>
  );
}
