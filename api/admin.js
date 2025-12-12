import { verifyAdmin, corsHeaders, supabase } from "./lib/auth.js";

export default async function handler(req, res) {
  const headers = corsHeaders();
  Object.keys(headers).forEach(key => {
    res.setHeader(key, headers[key]);
  });

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Extract route from URL
  let path = req.url || "";
  path = path.split("?")[0]; // Remove query string
  path = path.replace(/^\/api\/admin/, "").replace(/^\//, "");
  const pathParts = path.split("/").filter(Boolean);
  const route = pathParts[0] || "users";
  const userId = pathParts[1];
  const action = pathParts[2]; // 'premium' or 'admin'

  try {
    const user = await verifyAdmin(req);

    switch (route) {
      case "users":
        if (userId) {
          if (action === "premium") {
            return await handleUpdatePremium(req, res, user, userId);
          } else if (action === "admin") {
            return await handleUpdateAdmin(req, res, user, userId);
          } else {
            return await handleGetUser(req, res, user, userId);
          }
        } else {
          return await handleGetUsers(req, res, user);
        }
      case "stats":
        return await handleGetStats(req, res, user);
      default:
        return res.status(404).json({ error: "Route not found" });
    }
  } catch (error) {
    console.error(`Admin API error (${route}):`, error);
    
    if (error.message === "Authorization header required" || error.message === "Invalid or expired token") {
      return res.status(401).json({ error: error.message });
    }
    
    if (error.message === "Admin access required") {
      return res.status(403).json({ error: error.message });
    }
    
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Get all users
async function handleGetUsers(req, res, user) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search || "";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .range(from, to)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  const { data: users, error, count } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({
    users: users || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}

// Get single user
async function handleGetUser(req, res, user, userId) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError) {
    return res.status(404).json({ error: "User not found" });
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  return res.status(200).json({
    profile,
    subscription: subscription || null,
    recentPayments: payments || [],
  });
}

// Update premium status
async function handleUpdatePremium(req, res, user, userId) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
    .eq("id", userId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ 
    message: is_premium ? "Premium access granted" : "Premium access revoked",
    is_premium 
  });
}

// Update admin status
async function handleUpdateAdmin(req, res, user, userId) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { is_admin } = req.body;

  if (typeof is_admin !== "boolean") {
    return res.status(400).json({ error: "is_admin must be a boolean" });
  }

  if (userId === user.id && !is_admin) {
    return res.status(400).json({ error: "You cannot revoke your own admin access" });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_admin })
    .eq("id", userId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ 
    message: is_admin ? "Admin access granted" : "Admin access revoked",
    is_admin 
  });
}

// Get stats
async function handleGetStats(req, res, user) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const [
    { count: totalUsers },
    { count: premiumUsers },
    { count: totalSubscriptions },
    { count: activeSubscriptions },
    { data: recentPayments },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_premium", true),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("payments").select("amount, status").order("created_at", { ascending: false }).limit(100),
  ]);

  const totalRevenue = recentPayments
    ?.filter(p => p.status === "succeeded")
    .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  return res.status(200).json({
    users: {
      total: totalUsers || 0,
      premium: premiumUsers || 0,
      regular: (totalUsers || 0) - (premiumUsers || 0),
    },
    subscriptions: {
      total: totalSubscriptions || 0,
      active: activeSubscriptions || 0,
      canceled: (totalSubscriptions || 0) - (activeSubscriptions || 0),
    },
    revenue: {
      total: totalRevenue / 100,
      currency: "GBP",
    },
  });
}

