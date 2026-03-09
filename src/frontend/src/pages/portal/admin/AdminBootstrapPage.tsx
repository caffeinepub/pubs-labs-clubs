import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  Copy,
  Link,
  Shield,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const steps = [
  {
    number: 1,
    icon: Shield,
    title: "Get your admin secret token",
    description:
      "The admin secret token is set at canister deployment time. Check your deployment configuration or contact your deployment administrator to retrieve it.",
    note: "Look for ADMIN_SECRET_TOKEN or caffeineAdminToken in your deployment config.",
  },
  {
    number: 2,
    icon: Link,
    title: "Open the app with the token in the URL",
    description:
      "Append the token to the app URL as a hash fragment. Use the format shown below, replacing YOUR_SECRET_TOKEN with the actual token.",
    note: null,
  },
  {
    number: 3,
    icon: UserCheck,
    title: "Sign in with Internet Identity",
    description:
      "After opening the URL with the token hash, sign in with Internet Identity. Your principal will automatically be granted admin privileges on sign-in. The token is cleared from the URL immediately after use.",
    note: "The token is single-use per session and is never stored in browser history.",
  },
];

export default function AdminBootstrapPage() {
  const exampleUrl = `${window.location.origin}/#caffeineAdminToken=YOUR_SECRET_TOKEN`;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exampleUrl);
      setCopied(true);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div data-ocid="bootstrap.page" className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Bootstrap</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Follow the three steps below to claim the first administrator account
          for this app.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <Card key={step.number} className="relative overflow-hidden">
              {/* Step connector line */}
              {idx < steps.length - 1 && (
                <div className="absolute left-[2.35rem] top-[4.5rem] h-[calc(100%-1rem)] w-px bg-border" />
              )}
              <CardContent className="pt-6 pb-5">
                <div className="flex gap-4">
                  {/* Step badge + icon */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {step.number}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary shrink-0" />
                      <h3 className="font-semibold text-base">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>

                    {step.number === 2 && (
                      <div className="mt-3 rounded-lg border bg-muted/50 overflow-hidden">
                        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b bg-muted/30">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Example URL
                          </span>
                          <Button
                            data-ocid="bootstrap.copy_button"
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1.5 text-xs"
                            onClick={handleCopy}
                          >
                            {copied ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                            {copied ? "Copied!" : "Copy"}
                          </Button>
                        </div>
                        <code className="block px-3 py-3 text-xs font-mono break-all text-foreground leading-relaxed">
                          {exampleUrl}
                        </code>
                      </div>
                    )}

                    {step.note && (
                      <p className="text-xs text-muted-foreground italic">
                        💡 {step.note}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Security note */}
      <Card className="border-amber-500/40 bg-amber-500/5">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              Security Notice
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1.5">
          <p>
            Keep your admin token secure and never share it publicly or commit
            it to version control.
          </p>
          <p>
            The token is automatically cleared from the URL after use to prevent
            browser history leakage.
          </p>
          <p>
            Once admin is claimed, additional admins can only be assigned from
            the <strong>Role Assignment</strong> page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
