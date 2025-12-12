/**
 * Authentication utilities for Vercel serverless functions
 */

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Verify authentication from request headers
 */
export async function verifyAuth(req) {
  if (!supabase) {
    throw new Error("Authentication service not configured");
  }

  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader) {
    throw new Error("Authorization header required");
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error("Invalid or expired token");
  }

  return user;
}

/**
 * Verify admin access
 */
export async function verifyAdmin(req) {
  const user = await verifyAuth(req);

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    throw new Error("Admin access required");
  }

  return user;
}

/**
 * CORS headers for Vercel functions
 */
export function corsHeaders() {
  // In Vercel, use the request origin or environment variable
  const origin = process.env.FRONTEND_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "*");
  
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

