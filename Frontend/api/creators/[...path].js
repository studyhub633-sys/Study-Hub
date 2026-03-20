import { createClient } from "@supabase/supabase-js";
import { applyCors, setNoStore } from "../_utils/http.js";

// Initialize Supabase admin client for secure account creation
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

    const url = new URL(req.url, `http://${req.headers.host}`);
    const segments = url.pathname.replace(/^\/api\/creators\//, '').split('/').filter(Boolean);

    // GET /api/creators/verify-token?token=...
    if (segments[0] === "verify-token") {
        return handleVerifyToken(req, res, url);
    }

    // POST /api/creators/complete-setup
    if (segments[0] === "complete-setup") {
        return handleCompleteSetup(req, res);
    }

    return res.status(404).json({ error: "Creators API route not found" });
}

async function handleVerifyToken(req, res, url) {
    if (req.method !== 'GET') return res.status(405).json({ error: "Method not allowed" });
    
    const token = url.searchParams.get('token');
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
        return res.status(500).json({ error: "Failed to verify token" });
    }
}

async function handleCompleteSetup(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

    const { token, password, creator_code, full_name } = req.body;

    if (!token || !password || !creator_code) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const cleanCode = creator_code.trim().toUpperCase();

    try {
        // 1. Verify token repeatedly (prevent race conditions)
        const { data: invite, error: inviteError } = await supabaseAdmin
            .from('creator_invites')
            .select('*')
            .eq('token', token)
            .single();

        if (inviteError || !invite || invite.used || new Date(invite.expires_at) < new Date()) {
            return res.status(400).json({ error: "Invalid, used, or expired token" });
        }

        // 2. Check if Creator Code is already taken
        const { data: existingCode } = await supabaseAdmin
            .from('creators')
            .select('id')
            .eq('code', cleanCode)
            .maybeSingle();

        if (existingCode) {
            return res.status(400).json({ error: "That Creator Code is already taken. Please choose another." });
        }

        // 3. Find or Create the User in Auth
        let userId;
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === invite.email);

        if (existingUser) {
            userId = existingUser.id;
            // Optionally update their password if they want to ensure they can log in 
            // but we'll leave it as is, maybe they just forgot they had an account.
            // For safety, let's update the password so they definitely know it.
            await supabaseAdmin.auth.admin.updateUserById(userId, { password });
        } else {
            // Create user securely via Admin API, skipping email confirmation for immediate access
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: invite.email,
                password: password,
                email_confirm: true, 
                user_metadata: { full_name: full_name || "Creator" }
            });

            if (createError) throw createError;
            userId = newUser.user.id;
        }

        // 4. Update the profiles table with their name if provided
        if (full_name) {
            await supabaseAdmin.from('profiles').update({ full_name }).eq('id', userId);
        }

        // 5. Insert into creators table
        const { error: creatorError } = await supabaseAdmin
            .from('creators')
            .insert({
                user_id: userId,
                code: cleanCode,
                commission_rate: invite.commission_rate
            });

        if (creatorError) {
            // If they are already a creator, this will fail constraints. That's fine, we catch it.
            if (creatorError.code === '23505') { // unique violation
                return res.status(400).json({ error: "This user is already a registered creator." });
            }
            throw creatorError;
        }

        // 6. Burn the token
        await supabaseAdmin
            .from('creator_invites')
            .update({ used: true })
            .eq('id', invite.id);

        return res.status(200).json({ 
            success: true, 
            message: "Creator account setup successfully." 
        });

    } catch (error) {
        console.error("Creator Setup Error:", error);
        return res.status(500).json({ error: "Failed to setup creator account." });
    }
}
