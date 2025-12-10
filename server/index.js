import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client
// Support both VITE_SUPABASE_URL and SUPABASE_URL for the URL
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error("Missing Supabase URL!");
  console.error("Please set SUPABASE_URL or VITE_SUPABASE_URL in your .env file");
}

if (!supabaseServiceKey) {
  console.warn("⚠️  Missing SUPABASE_SERVICE_ROLE_KEY!");
  console.warn("Some backend features may not work. To get your service role key:");
  console.warn("1. Go to https://app.supabase.com");
  console.warn("2. Select your project → Settings → API");
  console.warn("3. Copy the 'service_role' key (secret)");
  console.warn("4. Add it to your .env file as SUPABASE_SERVICE_ROLE_KEY");
}

// Only create Supabase client if we have the required keys
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Auth endpoints (optional - can be handled client-side)
// These are here if you want server-side auth verification
app.post("/api/auth/verify", async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: "Supabase not configured. Please set SUPABASE_SERVICE_ROLE_KEY in your .env file." });
  }

  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({ user });
  } catch (error) {
    console.error("Auth verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Example protected endpoint
app.get("/api/user/profile", async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: "Supabase not configured. Please set SUPABASE_SERVICE_ROLE_KEY in your .env file." });
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

    // Fetch user profile from database
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 is "not found" error
      return res.status(500).json({ error: profileError.message });
    }

    res.json({ user, profile: profile || null });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

