import { supabase } from './auth.js';

export async function checkAndRecordUsage(user, featureType, prompt = null, subject = null, topic = null) {
    if (!supabase) {
        throw new Error("Supabase client not initialized");
    }

    // Check if user is a tester for lifetime premium
    const TESTER_EMAILS = ['admin@studyhub.com', 'tester@studyhub.com', 'andre@studyhub.com'];
    const isTester = TESTER_EMAILS.includes(user.email);

    // Check if user has premium access
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium")
        .eq("id", user.id)
        .single();
    
    const isPremium = profile?.is_premium || false;
    
    // Free users: 50 requests/day, Premium: unlimited (set to very high number)
    const MAX_DAILY_USAGE_FREE = 50;
    const MAX_DAILY_USAGE_PREMIUM = 10000; // Effectively unlimited
    const MAX_DAILY_USAGE = isPremium ? MAX_DAILY_USAGE_PREMIUM : MAX_DAILY_USAGE_FREE;
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
    const { data: insertedData, error: insertError } = await supabase
        .from("ai_usage_tracking")
        .insert({
            user_id: user.id,
            feature_type: featureType,
            prompt: prompt,
            subject: subject,
            topic: topic
        })
        .select('id')
        .single();

    if (insertError) {
        console.error("Failed to record usage:", insertError);
        // We generally don't block the user if tracking fails, but it's up to policy.
        // For now, we'll log it and proceed.
    }

    return {
        usageCount: count + 1,
        limit: MAX_DAILY_USAGE,
        isPremium,
        usageId: insertedData?.id
    };
}

export async function updateAiResponse(usageId, response) {
    if (!supabase || !usageId) return;

    const { error } = await supabase
        .from("ai_usage_tracking")
        .update({ response })
        .eq("id", usageId);

    if (error) {
        console.error("Failed to update AI response:", error);
    }
}
