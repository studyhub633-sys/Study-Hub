import { verifyAdmin, corsHeaders, supabase } from "../../../lib/auth.js";

export default async function handler(req, res) {
  const headers = corsHeaders();
  Object.keys(headers).forEach(key => {
    res.setHeader(key, headers[key]);
  });

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await verifyAdmin(req);
    const { id } = req.query;
    const { is_premium } = req.body;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

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
  } catch (error) {
    console.error("Update premium error:", error);
    
    if (error.message === "Authorization header required" || error.message === "Invalid or expired token") {
      return res.status(401).json({ error: error.message });
    }
    
    if (error.message === "Admin access required") {
      return res.status(403).json({ error: error.message });
    }
    
    return res.status(500).json({ error: "Internal server error" });
  }
}

