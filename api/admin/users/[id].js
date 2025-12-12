import { verifyAdmin, corsHeaders, supabase } from "../../lib/auth.js";

export default async function handler(req, res) {
  const headers = corsHeaders();
  Object.keys(headers).forEach(key => {
    res.setHeader(key, headers[key]);
  });

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const user = await verifyAdmin(req);
    
    // Extract ID from URL path
    const urlParts = req.url.split('/');
    const idIndex = urlParts.indexOf('users') + 1;
    const id = urlParts[idIndex];
    const action = urlParts[idIndex + 1]; // 'premium' or 'admin'

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Handle GET /api/admin/users/:id
    if (req.method === "GET" && !action) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError) {
        return res.status(404).json({ error: "User not found" });
      }

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const { data: payments } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(10);

      return res.status(200).json({
        profile,
        subscription: subscription || null,
        recentPayments: payments || [],
      });
    }

    // Handle PUT /api/admin/users/:id/premium
    if (req.method === "PUT" && action === "premium") {
      const { is_premium } = req.body;

      if (typeof is_premium !== "boolean") {
        return res.status(400).json({ error: "is_premium must be a boolean" });
      }

      const { error } = await supabase
        .from("profiles")
        .update({ 
          is_premium,
          premium_ends_at: is_premium ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
        })
        .eq("id", id);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ 
        message: is_premium ? "Premium access granted" : "Premium access revoked",
        is_premium 
      });
    }

    // Handle PUT /api/admin/users/:id/admin
    if (req.method === "PUT" && action === "admin") {
      const { is_admin } = req.body;

      if (typeof is_admin !== "boolean") {
        return res.status(400).json({ error: "is_admin must be a boolean" });
      }

      if (id === user.id && !is_admin) {
        return res.status(400).json({ error: "You cannot revoke your own admin access" });
      }

      const { error } = await supabase
        .from("profiles")
        .update({ is_admin })
        .eq("id", id);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ 
        message: is_admin ? "Admin access granted" : "Admin access revoked",
        is_admin 
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Admin user operation error:", error);
    
    if (error.message === "Authorization header required" || error.message === "Invalid or expired token") {
      return res.status(401).json({ error: error.message });
    }
    
    if (error.message === "Admin access required") {
      return res.status(403).json({ error: error.message });
    }
    
    return res.status(500).json({ error: "Internal server error" });
  }
}

