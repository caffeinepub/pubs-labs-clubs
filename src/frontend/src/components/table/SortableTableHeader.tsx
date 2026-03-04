import { TableHead } from "@/components/ui/table";
import type { SortDirection } from "@/hooks/useTableSort";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type React from "react";

export interface SortableTableHeaderProps {
  /** Column label text — use either `label` prop or children */
  label?: string;
  children?: React.ReactNode;
  sortKey: string;
  currentSortBy: string | null;
  currentDirection: SortDirection;
  onSort: (key: string) => void;
  className?: string;
}

export default function SortableTableHeader({
  label,
  children,
  sortKey,
  currentSortBy,
  currentDirection,
  onSort,
  className,
}: SortableTableHeaderProps) {
  const isActive = currentSortBy === sortKey;
  const displayLabel = label ?? children;

  return (
    <TableHead
      className={cn("cursor-pointer select-none group", className)}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1.5">
        <span>{displayLabel}</span>
        <span
          className={cn(
            "transition-colors",
            isActive
              ? "text-foreground"
              : "text-muted-foreground/40 group-hover:text-muted-foreground/70",
          )}
        >
          {isActive ? (
            currentDirection === "asc" ? (
              <ArrowUp className="h-3.5 w-3.5" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5" />
            )
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5" />
          )}
        </span>
      </div>
    </TableHead>
  );
}
