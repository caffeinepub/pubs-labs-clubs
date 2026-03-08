import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";
import { useState } from "react";
import type {
  NotificationEntry,
  NotificationSection,
  NotificationType,
} from "../../contexts/NotificationsContext";
import { useNotifications } from "../../hooks/useNotifications";

// ─── Helper functions ─────────────────────────────────────────────────────────

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 30) return "just now";
  if (minutes < 1) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

const TYPE_DOT_COLORS: Record<NotificationType, string> = {
  created: "bg-emerald-500",
  updated: "bg-blue-500",
  deleted: "bg-red-500",
  linked: "bg-purple-500",
  commented: "bg-yellow-500",
};

const SECTION_LABELS: Record<NotificationSection, string> = {
  memberships: "Membership",
  publishing: "Publishing",
  releases: "Release",
  recordings: "Recording",
  artists: "Artist Dev",
};

const SECTION_BADGE_COLORS: Record<NotificationSection, string> = {
  memberships: "bg-indigo-500/15 text-indigo-400",
  publishing: "bg-amber-500/15 text-amber-400",
  releases: "bg-pink-500/15 text-pink-400",
  recordings: "bg-cyan-500/15 text-cyan-400",
  artists: "bg-emerald-500/15 text-emerald-400",
};

function getActionText(
  type: NotificationType,
  section: NotificationSection,
  title: string,
): string {
  const sectionLabel = SECTION_LABELS[section];
  switch (type) {
    case "created":
      return `${sectionLabel} '${title}' created`;
    case "updated":
      return `${sectionLabel} '${title}' updated`;
    case "deleted":
      return `${sectionLabel} '${title}' deleted`;
    case "linked":
      return `${sectionLabel} '${title}' linked`;
    case "commented":
      return `Comment added on '${title}'`;
    default:
      return `${sectionLabel} '${title}' ${type}`;
  }
}

// ─── Notification Row ─────────────────────────────────────────────────────────

function NotificationRow({
  notification,
}: { notification: NotificationEntry }) {
  return (
    <div
      className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors ${
        !notification.isRead ? "bg-primary/5" : "hover:bg-accent/30"
      }`}
    >
      {/* Type dot */}
      <div className="flex-shrink-0 mt-1.5">
        <span
          className={`inline-block w-2 h-2 rounded-full ${TYPE_DOT_COLORS[notification.type]}`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span
            className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ${SECTION_BADGE_COLORS[notification.section]}`}
          >
            {SECTION_LABELS[notification.section]}
          </span>
          {!notification.isRead && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-foreground leading-snug line-clamp-2">
          {getActionText(
            notification.type,
            notification.section,
            notification.recordTitle,
          )}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {formatRelativeTime(notification.timestamp)}
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, clearAll } =
    useNotifications();

  const recentNotifications = notifications.slice(0, 20);

  const handleMarkAllRead = () => {
    markAllRead();
  };

  const handleClearAll = () => {
    clearAll();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
          data-ocid="notifications.open_modal_button"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[9px] font-bold bg-red-500 text-white border-0 flex items-center justify-center leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="right"
        sideOffset={8}
        className="w-80 p-0 shadow-xl"
        data-ocid="notifications.panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell size={14} className="text-muted-foreground" />
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <Badge className="h-4 px-1 text-[9px] bg-red-500 text-white border-0">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[11px] text-muted-foreground hover:text-foreground px-2"
              onClick={handleMarkAllRead}
              data-ocid="notifications.mark_all_read_button"
            >
              Mark all read
            </Button>
          )}
        </div>

        {/* Notification list */}
        {recentNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <Bell size={18} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              No notifications yet
            </p>
            <p className="text-xs text-muted-foreground">
              Activity across your portal will appear here.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <div className="p-1.5 space-y-0.5">
              {recentNotifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-3 py-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-[11px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleClearAll}
              data-ocid="notifications.clear_all_button"
            >
              Clear all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
