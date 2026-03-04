import { Card, CardContent } from "@/components/ui/card";
import type React from "react";

interface StatCardProps {
  title: string;
  value: bigint | number;
  icon: React.ReactNode;
  description?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  description,
}: StatCardProps) {
  const displayValue = typeof value === "bigint" ? Number(value) : value;

  return (
    <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-border/60">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>
            <p className="mt-2 text-3xl font-bold text-foreground tabular-nums">
              {displayValue.toLocaleString()}
            </p>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 p-2.5 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
