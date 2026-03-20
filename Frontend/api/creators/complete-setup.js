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
        const { data: usersResponse, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) return res.status(500).json({ error: `Auth list error: ${listError.message}` });
        
        const existingUser = usersResponse?.users?.find(u => u.email === invite.email);

        if (existingUser) {
            userId = existingUser.id;
            const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password });
            if (updateAuthError) return res.status(500).json({ error: `Auth update error: ${updateAuthError.message}` });
        } else {
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: invite.email,
                password: password,
                email_confirm: true, 
                user_metadata: { full_name: full_name || "Creator" }
            });

            if (createError) {
                console.error("Auth Create Error:", createError);
                return res.status(500).json({ error: `Auth error: ${createError.message}` });
            }
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
            if (creatorError.code === '23505') {
                return res.status(400).json({ error: "This user is already a registered creator." });
            }
            console.error("Creator Table Insert Error:", creatorError);
            return res.status(500).json({ error: `Database error: ${creatorError.message}` });
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
        return res.status(500).json({ 
            error: "Failed to setup creator account", 
            details: error.message 
        });
    }
}
