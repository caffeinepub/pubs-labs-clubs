import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | "created"
  | "updated"
  | "deleted"
  | "linked"
  | "commented";

export type NotificationSection =
  | "memberships"
  | "publishing"
  | "releases"
  | "recordings"
  | "artists";

export interface NotificationEntry {
  id: string;
  type: NotificationType;
  section: NotificationSection;
  recordTitle: string;
  timestamp: number;
  isRead: boolean;
}

export interface NotificationsContextValue {
  notifications: NotificationEntry[];
  unreadCount: number;
  addNotification: (
    entry: Omit<NotificationEntry, "id" | "timestamp" | "isRead">,
  ) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "higgins_notifications";
const MAX_NOTIFICATIONS = 50;

function loadFromStorage(): NotificationEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as NotificationEntry[];
  } catch {
    return [];
  }
}

function saveToStorage(entries: NotificationEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function generateId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] =
    useState<NotificationEntry[]>(loadFromStorage);

  const addNotification = useCallback(
    (entry: Omit<NotificationEntry, "id" | "timestamp" | "isRead">) => {
      setNotifications((prev) => {
        const newEntry: NotificationEntry = {
          ...entry,
          id: generateId(),
          timestamp: Date.now(),
          isRead: false,
        };
        const updated = [newEntry, ...prev].slice(0, MAX_NOTIFICATIONS);
        saveToStorage(updated);
        return updated;
      });
    },
    [],
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    saveToStorage([]);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAllRead,
      clearAll,
    }),
    [notifications, unreadCount, addNotification, markAllRead, clearAll],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      "useNotificationsContext must be used within a NotificationsProvider",
    );
  }
  return ctx;
}
