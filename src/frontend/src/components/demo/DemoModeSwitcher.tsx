import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DEMO_PERSONAS,
  type DemoPersona,
  useDemoMode,
} from "@/contexts/DemoModeContext";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, FlaskConical, X } from "lucide-react";
import { useState } from "react";

const COLOR_MAP: Record<string, { badge: string; ring: string; dot: string }> =
  {
    violet: {
      badge:
        "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300",
      ring: "ring-violet-400/60",
      dot: "bg-violet-500",
    },
    blue: {
      badge:
        "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
      ring: "ring-blue-400/60",
      dot: "bg-blue-500",
    },
    amber: {
      badge:
        "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
      ring: "ring-amber-400/60",
      dot: "bg-amber-500",
    },
  };

export default function DemoModeSwitcher() {
  const { activePersona, activeConfig, isDemoMode, setPersona, exitDemoMode } =
    useDemoMode();
  const [expanded, setExpanded] = useState(false);

  if (!isDemoMode && !expanded) {
    return null;
  }

  const colors = activeConfig ? COLOR_MAP[activeConfig.color] : null;

  return (
    <div
      data-ocid="demo.panel"
      className={cn(
        "fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 font-sans",
      )}
    >
      {/* Expanded panel */}
      {expanded && (
        <div className="w-72 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
            <FlaskConical className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold flex-1">Demo Mode</span>
            <button
              type="button"
              data-ocid="demo.close_button"
              onClick={() => setExpanded(false)}
              className="rounded-md p-1 hover:bg-accent transition-colors"
              aria-label="Close"
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="p-3 space-y-1.5">
            {DEMO_PERSONAS.map((persona) => {
              const c = COLOR_MAP[persona.color];
              const isActive = activePersona === persona.id;
              return (
                <button
                  type="button"
                  key={persona.id}
                  data-ocid={`demo.${persona.id}.button`}
                  onClick={() => setPersona(persona.id as DemoPersona)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg border transition-all",
                    isActive
                      ? `border-current ${c.badge} ring-2 ${c.ring}`
                      : "border-border hover:bg-accent/50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0",
                        c.dot,
                      )}
                    />
                    <span className="text-sm font-medium">{persona.label}</span>
                    {isActive && (
                      <Badge
                        variant="outline"
                        className="ml-auto text-xs py-0 h-4"
                      >
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 ml-4">
                    {persona.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="px-3 pb-3">
            <Button
              data-ocid="demo.exit_button"
              variant="outline"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => {
                exitDemoMode();
                setExpanded(false);
              }}
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Exit Demo Mode
            </Button>
          </div>
        </div>
      )}

      {/* Floating pill trigger */}
      <button
        type="button"
        data-ocid="demo.toggle"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-full border shadow-lg text-sm font-medium transition-all",
          isDemoMode
            ? `${colors?.badge} border-current ring-2 ${colors?.ring}`
            : "bg-card border-border hover:bg-accent",
        )}
      >
        {isDemoMode && (
          <span
            className={cn("w-2 h-2 rounded-full animate-pulse", colors?.dot)}
          />
        )}
        <FlaskConical className="h-3.5 w-3.5" />
        <span>{isDemoMode ? activeConfig?.label : "Demo Mode"}</span>
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronUp className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
