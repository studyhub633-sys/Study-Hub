/**
 * Friends system for Revisely.ai
 * 
 * Manages friendships: search, send/accept/reject requests, list friends.
 * Uses a `friendships` table in Supabase.
 */

import { SupabaseClient } from "@supabase/supabase-js";

export interface FriendProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  xp: number;
  study_hours: number;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  // Joined profile data
  requester?: FriendProfile;
  addressee?: FriendProfile;
}

/**
 * Search users by name or email (excludes current user)
 */
export async function searchUsers(
  supabase: SupabaseClient,
  query: string,
  currentUserId: string
): Promise<FriendProfile[]> {
  if (!query || query.length < 2) return [];

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, xp, study_hours")
      .neq("id", currentUserId)
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(20);

    if (error) {
      console.error("Error searching users:", error);
      return [];
    }

    return (data || []).map((u: any) => ({
      id: u.id,
      full_name: u.full_name || u.email?.split("@")[0] || "User",
      email: u.email || "",
      avatar_url: u.avatar_url,
      xp: u.xp || 0,
      study_hours: u.study_hours || 0,
    }));
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
}

/**
 * Send a friend request
 */
export async function sendFriendRequest(
  supabase: SupabaseClient,
  fromUserId: string,
  toUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if friendship already exists
    const { data: existing } = await supabase
      .from("friendships")
      .select("id, status")
      .or(
        `and(requester_id.eq.${fromUserId},addressee_id.eq.${toUserId}),and(requester_id.eq.${toUserId},addressee_id.eq.${fromUserId})`
      )
      .limit(1)
      .maybeSingle();

    if (existing) {
      if (existing.status === "accepted") {
        return { success: false, error: "You are already friends!" };
      }
      if (existing.status === "pending") {
        return { success: false, error: "Friend request already pending." };
      }
    }

    const { error } = await supabase.from("friendships").insert({
      requester_id: fromUserId,
      addressee_id: toUserId,
      status: "pending",
    });

    if (error) {
      console.error("Error sending friend request:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(
  supabase: SupabaseClient,
  friendshipId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Reject a friend request
 */
export async function rejectFriendRequest(
  supabase: SupabaseClient,
  friendshipId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "rejected" })
      .eq("id", friendshipId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Remove a friend (delete friendship)
 */
export async function removeFriend(
  supabase: SupabaseClient,
  friendshipId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get accepted friends for a user
 */
export async function getFriends(
  supabase: SupabaseClient,
  userId: string
): Promise<(Friendship & { friend: FriendProfile })[]> {
  try {
    const { data, error } = await supabase
      .from("friendships")
      .select(`
        id, requester_id, addressee_id, status, created_at,
        requester:profiles!friendships_requester_id_fkey(id, full_name, email, avatar_url, xp, study_hours),
        addressee:profiles!friendships_addressee_id_fkey(id, full_name, email, avatar_url, xp, study_hours)
      `)
      .eq("status", "accepted")
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    if (error) {
      console.error("Error fetching friends:", error);
      return [];
    }

    return (data || []).map((f: any) => {
      const isRequester = f.requester_id === userId;
      const friendProfile = isRequester ? f.addressee : f.requester;
      return {
        ...f,
        friend: {
          id: friendProfile?.id || "",
          full_name: friendProfile?.full_name || friendProfile?.email?.split("@")[0] || "User",
          email: friendProfile?.email || "",
          avatar_url: friendProfile?.avatar_url || null,
          xp: friendProfile?.xp || 0,
          study_hours: friendProfile?.study_hours || 0,
        },
      };
    });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return [];
  }
}

/**
 * Get pending incoming friend requests
 */
export async function getPendingRequests(
  supabase: SupabaseClient,
  userId: string
): Promise<(Friendship & { friend: FriendProfile })[]> {
  try {
    const { data, error } = await supabase
      .from("friendships")
      .select(`
        id, requester_id, addressee_id, status, created_at,
        requester:profiles!friendships_requester_id_fkey(id, full_name, email, avatar_url, xp, study_hours)
      `)
      .eq("status", "pending")
      .eq("addressee_id", userId);

    if (error) {
      console.error("Error fetching pending requests:", error);
      return [];
    }

    return (data || []).map((f: any) => ({
      ...f,
      friend: {
        id: f.requester?.id || "",
        full_name: f.requester?.full_name || f.requester?.email?.split("@")[0] || "User",
        email: f.requester?.email || "",
        avatar_url: f.requester?.avatar_url || null,
        xp: f.requester?.xp || 0,
        study_hours: f.requester?.study_hours || 0,
      },
    }));
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    return [];
  }
}
