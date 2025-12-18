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

        // SIMPLEST LOGIC: Direct update to the profiles table
        // We use upsert so it works even if the profile row hasn't been created yet
        const { error } = await supabase
            .from("profiles")
            .upsert({
                id: user.id,
                is_premium: true,
                email: user.email,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        if (error) {
            console.error("Simple grant failure:", error);
            return res.status(500).json({
                error: "Failed to grant access.",
                details: error.message
            });
        }

        return res.status(200).json({ success: true, message: "Lifetime access granted!" });

    } catch (error) {
        console.error("Simple grant error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
}
