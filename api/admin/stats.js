import { verifyAdmin, corsHeaders, supabase } from "../lib/auth.js";

export default async function handler(req, res) {
  const headers = corsHeaders();
  Object.keys(headers).forEach(key => {
    res.setHeader(key, headers[key]);
  });

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await verifyAdmin(req);

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
        total: totalRevenue / 100, // Convert from cents to currency
        currency: "GBP",
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    
    if (error.message === "Authorization header required" || error.message === "Invalid or expired token") {
      return res.status(401).json({ error: error.message });
    }
    
    if (error.message === "Admin access required") {
      return res.status(403).json({ error: error.message });
    }
    
    return res.status(500).json({ error: "Internal server error" });
  }
}

