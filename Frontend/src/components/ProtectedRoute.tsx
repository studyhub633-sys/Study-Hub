import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  allowIncompleteOnboarding?: boolean;
}

export function ProtectedRoute({
  children,
  allowIncompleteOnboarding = false,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { onboardingComplete, checking } = useOnboarding();
  const location = useLocation();
  const isOnboardingRoute = location.pathname === "/onboarding";

  if (loading || (user && checking)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  if (isOnboardingRoute && onboardingComplete) {
    return <Navigate to="/" replace />;
  }

  if (!allowIncompleteOnboarding && !isOnboardingRoute && onboardingComplete === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
