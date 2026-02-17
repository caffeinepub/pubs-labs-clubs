import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useRequestApproval } from '../../hooks/useQueries';
import LoadingState from '../feedback/LoadingState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock } from 'lucide-react';

interface ApprovalGateProps {
  children: React.ReactNode;
}

export default function ApprovalGate({ children }: ApprovalGateProps) {
  const { isApproved, isAdmin, isLoading } = useCurrentUser();
  const requestApprovalMutation = useRequestApproval();

  if (isLoading) {
    return <LoadingState />;
  }

  // Admins bypass approval
  if (isAdmin) {
    return <>{children}</>;
  }

  if (!isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Approval Pending
            </CardTitle>
            <CardDescription>
              Your account is awaiting approval from an administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To access the Higgins Music portal, you need to request approval. Once approved by an admin, 
              you'll have full access to your membership profile and associated records.
            </p>
            <Button 
              onClick={() => requestApprovalMutation.mutate()}
              disabled={requestApprovalMutation.isPending}
              className="w-full"
            >
              {requestApprovalMutation.isPending ? 'Requesting...' : 'Request Approval'}
            </Button>
            {requestApprovalMutation.isSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                Approval request submitted successfully
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
