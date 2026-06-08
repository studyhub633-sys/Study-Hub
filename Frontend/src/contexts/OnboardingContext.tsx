import { useAuth } from "@/contexts/AuthContext";
import { fetchOnboardingStatus } from "@/lib/onboarding";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

interface OnboardingContextType {
  onboardingComplete: boolean | null;
  checking: boolean;
  refreshOnboardingStatus: () => Promise<void>;
  markOnboardingComplete: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user, supabase } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  const refreshOnboardingStatus = useCallback(async () => {
    if (!user) {
      setOnboardingComplete(null);
      setChecking(false);
      return;
    }

    setChecking(true);
    try {
      const complete = await fetchOnboardingStatus(supabase, user.id);
      setOnboardingComplete(complete);
    } catch (error) {
      console.error("Failed to check onboarding status:", error);
      setOnboardingComplete(false);
    } finally {
      setChecking(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    refreshOnboardingStatus();
  }, [refreshOnboardingStatus]);

  const markOnboardingComplete = useCallback(() => {
    setOnboardingComplete(true);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        onboardingComplete,
        checking,
        refreshOnboardingStatus,
        markOnboardingComplete,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
