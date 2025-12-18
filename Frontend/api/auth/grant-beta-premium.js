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

        // Update the profile to set is_premium to true
        // Since the backend uses the service role key, this will bypass RLS
        const { error } = await supabase
            .from("profiles")
            .update({ is_premium: true })
            .eq("id", user.id);

        if (error) {
            console.error("Failed to grant premium in backend:", error);
            return res.status(500).json({ error: "Failed to update profile. Please try again." });
        }

        return res.status(200).json({ success: true, message: "Lifetime beta access granted!" });

    } catch (error) {
        console.error("Grant premium error:", error);
        return res.status(error.message.includes("Authorization") ? 401 : 500).json({
            error: error.message || "Internal server error"
        });
    }
}
