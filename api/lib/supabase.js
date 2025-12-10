import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client for serverless functions
// Support both VITE_SUPABASE_URL and SUPABASE_URL for the URL
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error("Missing Supabase URL!");
  console.error("Please set SUPABASE_URL or VITE_SUPABASE_URL in your Vercel environment variables");
}

if (!supabaseServiceKey) {
  console.warn("⚠️  Missing SUPABASE_SERVICE_ROLE_KEY!");
  console.warn("Some backend features may not work. To get your service role key:");
  console.warn("1. Go to https://app.supabase.com");
  console.warn("2. Select your project → Settings → API");
  console.warn("3. Copy the 'service_role' key (secret)");
  console.warn("4. Add it to your Vercel environment variables as SUPABASE_SERVICE_ROLE_KEY");
}

// Only create Supabase client if we have the required keys
export const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;


