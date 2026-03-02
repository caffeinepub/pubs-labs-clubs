// TEMP: ApprovalGate is temporarily disabled — always renders children unconditionally.
// All original approval logic is preserved in comments below for easy reversion.

interface ApprovalGateProps {
  children: React.ReactNode;
}

export default function ApprovalGate({ children }: ApprovalGateProps) {
  // TEMP: Bypassed — render children without checking approval status
  return <>{children}</>;

  /*
  // Original approval logic (preserved for reversion):
  const { data: isApproved, isLoading } = useIsCallerApproved();
  const requestApprovalMutation = useRequestApproval();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p>Your account is pending approval.</p>
        <Button onClick={() => requestApprovalMutation.mutate()}>
          Request Approval
        </Button>
      </div>
    );
  }

  return <>{children}</>;
  */
}
