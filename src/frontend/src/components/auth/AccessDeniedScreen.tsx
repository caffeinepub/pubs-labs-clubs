import { ShieldX } from "lucide-react";
import React from "react";

export default function AccessDeniedScreen() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldX className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        You do not have permission to view this page. Please contact an
        administrator if you believe this is an error.
      </p>
    </div>
  );
}
