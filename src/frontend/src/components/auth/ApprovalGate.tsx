import { Loader2 } from "lucide-react";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import ApprovalStatusBanner from "./ApprovalStatusBanner";

interface ApprovalGateProps {
  children: React.ReactNode;
}

export default function ApprovalGate({ children }: ApprovalGateProps) {
  const { isAdmin, isApproved, isLoading, isFetched } = useCurrentUser();

  if (isLoading || !isFetched) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Checking access…</p>
        </div>
      </div>
    );
  }

  // Admins always pass through
  if (isAdmin) {
    return <>{children}</>;
  }

  // Approved users pass through
  if (isApproved) {
    return <>{children}</>;
  }

  // Non-approved users see the banner and a restricted view
  return (
    <div className="flex flex-col min-h-[60vh]">
      <ApprovalStatusBanner />
      <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Access Restricted</h2>
        <p className="text-muted-foreground max-w-md">
          Your account is awaiting admin approval. Once approved, you'll have
          full access to all portal features.
        </p>
      </div>
    </div>
  );
}
