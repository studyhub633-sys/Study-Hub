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
 */
export async function hasPremium(supabase: SupabaseClient): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Simplest logic: Check the is_premium column in the profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", user.id)
      .maybeSingle();

    return profile?.is_premium || false;
  } catch (error) {
    console.error("Error checking premium status:", error);
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
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data as Subscription;
  } catch (error) {
    return null;
  }
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
export async function grantBetaAccessWithBackend(supabase: SupabaseClient): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const response = await fetch("/api/auth/grant-beta-premium", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Premium grant backend error:", JSON.stringify(error, null, 2));
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error granting premium via backend:", error);
    return false;
  }
}

/**
 * Legacy wrapper
 */
export async function checkAndGrantBetaPremium(supabase: SupabaseClient, userId: string): Promise<void> {
  await grantBetaAccessWithBackend(supabase);
}
