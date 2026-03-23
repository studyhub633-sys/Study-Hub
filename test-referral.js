import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: "./Frontend/.env" });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function simulateReferral() {
    console.log("Starting Referral Simulation...");

    // 1. Get the creator (we assume there's only 1 right now based on recent tests)
    const { data: creator, error: creatorError } = await supabaseAdmin
        .from('creators')
        .select('*')
        .limit(1)
        .single();
    
    if (creatorError || !creator) {
        console.error("No creator found in database to test with:", creatorError);
        return;
    }

    console.log(`Found Creator: ${creator.code} (ID: ${creator.id})`);

    // 2. Get a random user to act as the "buyer" (not the creator themselves)
    const { data: randomUser, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email')
        .neq('id', creator.user_id)
        .limit(1)
        .single();

    if (userError || !randomUser) {
        console.error("No valid test user found:", userError);
        return;
    }

    console.log(`Simulating purchase by User: ${randomUser.email || randomUser.id}`);

    const purchaseAmount = 25.00; // Standard premium price
    const commission = parseFloat((purchaseAmount * creator.commission_rate).toFixed(2));

    // 3. Insert the referral record (this is what normally happens during Stripe webhook/confirmation)
    const { data: referral, error: referralError } = await supabaseAdmin
        .from('creator_referrals')
        .insert({
            creator_id: creator.id,
            referred_user_id: randomUser.id,
            amount_paid: purchaseAmount,
            commission: commission
        })
        .select()
        .single();

    if (referralError) {
        console.error("Failed to insert referral:", referralError);
        return;
    }

    console.log("\n✅ SUCCESS! Referral recorded.");
    console.log("-----------------------------------------");
    console.log(`Creator Code Used : ${creator.code}`);
    console.log(`Amount Paid       : £${purchaseAmount}`);
    console.log(`Commission Earned : £${commission} (${creator.commission_rate * 100}%)`);
    console.log("-----------------------------------------");
    console.log("Please refresh your Creator Dashboard to see the new stats!");
}

simulateReferral();
