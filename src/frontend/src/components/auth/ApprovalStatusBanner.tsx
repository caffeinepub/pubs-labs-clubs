import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRequestApproval } from "../../hooks/useQueries";
import { useIsCallerApproved } from "../../hooks/useQueries";

export default function ApprovalStatusBanner() {
  const { data: isApproved, isLoading } = useIsCallerApproved();
  const requestApproval = useRequestApproval();

  if (isLoading || isApproved) return null;

  const handleRequestApproval = async () => {
    try {
      await requestApproval.mutateAsync();
      toast.success("Approval request submitted", {
        description: "An administrator will review your request shortly.",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to submit approval request.";
      toast.error("Request failed", { description: message });
    }
  };

  return (
    <div className="px-6 pt-6">
      <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
        <Clock className="h-4 w-4 text-amber-500" />
        <AlertTitle className="text-amber-600 dark:text-amber-400">
          Membership Pending Approval
        </AlertTitle>
        <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3 mt-1">
          <span className="text-muted-foreground flex-1">
            Your membership application is pending admin approval. You will gain
            full access once approved.
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRequestApproval}
            disabled={requestApproval.isPending}
            className="border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 shrink-0"
          >
            {requestApproval.isPending ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Requesting…
              </>
            ) : (
              <>
                <AlertCircle className="mr-2 h-3 w-3" />
                Request Approval
              </>
            )}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
