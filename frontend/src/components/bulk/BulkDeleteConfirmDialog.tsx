import React from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

interface BulkDeleteConfirmDialogProps {
  open: boolean;
  count: number;
  entityType: string;
  entityTypePlural?: string;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function BulkDeleteConfirmDialog({
  open,
  count,
  entityType,
  entityTypePlural,
  isPending = false,
  onCancel,
  onConfirm,
}: BulkDeleteConfirmDialogProps) {
  const plural = entityTypePlural ?? `${entityType}s`;
  const label = count === 1 ? entityType : plural;

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!v && !isPending) onCancel(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete {count} {label}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            You are about to permanently delete{' '}
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
