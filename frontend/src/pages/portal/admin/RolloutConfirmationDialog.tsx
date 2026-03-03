import React, { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface RolloutConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmationText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RolloutConfirmationDialog({
  open,
  title,
  description,
  confirmationText,
  onConfirm,
  onCancel,
}: RolloutConfirmationDialogProps) {
  const [checked, setChecked] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setChecked(false);
      onCancel();
    }
  };

  const handleConfirm = () => {
    if (checked) {
      setChecked(false);
      onConfirm();
    }
  };

  const handleCancel = () => {
    setChecked(false);
    onCancel();
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4 my-2">
          <Checkbox
            id="rollout-confirm-checkbox"
            checked={checked}
            onCheckedChange={(val) => setChecked(!!val)}
            className="mt-0.5 flex-shrink-0"
          />
          <Label
            htmlFor="rollout-confirm-checkbox"
            className="text-sm leading-relaxed cursor-pointer text-foreground"
          >
            {confirmationText}
          </Label>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!checked}
            className="disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm &amp; Proceed
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
