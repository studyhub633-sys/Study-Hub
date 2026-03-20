import { supabase, verifyAuth } from "../_utils/auth.js";
import { applyCors, setNoStore } from "../_utils/http.js";

export default async function handler(req, res) {
    setNoStore(res);
    if (applyCors(req, res)) return;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // 1. Verify caller is admin
        const user = await verifyAuth(req);
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile || !profile.is_admin) {
            return res.status(403).json({ error: "Admin access required." });
        }

        // 2. Extract invite data
        const { email, commission_rate } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required." });
        }

        // 3. Create invite token in Supabase
        const { data: invite, error } = await supabase
            .from('creator_invites')
            .insert({
                email,
                commission_rate: parseFloat(commission_rate) || 0.2
            })
            .select()
            .single();

        if (error) throw error;

        // 4. Construct the invite link
        const host = req.headers.host || "revisely.ai";
        const protocol = host.includes("localhost") ? "http" : "https";
        const inviteLink = `${protocol}://${host}/creator-setup?token=${invite.token}`;

        return res.status(200).json({ 
            message: "Invite generated successfully",
            token: invite.token,
            inviteLink
        });

    } catch (error) {
        console.error("Admin Invite Error:", error);
        return res.status(500).json({ error: error.message || "Failed to create invite token" });
    }
}
