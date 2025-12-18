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
    // During beta, any logged-in user is treated as premium to bypass DB cache issues.
    return !!user;
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
export async function grantBetaAccessWithBackend(supabase: SupabaseClient): Promise<boolean> {
  // Always return true to keep the UI flow happy, even though usage is now open to all
  return true;
}

/**
 * Legacy wrapper
 */
export async function checkAndGrantBetaPremium(supabase: SupabaseClient, userId: string): Promise<void> {
  return;
}
