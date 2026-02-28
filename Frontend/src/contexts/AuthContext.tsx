import { createClient, Session, SupabaseClient, User } from "@supabase/supabase-js";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<string>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  supabase: SupabaseClient;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
// Support both variable names for the anon key
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  "";


// Helper to safely log env var status
const checkEnvVar = (val: string | undefined, name: string) => {
  if (!val) console.error(`[AuthContext] Missing ${name}`);
  else console.log(`[AuthContext] Found ${name} (length: ${val.length})`);
};

checkEnvVar(supabaseUrl, "VITE_SUPABASE_URL");
checkEnvVar(supabaseAnonKey, "Anon Key");

let supabase: SupabaseClient;

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase credentials missing. Check .env file and ensure variables start with VITE_");
  }
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (error) {
  console.error("[AuthContext] Failed to initialize Supabase:", error);
  // Fallback mock to allow app to render error UI instead of white screening
  supabase = {
    auth: {
      getSession: () => Promise.reject("Supabase not initialized"),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
      signUp: () => Promise.reject("Supabase not initialized"),
      signInWithPassword: () => Promise.reject("Supabase not initialized"),
      signOut: () => Promise.reject("Supabase not initialized"),
      resetPasswordForEmail: () => Promise.reject("Supabase not initialized"),
      updateUser: () => Promise.reject("Supabase not initialized"),
    }
  } as unknown as SupabaseClient;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
      })
      .catch((error) => {
        console.error("Error getting initial session:", error);
      })
      .finally(() => {
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);



  const signUp = async (email: string, password: string): Promise<string> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
        data: {
          email_confirmed: true,
        },
      },
    });

    if (error) {
      // Provide user-friendly messages for common Supabase errors (incl. 429 from Supabase)
      const msg = (error.message ?? "").toLowerCase();
      const is429 = (error as { status?: number }).status === 429;
      if (
        is429 ||
        msg.includes("rate limit") ||
        msg.includes("email rate limit") ||
        msg.includes("over_email_send_rate_limit") ||
        msg.includes("sending confirmation email") ||
        msg.includes("confirmation email")
      ) {
        // Try to sign in directly — works if account was already created previously
        // or if Supabase has email confirmation disabled
        try {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (!signInError) return "auto-confirmed";
        } catch {
          // ignore
        }
        throw new Error("Account created but email confirmation is required. Please disable 'Confirm email' in your Supabase Auth settings.");
      }
      if (error.message?.toLowerCase().includes("already registered") ||
        error.message?.toLowerCase().includes("already been registered")) {
        // User exists — sign them in directly
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (!signInError) return "auto-confirmed";
        throw new Error("This email is already registered. Please sign in instead.");
      }
      throw error;
    }
    if (!data.user) throw new Error("Failed to create user");

    // If session was returned, user is already signed in — done!
    if (data.session) {
      return "auto-confirmed";
    }

    // No session yet — sign in immediately (works when email confirmation is disabled)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      const msg = (signInError.message ?? "").toLowerCase();
      if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
        throw new Error("Email confirmation is required. Please go to your Supabase Dashboard → Authentication → Providers → Email and disable 'Confirm email'.");
      }
      // Non-fatal — user is created, they can log in manually
    }

    return "auto-confirmed";
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("Failed to sign in");
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password: password,
    });
    if (error) throw error;
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    supabase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

