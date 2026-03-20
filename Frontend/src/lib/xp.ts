/**
 * XP System for Revisely.ai
 * 
 * Tracks experience points for gamification.
 * XP is stored in the profiles table and awarded for various activities.
 */

import { SupabaseClient } from "@supabase/supabase-js";

// XP Constants
export const XP_REWARDS = {
  QUIZ_CORRECT: 10,
  QUIZ_ATTEMPT: 2,
  CHALLENGE_WIN: 25,
  CHALLENGE_COMPLETE: 10,
  NOTE_CREATED: 5,
  FLASHCARD_REVIEWED: 3,
  STUDY_SESSION: 5, // per 30 min of focus mode
} as const;

export type XpReason = keyof typeof XP_REWARDS;

/**
 * Award XP to a user. Increments their total XP in the profiles table.
 */
export async function awardXP(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; newTotal?: number; error?: string }> {
  try {
    // First get current XP
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("xp")
      .eq("id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching XP:", fetchError);
      return { success: false, error: fetchError.message };
    }

    const currentXP = profile?.xp || 0;
    const newTotal = currentXP + amount;

    // Update XP
    const { error: updateError } = await supabase
      .from("profiles")
      .upsert(
        { id: userId, xp: newTotal },
        { onConflict: "id" }
      );

    if (updateError) {
      console.error("Error updating XP:", updateError);
      return { success: false, error: updateError.message };
    }

    // Log XP event (best-effort, don't fail if table doesn't exist)
    try {
      await supabase.from("xp_events").insert({
        user_id: userId,
        amount,
        reason,
        created_at: new Date().toISOString(),
      });
    } catch {
      // xp_events table may not exist yet — that's okay
    }

    return { success: true, newTotal };
  } catch (error: any) {
    console.error("Error awarding XP:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a user's current XP
 */
export async function getXP(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("xp")
      .eq("id", userId)
      .single();

    return profile?.xp || 0;
  } catch {
    return 0;
  }
}

/**
 * Get a user's study hours
 */
export async function getStudyHours(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("study_hours")
      .eq("id", userId)
      .single();

    return profile?.study_hours || 0;
  } catch {
    return 0;
  }
}
