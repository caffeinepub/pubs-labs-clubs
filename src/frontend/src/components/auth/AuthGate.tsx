import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import LoadingState from '../feedback/LoadingState';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { identity, isInitializing, login, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    // Defensive: only redirect if we're sure the user is not authenticated
    // and not in the process of logging in
    if (!isInitializing && !identity && loginStatus !== 'logging-in') {
      try {
        navigate({ to: '/' });
      } catch (error) {
        console.error('Navigation error in AuthGate:', error);
      }
    }
  }, [identity, isInitializing, loginStatus, navigate]);

  if (isInitializing) {
    return <LoadingState />;
  }

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Authentication Required</h2>
          <p className="text-muted-foreground">Please sign in to access the portal.</p>
          <Button onClick={login} disabled={loginStatus === 'logging-in'}>
            <LogIn className="mr-2 h-4 w-4" />
            {loginStatus === 'logging-in' ? 'Signing In...' : 'Sign In'}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
