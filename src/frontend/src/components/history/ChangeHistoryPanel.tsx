import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetChangeHistory } from "@/hooks/useQueries";
import {
  AlertCircle,
  Clock,
  History,
  Link2,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import type React from "react";
import { Variant_link_create_update } from "../../backend";

interface ChangeHistoryPanelProps {
  recordId: string;
}

function formatTimestamp(timestamp: bigint): string {
  // Backend timestamps are in nanoseconds
  const ms = Number(timestamp) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncatePrincipal(principal: { toString(): string }): string {
  const str = principal.toString();
  if (str.length <= 16) return str;
  return `${str.slice(0, 8)}…${str.slice(-6)}`;
}

function operationLabel(op: Variant_link_create_update): {
  label: string;
  icon: React.ReactNode;
  variant: "default" | "secondary" | "outline";
} {
  switch (op) {
    case Variant_link_create_update.create:
      return {
        label: "Created",
        icon: <PlusCircle className="h-3.5 w-3.5" />,
        variant: "default",
      };
    case Variant_link_create_update.update:
      return {
        label: "Updated",
        icon: <RefreshCw className="h-3.5 w-3.5" />,
        variant: "secondary",
      };
    case Variant_link_create_update.link:
      return {
        label: "Linked",
        icon: <Link2 className="h-3.5 w-3.5" />,
        variant: "outline",
      };
    default:
      return {
        label: "Changed",
        icon: <RefreshCw className="h-3.5 w-3.5" />,
        variant: "outline",
      };
  }
}

export default function ChangeHistoryPanel({
  recordId,
}: ChangeHistoryPanelProps) {
  const { data: events, isLoading, error } = useGetChangeHistory(recordId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          Change History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : "Failed to load change history."}
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && (!events || events.length === 0) && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              No history available yet.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Changes to this record will appear here.
            </p>
          </div>
        )}

        {!isLoading && !error && events && events.length > 0 && (
          <ol className="relative border-l border-border ml-3 space-y-0">
            {[...events].reverse().map((event, idx) => {
              const op = operationLabel(event.operationType);
              return (
                <li
                  key={`${String(event.id)}-${idx}`}
                  className="mb-6 ml-4 last:mb-0"
                >
                  {/* Timeline dot */}
                  <span className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full bg-background border-2 border-primary/60 ring-2 ring-background" />

                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge
                      variant={op.variant}
                      className="gap-1 text-xs py-0.5"
                    >
                      {op.icon}
                      {op.label}
                    </Badge>
                    <time className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(event.timestamp)}
                    </time>
                  </div>

                  {event.changedFields && event.changedFields.length > 0 && (
                    <p className="text-xs text-muted-foreground mb-1">
                      Fields:{" "}
                      <span className="font-medium text-foreground">
                        {event.changedFields.join(", ")}
                      </span>
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    By:{" "}
                    <span className="font-mono text-foreground/70">
                      {truncatePrincipal(event.author)}
                    </span>
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
