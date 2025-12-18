import { supabase, verifyAuth } from '../_utils/auth.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const user = await verifyAuth(req);

        // Check if user already has an active subscription
        const { data: existingSubscription } = await supabase
            .from("subscriptions")
            .select("id")
            .eq("user_id", user.id)
            .eq("status", "active")
            .single();

        if (existingSubscription) {
            console.log(`User ${user.id} already has active premium subscription`);
            return res.status(200).json({ success: true, message: "Lifetime beta access already granted!" });
        }

        // Grant lifetime beta access by inserting a subscription
        // Since the backend uses the service role key, this will bypass RLS
        console.log(`Granting lifetime beta premium to user: ${user.id}`);

        const { error: insertError } = await supabase
            .from("subscriptions")
            .insert({
                user_id: user.id,
                plan_type: "yearly", // Use yearly for lifetime beta
                status: "active",
                current_period_start: new Date().toISOString(),
                current_period_end: "9999-12-31T23:59:59.999Z" // Far future date for lifetime
            });

        if (insertError) {
            console.error("Failed to grant premium subscription:", insertError);
            return res.status(500).json({
                error: "Failed to grant premium subscription.",
                details: insertError.message,
                code: insertError.code
            });
        }

        console.log(`Successfully granted lifetime beta premium to ${user.id}`);
        return res.status(200).json({ success: true, message: "Lifetime beta access granted!" });

    } catch (error) {
        console.error("Grant premium error:", error);
        return res.status(error.message.includes("Authorization") ? 401 : 500).json({
            error: error.message || "Internal server error"
        });
    }
}
