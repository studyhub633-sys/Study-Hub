/**
 * Premium utilities for checking subscription status
 */

import { SupabaseClient } from "@supabase/supabase-js";

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: "monthly" | "yearly";
  status: "active" | "canceled" | "expired" | "past_due";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

/**
 * Check if the current user has premium access
 * BETA OVERRIDE: All users have premium during testing
 */
export async function hasPremium(supabase: SupabaseClient): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", user.id)
      .single();

    return profile?.is_premium || false;
  } catch (error) {
    return false;
  }
}

/**
 * Get user's current subscription
 */
export async function getSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<Subscription | null> {
  return null; // Not needed during beta override
}

/**
 * Check if user is admin
 */
export async function isAdmin(supabase: SupabaseClient, userId: string): Promise<boolean> {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .maybeSingle();

    return profile?.is_admin || false;
  } catch (error) {
    return false;
  }
}

/**
 * Automatically grant premium to users during beta (Backend Version)
 */
export async function grantBetaAccessWithBackend(supabase: SupabaseClient): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return { success: false, error: "No active session" };

    const response = await fetch('/api/auth/grant-beta-premium', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const result = await response.json();
    if (result.success) return { success: true };

    return {
      success: false,
      error: result.details || result.error || "Unknown error"
    };
  } catch (error: any) {
    console.error("Error granting beta access:", error);
    return { success: false, error: error.message || "Network error" };
  }
}

/**
 * Legacy wrapper
 */
export async function checkAndGrantBetaPremium(supabase: SupabaseClient, userId: string): Promise<void> {
  return;
}
