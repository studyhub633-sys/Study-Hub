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
 * Check if user has active premium subscription
 */
export async function hasPremium(supabase: SupabaseClient, userId: string): Promise<boolean> {
  try {
    // Check profile first (faster)
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", userId)
      .single();

    if (profile?.is_premium) {
      return true;
    }

    // Check active subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (subscription) {
      const periodEnd = new Date(subscription.current_period_end);
      return periodEnd > new Date();
    }

    return false;
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

    if (error || !data) {
      return null;
    }

    return data as Subscription;
  } catch (error) {
    console.error("Error getting subscription:", error);
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
      .single();

    return profile?.is_admin || false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

