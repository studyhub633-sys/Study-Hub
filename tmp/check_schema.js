import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: "./Frontend/.env" });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
    const { data, error } = await supabaseAdmin.from('profiles').select('*').limit(1);
    console.log("Profile sample:", data);
    console.log("Error:", error);
}

check();
