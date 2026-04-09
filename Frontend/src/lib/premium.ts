/**
 * Premium utilities for checking subscription status
 */

import { SupabaseClient } from "@supabase/supabase-js";

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: "weekly" | "monthly" | "yearly";
  status: "active" | "canceled" | "expired" | "past_due";
  current_period_start: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

/**
 * Check if the current user has premium access.
 *
 * All plans (weekly, monthly, yearly) have a `current_period_end`.
 * If the period has elapsed the user is no longer considered premium.
 * The backend will formally mark it as expired on its next check,
 * but we deny access immediately on the client.
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

    if (!profile?.is_premium) return false;

    // ── Verify the subscription hasn't expired ──
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, plan_type, current_period_end, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // No subscription row but is_premium is true → admin / beta grant
    if (!subscription) return true;

    // Check the period end date
    if (subscription.current_period_end) {
      const expiry = new Date(subscription.current_period_end);
      if (expiry < new Date()) {
        // Period has elapsed → premium is no longer valid
        return false;
      }
    }

    return true;
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
  try {
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return data || null;
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
