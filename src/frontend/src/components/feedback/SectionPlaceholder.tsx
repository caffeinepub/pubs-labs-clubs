import { cn } from "@/lib/utils";
import type { AuditPriority } from "@/utils/portalAudit";
import { AlertTriangle, Info, Zap } from "lucide-react";

interface SectionPlaceholderProps {
  title: string;
  description: string;
  priority?: AuditPriority;
  className?: string;
}

const priorityConfig: Record<
  AuditPriority,
  {
    label: string;
    icon: React.ElementType;
    containerClass: string;
    iconClass: string;
    badgeClass: string;
  }
> = {
  high: {
    label: "High Priority",
    icon: Zap,
    containerClass:
      "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40",
    iconClass: "text-amber-500 dark:text-amber-400",
    badgeClass:
      "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  },
  medium: {
    label: "Medium Priority",
    icon: AlertTriangle,
    containerClass:
      "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40",
    iconClass: "text-blue-500 dark:text-blue-400",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  low: {
    label: "Low Priority",
    icon: Info,
    containerClass:
      "border-muted bg-muted/30 dark:border-muted dark:bg-muted/10",
    iconClass: "text-muted-foreground",
    badgeClass: "bg-muted text-muted-foreground",
  },
};

/**
 * Displays a clearly labelled placeholder card indicating missing or incomplete
 * functionality in a portal section. Used for the portal audit.
 */
export default function SectionPlaceholder({
  title,
  description,
  priority = "medium",
  className,
}: SectionPlaceholderProps) {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-lg border-2 border-dashed p-4 flex gap-3 items-start",
        config.containerClass,
        className,
      )}
      role="note"
      aria-label={`Placeholder: ${title}`}
    >
      <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", config.iconClass)} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              config.badgeClass,
            )}
          >
            {config.label}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            Not yet built
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
