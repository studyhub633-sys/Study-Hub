import { verifyAuth, corsHeaders, supabase } from "../lib/auth.js";

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
    const user = await verifyAuth(req);

    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ payments: payments || [] });
  } catch (error) {
    console.error("Get payment history error:", error);
    
    if (error.message === "Authorization header required" || error.message === "Invalid or expired token") {
      return res.status(401).json({ error: error.message });
    }
    
    return res.status(500).json({ error: "Internal server error" });
  }
}

