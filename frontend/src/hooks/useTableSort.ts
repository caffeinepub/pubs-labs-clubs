import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface TableSortState {
  sortBy: string | null;
  sortDirection: SortDirection;
}

export interface UseTableSortResult<T> {
  sortBy: string | null;
  sortDirection: SortDirection;
  handleSort: (key: string) => void;
  sortedData: T[];
}

function getNestedValue(obj: unknown, key: string): unknown {
  if (obj === null || obj === undefined) return null;
  const record = obj as Record<string, unknown>;
  if (key in record) return record[key];
  // Support dot notation for nested fields
  const parts = key.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return null;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function compareValues(a: unknown, b: unknown, direction: SortDirection): number {
  // Handle null/undefined
  if (a === null || a === undefined) return direction === 'asc' ? 1 : -1;
  if (b === null || b === undefined) return direction === 'asc' ? -1 : 1;

  // Handle bigint (timestamps from backend)
  if (typeof a === 'bigint' && typeof b === 'bigint') {
    const diff = a < b ? -1 : a > b ? 1 : 0;
    return direction === 'asc' ? diff : -diff;
  }

  // Handle numbers
  if (typeof a === 'number' && typeof b === 'number') {
    return direction === 'asc' ? a - b : b - a;
  }

  // Handle arrays (sort by length or first element)
  if (Array.isArray(a) && Array.isArray(b)) {
    const aStr = a.length > 0 ? String(a[0]) : '';
    const bStr = b.length > 0 ? String(b[0]) : '';
    const cmp = aStr.localeCompare(bStr, undefined, { sensitivity: 'base' });
    return direction === 'asc' ? cmp : -cmp;
  }

  // Default: string comparison
  const aStr = String(a).toLowerCase();
  const bStr = String(b).toLowerCase();
  const cmp = aStr.localeCompare(bStr, undefined, { sensitivity: 'base' });
  return direction === 'asc' ? cmp : -cmp;
}

export function useTableSort<T>(data: T[]): UseTableSortResult<T> {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortBy) return data;
    return [...data].sort((a, b) => {
      const aVal = getNestedValue(a, sortBy);
      const bVal = getNestedValue(b, sortBy);
      return compareValues(aVal, bVal, sortDirection);
    });
  }, [data, sortBy, sortDirection]);

  return { sortBy, sortDirection, handleSort, sortedData };
}
