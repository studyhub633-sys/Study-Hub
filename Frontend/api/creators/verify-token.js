import { createClient } from "@supabase/supabase-js";
import { applyCors, setNoStore } from "../_utils/http.js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : null;

export default async function handler(req, res) {
    setNoStore(res);
    if (applyCors(req, res)) return;

    if (!supabaseAdmin) {
        return res.status(500).json({ error: "Server misconfiguration: Missing Supabase Admin credentials" });
    }

    if (req.method !== 'GET') return res.status(405).json({ error: "Method not allowed" });
    
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Token is required" });

    try {
        const { data: invite, error } = await supabaseAdmin
            .from('creator_invites')
            .select('*')
            .eq('token', token)
            .single();

        if (error || !invite) {
            return res.status(400).json({ error: "Invalid or expired invite token" });
        }

        if (invite.used) {
            return res.status(400).json({ error: "This invite link has already been used" });
        }

        if (new Date(invite.expires_at) < new Date()) {
            return res.status(400).json({ error: "This invite link has expired" });
        }

        return res.status(200).json({ 
            valid: true, 
            email: invite.email,
            commission_rate: invite.commission_rate
        });

    } catch (error) {
        console.error("Verify Token Error:", error);
        return res.status(500).json({ error: "Failed to verify token", details: error.message });
    }
}
