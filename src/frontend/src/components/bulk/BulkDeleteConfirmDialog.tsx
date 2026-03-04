import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
import React from "react";

export interface BulkDeleteConfirmDialogProps {
  open: boolean;
  // Support both naming conventions
  entityType?: string;
  entityTypePlural?: string;
  entityLabel?: string;
  entityLabelPlural?: string;
  count: number;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function BulkDeleteConfirmDialog({
  open,
  entityType,
  entityTypePlural,
  entityLabel,
  entityLabelPlural,
  count,
  isPending = false,
  onCancel,
  onConfirm,
}: BulkDeleteConfirmDialogProps) {
  // Support both naming conventions
  const singularLabel = entityLabel ?? entityType ?? "item";
  const pluralLabel =
    entityLabelPlural ?? entityTypePlural ?? `${singularLabel}s`;
  const label = count === 1 ? singularLabel : pluralLabel;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !isPending) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete {count} {label}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            You are about to permanently delete{" "}
            <span className="font-semibold text-foreground">
              {count} {label}
            </span>
            . This action cannot be undone and the records will be lost forever.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
