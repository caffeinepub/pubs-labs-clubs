import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { TableHead } from '@/components/ui/table';
import type { SortDirection } from '@/hooks/useTableSort';
import { cn } from '@/lib/utils';

interface SortableTableHeaderProps {
  label: string;
  sortKey: string;
  currentSortBy: string | null;
  currentDirection: SortDirection;
  onSort: (key: string) => void;
  className?: string;
}

export default function SortableTableHeader({
  label,
  sortKey,
  currentSortBy,
  currentDirection,
  onSort,
  className,
}: SortableTableHeaderProps) {
  const isActive = currentSortBy === sortKey;

  return (
    <TableHead
      className={cn('cursor-pointer select-none group', className)}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1.5">
        <span>{label}</span>
        <span
          className={cn(
            'transition-colors',
            isActive ? 'text-foreground' : 'text-muted-foreground/40 group-hover:text-muted-foreground/70'
          )}
        >
          {isActive ? (
            currentDirection === 'asc' ? (
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
