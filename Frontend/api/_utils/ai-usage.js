import { supabase } from './auth.js';

export async function checkAndRecordUsage(user, featureType) {
    if (!supabase) {
        throw new Error("Supabase client not initialized");
    }

    // Check if user is a tester for lifetime premium
    const TESTER_EMAILS = ['admin@studyhub.com', 'tester@studyhub.com', 'andre@studyhub.com'];
    const isTester = TESTER_EMAILS.includes(user.email);

    // Get premium status
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", user.id)
        .single();

    const isPremium = profile?.is_premium || isTester;
    const MAX_DAILY_USAGE = isPremium ? 500 : 10;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Count usage across ALL features in the last 24 hours
    const { count, error } = await supabase
        .from("ai_usage_tracking")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gt("created_at", oneDayAgo);

    if (error) {
        throw new Error(`Failed to check usage limits: ${error.message}`);
    }

    if (count >= MAX_DAILY_USAGE) {
        throw {
            status: 429,
            message: `You have reached the daily limit of ${MAX_DAILY_USAGE} AI requests. ${!isPremium ? 'Please upgrade to premium for higher limits.' : 'Please try again tomorrow.'}`,
            usageCount: count,
            limit: MAX_DAILY_USAGE
        };
    }

    // Record new usage
    const { error: insertError } = await supabase
        .from("ai_usage_tracking")
        .insert({
            user_id: user.id,
            feature_type: featureType
        });

    if (insertError) {
        console.error("Failed to record usage:", insertError);
        // We generally don't block the user if tracking fails, but it's up to policy.
        // For now, we'll log it and proceed.
    }

    return {
        usageCount: count + 1,
        limit: MAX_DAILY_USAGE,
        isPremium
    };
}
