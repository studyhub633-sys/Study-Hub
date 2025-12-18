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
        console.log(`Attempting to grant premium to user: ${user.id}`);

        const { error: updateError } = await supabase
            .from("profiles")
            .update({ is_premium: true })
            .eq("id", user.id);

        if (updateError) {
            console.warn("Update failed, attempting upsert:", updateError.message);
            // Fallback: try upserting in case the profile row doesn't exist yet
            const { error: upsertError } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    is_premium: true,
                    email: user.email,
                    updated_at: new Date().toISOString()
                });

            if (upsertError) {
                console.error("Failed to grant premium in backend (both update and upsert):", upsertError);
                return res.status(500).json({
                    error: "Failed to update profile.",
                    details: upsertError.message,
                    code: upsertError.code
                });
            }
        }

        console.log(`Successfully granted premium to ${user.id}`);
        return res.status(200).json({ success: true, message: "Lifetime beta access granted!" });

    } catch (error) {
        console.error("Grant premium error:", error);
        return res.status(error.message.includes("Authorization") ? 401 : 500).json({
            error: error.message || "Internal server error"
        });
    }
}
