import { supabase, verifyAuth } from "../_utils/auth.js";
import { applyCors, setNoStore } from "../_utils/http.js";

// Helper to check if a user is an admin
async function verifyAdminAuth(req) {
    const user = await verifyAuth(req);
    
    // Check if user is admin in Supabase profiles
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

export default async function handler(req, res) {
    setNoStore(res);
    if (applyCors(req, res)) return;

    try {
        await verifyAdminAuth(req);
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }

    const pathParts = req.params ? req.route.path.split('/') : new URL(req.url, `http://${req.headers.host}`).pathname.split('/');
    
    // Express route with :id parameter sets req.params.id
    // But we also need to distinguish the action.
    // The route mapping in server.js:
    // /api/admin/users -> GET
    // /api/admin/stats -> GET
    // /api/admin/users/:id -> GET, DELETE
    // /api/admin/users/:id/premium -> PUT
    // /api/admin/users/:id/admin -> PUT

    if (req.route && req.route.path === '/api/admin/users') {
        return handleUsersList(req, res);
    } else if (req.route && req.route.path === '/api/admin/stats') {
        return handleStats(req, res);
    } else if (req.route && req.route.path === '/api/admin/users/:id') {
        if (req.method === 'GET') return handleUserDetails(req, res);
        if (req.method === 'DELETE') return handleDeleteUser(req, res);
    } else if (req.route && req.route.path === '/api/admin/users/:id/premium') {
        if (req.method === 'PUT') return handleUpdatePremium(req, res);
    } else if (req.route && req.route.path === '/api/admin/users/:id/admin') {
        if (req.method === 'PUT') return handleUpdateAdmin(req, res);
    }

    return res.status(404).json({ error: "Admin API route not found or method not allowed" });
}

async function handleUsersList(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: "Method not allowed" });

    // Extract query params for search & pagination
    const url = new URL(req.url, `http://${req.headers.host}`);
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
        
        // monthly revenue (last 30 days)
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

async function handleUserDetails(req, res) {
    const { id } = req.params;
    
    try {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (profileError) throw profileError;

        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', id)
            .eq('status', 'active')
            .maybeSingle();

        return res.status(200).json({
            profile,
            subscription
        });
    } catch (error) {
        console.error("Admin User Details Error:", error);
        return res.status(500).json({ error: "Failed to fetch user details" });
    }
}

async function handleUpdatePremium(req, res) {
    const { id } = req.params;
    const { is_premium } = req.body;

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ is_premium })
            .eq('id', id);

        if (error) throw error;

        return res.status(200).json({ message: `Premium access ${is_premium ? "granted" : "revoked"}` });
    } catch (error) {
        console.error("Admin Update Premium Error:", error);
        return res.status(500).json({ error: "Failed to update user premium status" });
    }
}

async function handleUpdateAdmin(req, res) {
    const { id } = req.params;
    const { is_admin } = req.body;

    // Prevent removing admin from yourself
    const caller = await verifyAuth(req);
    if (caller.id === id && !is_admin) {
        return res.status(400).json({ error: "You cannot revoke your own admin access." });
    }

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ is_admin })
            .eq('id', id);

        if (error) throw error;

        return res.status(200).json({ message: `Admin access ${is_admin ? "granted" : "revoked"}` });
    } catch (error) {
        console.error("Admin Update Admin Error:", error);
        return res.status(500).json({ error: "Failed to update user admin status" });
    }
}

async function handleDeleteUser(req, res) {
    const { id } = req.params;
    
    // Prevent deleting yourself
    const caller = await verifyAuth(req);
    if (caller.id === id) {
        return res.status(400).json({ error: "You cannot delete your own account." });
    }

    try {
        // Technically supabase.auth.admin.deleteUser is needed for full auth deletion.
        // For now, we rely on cascade deletes from profiles or we use a service role key.
        // It requires the service_role key to delete from auth.users.
        const serviceRoleClient = require('@supabase/supabase-js').createClient(
            process.env.VITE_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { error } = await serviceRoleClient.auth.admin.deleteUser(id);
        if (error) throw error;

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Admin Delete User Error:", error);
        return res.status(500).json({ error: "Failed to delete user. Make sure SUPABASE_SERVICE_ROLE_KEY is set in backend .env" });
    }
}
