import { corsHeaders } from "../lib/auth.js";

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY;
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

  const hasApiKey = !!HF_API_KEY;
  const hasSupabase = !!(supabaseUrl && supabaseServiceKey);

  return res.status(200).json({
    status: hasApiKey ? "ready" : "not_configured",
    services: {
      huggingface: hasApiKey ? "configured" : "missing_api_key",
      authentication: hasSupabase ? "configured" : "not_configured",
    },
    message: hasApiKey 
      ? "AI services are ready" 
      : "HUGGINGFACE_API_KEY not set in environment variables",
  });
}

