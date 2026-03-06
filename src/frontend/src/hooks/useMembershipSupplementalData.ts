import { useCallback, useState } from "react";

const STORAGE_KEY = "higgins_membership_supplemental";

export interface MembershipSupplemental {
  phone?: string;
  role?: string;
  genre?: string;
  bio?: string;
  tier?: string;
}

type SupplementalStore = Record<string, MembershipSupplemental>;

function readStore(): SupplementalStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as SupplementalStore;
  } catch {
    return {};
  }
}

function writeStore(store: SupplementalStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage may be unavailable in some environments
  }
}

/** Pure (non-reactive) helpers — safe to call outside React components */
export function getSupplemental(id: string): MembershipSupplemental {
  return readStore()[id] ?? {};
}

export function setSupplemental(
  id: string,
  data: MembershipSupplemental,
): void {
  const store = readStore();
  store[id] = { ...store[id], ...data };
  writeStore(store);
}

/**
 * Reactive hook — returns current supplemental data for the given membership
 * and a setter that also triggers a re-render.
 */
export function useMembershipSupplementalData(id: string) {
  const [supplemental, setSupplementalState] = useState<MembershipSupplemental>(
    () => getSupplemental(id),
  );

  const update = useCallback(
    (data: MembershipSupplemental) => {
      setSupplemental(id, data);
      setSupplementalState(getSupplemental(id));
    },
    [id],
  );

  return { supplemental, update };
}
