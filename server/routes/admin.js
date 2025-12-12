import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Helper function to verify admin
async function verifyAdmin(req, res, next) {
  if (!supabase) {
    return res.status(503).json({ error: "Authentication service not configured" });
  }

  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header required" });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.user = user;
    req.isAdmin = true;
    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /api/admin/users
// Get all users with pagination
router.get("/users", verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    let query = supabase
      .from("profiles")
      .select(`
        id,
        email,
        full_name,
        is_admin,
        is_premium,
        created_at,
        updated_at
      `, { count: 'exact' })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/users/:id
// Get single user details
router.get("/users/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (profileError) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Get user's payment history
    const { data: payments } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(10);

    res.json({
      profile,
      subscription: subscription || null,
      recentPayments: payments || [],
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/users/:id/premium
// Grant or revoke premium access
router.put("/users/:id/premium", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_premium } = req.body;

    if (typeof is_premium !== "boolean") {
      return res.status(400).json({ error: "is_premium must be a boolean" });
    }

    // Update premium status
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ is_premium })
      .eq("id", id);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    // If granting premium, create a manual subscription record
    if (is_premium) {
      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", id)
        .eq("status", "active")
        .single();

      if (!existingSub) {
        // Create a manual subscription (no Stripe)
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        await supabase
          .from("subscriptions")
          .insert({
            user_id: id,
            plan_type: "yearly",
            status: "active",
            current_period_start: new Date().toISOString(),
            current_period_end: oneYearFromNow.toISOString(),
            stripe_subscription_id: `manual_${id}_${Date.now()}`,
          });
      }
    } else {
      // If revoking, cancel all active subscriptions
      await supabase
        .from("subscriptions")
        .update({ status: "canceled", canceled_at: new Date().toISOString() })
        .eq("user_id", id)
        .eq("status", "active");
    }

    res.json({ 
      message: `Premium access ${is_premium ? "granted" : "revoked"}`,
      is_premium 
    });
  } catch (error) {
    console.error("Update premium error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/users/:id/admin
// Grant or revoke admin access
router.put("/users/:id/admin", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_admin } = req.body;

    if (typeof is_admin !== "boolean") {
      return res.status(400).json({ error: "is_admin must be a boolean" });
    }

    // Prevent removing your own admin access
    if (id === req.user.id && !is_admin) {
      return res.status(400).json({ error: "Cannot remove your own admin access" });
    }

    const { error } = await supabase
      .from("profiles")
      .update({ is_admin })
      .eq("id", id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ 
      message: `Admin access ${is_admin ? "granted" : "revoked"}`,
      is_admin 
    });
  } catch (error) {
    console.error("Update admin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/admin/users/:id
// Delete user (soft delete by deactivating)
router.delete("/users/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (id === req.user.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    // Delete user from auth (this will cascade delete profile and related data)
    const { error } = await supabase.auth.admin.deleteUser(id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/subscriptions
// Get all subscriptions
router.get("/subscriptions", verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status; // optional filter

    let query = supabase
      .from("subscriptions")
      .select(`
        *,
        profiles:user_id (
          email,
          full_name
        )
      `, { count: 'exact' })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: subscriptions, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      subscriptions: subscriptions || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Get subscriptions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/payments
// Get all payments
router.get("/payments", verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { data: payments, error, count } = await supabase
      .from("payments")
      .select(`
        *,
        profiles:user_id (
          email,
          full_name
        )
      `, { count: 'exact' })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      payments: payments || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/stats
// Get admin dashboard statistics
router.get("/stats", verifyAdmin, async (req, res) => {
  try {
    // Total users
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: 'exact', head: true });

    // Premium users
    const { count: premiumUsers } = await supabase
      .from("profiles")
      .select("*", { count: 'exact', head: true })
      .eq("is_premium", true);

    // Active subscriptions
    const { count: activeSubscriptions } = await supabase
      .from("subscriptions")
      .select("*", { count: 'exact', head: true })
      .eq("status", "active");

    // Total revenue (sum of successful payments)
    const { data: payments } = await supabase
      .from("payments")
      .select("amount")
      .eq("status", "succeeded");

    const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    // Monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: recentPayments } = await supabase
      .from("payments")
      .select("amount")
      .eq("status", "succeeded")
      .gte("created_at", thirtyDaysAgo.toISOString());

    const monthlyRevenue = recentPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    res.json({
      totalUsers: totalUsers || 0,
      premiumUsers: premiumUsers || 0,
      activeSubscriptions: activeSubscriptions || 0,
      totalRevenue: totalRevenue / 100, // Convert from cents/pence to currency
      monthlyRevenue: monthlyRevenue / 100,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

