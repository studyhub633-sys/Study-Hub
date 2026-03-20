import { supabase, verifyAuth } from "../_utils/auth.js";
import { applyCors, setNoStore } from "../_utils/http.js";

// Helper to check if a user is an admin
async function verifyAdminAuth(req) {
    const user = await verifyAuth(req);

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile || !profile.is_admin) {
        throw new Error("Admin access required.");
    }

    return user;
}

// ─── Main Router ────────────────────────────────────────────────
export default async function handler(req, res) {
    setNoStore(res);
    if (applyCors(req, res)) return;

    try {
        await verifyAdminAuth(req);
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const segments = url.pathname.replace(/^\/api\/admin\//, '').split('/').filter(Boolean);

    if (segments[0] === "stats") {
        return handleStats(req, res);
    }

    if (segments[0] === "users") {
        if (segments.length === 1) {
            return handleUsersList(req, res, url);
        }
        const userId = segments[1];
        if (segments.length === 2) {
            if (req.method === 'GET') return handleUserDetails(req, res, userId);
            if (req.method === 'DELETE') return handleDeleteUser(req, res, userId);
        }
        if (segments.length === 3 && segments[2] === 'premium') {
            return handleUpdatePremium(req, res, userId);
        }
        if (segments.length === 3 && segments[2] === 'admin') {
            return handleUpdateAdmin(req, res, userId);
        }
    }

    return res.status(404).json({ error: "Admin route not found" });
}

// ─── List Users ─────────────────────────────────────────────────
async function handleUsersList(req, res, url) {
    if (req.method !== 'GET') return res.status(405).json({ error: "Method not allowed" });

    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const search = url.searchParams.get('search') || "";
    const offset = (page - 1) * limit;

    try {
        let query = supabase
            .from('profiles')
            .select('id, email, full_name, is_admin, is_premium, created_at', { count: 'exact' });

        if (search) {
            query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
        }

        const { data: users, count, error } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return res.status(200).json({
            users,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error("Admin Users Error:", error);
        return res.status(500).json({ error: "Failed to fetch users" });
    }
}

// ─── Stats ──────────────────────────────────────────────────────
async function handleStats(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: "Method not allowed" });

    try {
        const [{ count: totalUsers }, { count: premiumUsers }, { count: activeSubscriptions }] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true),
            supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active')
        ]);

        const { data: payments } = await supabase
            .from('payments')
            .select('amount, created_at')
            .eq('status', 'succeeded');

        const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount / 100), 0) || 0;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const monthlyRevenue = payments
            ?.filter(p => new Date(p.created_at) >= thirtyDaysAgo)
            .reduce((sum, p) => sum + (p.amount / 100), 0) || 0;

        return res.status(200).json({
            totalUsers: totalUsers || 0,
            premiumUsers: premiumUsers || 0,
            activeSubscriptions: activeSubscriptions || 0,
            totalRevenue,
            monthlyRevenue
        });
    } catch (error) {
        console.error("Admin Stats Error:", error);
        return res.status(500).json({ error: "Failed to fetch stats" });
    }
}

// ─── User Details ───────────────────────────────────────────────
async function handleUserDetails(req, res, userId) {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .maybeSingle();

        return res.status(200).json({ profile, subscription });
    } catch (error) {
        console.error("Admin User Details Error:", error);
        return res.status(500).json({ error: "Failed to fetch user details" });
    }
}

// ─── Update Premium ─────────────────────────────────────────────
async function handleUpdatePremium(req, res, userId) {
    if (req.method !== 'PUT') return res.status(405).json({ error: "Method not allowed" });
    const { is_premium } = req.body;

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ is_premium })
            .eq('id', userId);

        if (error) throw error;
        return res.status(200).json({ message: `Premium access ${is_premium ? "granted" : "revoked"}` });
    } catch (error) {
        console.error("Admin Update Premium Error:", error);
        return res.status(500).json({ error: "Failed to update premium status" });
    }
}

// ─── Update Admin ───────────────────────────────────────────────
async function handleUpdateAdmin(req, res, userId) {
    if (req.method !== 'PUT') return res.status(405).json({ error: "Method not allowed" });
    const { is_admin } = req.body;

    const caller = await verifyAuth(req);
    if (caller.id === userId && !is_admin) {
        return res.status(400).json({ error: "You cannot revoke your own admin access." });
    }

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ is_admin })
            .eq('id', userId);

        if (error) throw error;
        return res.status(200).json({ message: `Admin access ${is_admin ? "granted" : "revoked"}` });
    } catch (error) {
        console.error("Admin Update Admin Error:", error);
        return res.status(500).json({ error: "Failed to update admin status" });
    }
}

// ─── Delete User ────────────────────────────────────────────────
async function handleDeleteUser(req, res, userId) {
    if (req.method !== 'DELETE') return res.status(405).json({ error: "Method not allowed" });

    const caller = await verifyAuth(req);
    if (caller.id === userId) {
        return res.status(400).json({ error: "You cannot delete your own account." });
    }

    try {
        const { error } = await supabase.auth.admin.deleteUser(userId);
        if (error) throw error;
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Admin Delete User Error:", error);
        return res.status(500).json({ error: "Failed to delete user" });
    }
}
