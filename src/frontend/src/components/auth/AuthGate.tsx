import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { identity, isInitializing, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  useEffect(() => {
    if (!isInitializing && !isLoggingIn && !isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isInitializing, isLoggingIn, isAuthenticated, navigate]);

  if (isInitializing || isLoggingIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
