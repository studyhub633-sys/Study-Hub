import { verifyAuth, corsHeaders, supabase } from "../lib/auth.js";
import { paypalClient, isPayPalConfigured } from "../lib/paypal.js";
import paypal from "@paypal/checkout-server-sdk";

export default async function handler(req, res) {
  const headers = corsHeaders();
  Object.keys(headers).forEach(key => {
    res.setHeader(key, headers[key]);
  });

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const user = await verifyAuth(req);

    const client = paypalClient();
    if (!client || !isPayPalConfigured()) {
      return res.status(503).json({ error: "PayPal not configured" });
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("paypal_subscription_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!subscription) {
      return res.status(404).json({ error: "No active subscription found" });
    }

    // Cancel subscription in PayPal
    const request = new paypal.subscriptions.SubscriptionsCancelRequest(subscription.paypal_subscription_id);
    request.requestBody({
      reason: "User requested cancellation",
    });

    await client.execute(request);

    // Update in database
    await supabase
      .from("subscriptions")
      .update({ 
        status: "canceled",
        canceled_at: new Date().toISOString(),
        cancel_at_period_end: true,
      })
      .eq("paypal_subscription_id", subscription.paypal_subscription_id);

    return res.status(200).json({ message: "Subscription canceled successfully" });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    
    if (error.message === "Authorization header required" || error.message === "Invalid or expired token") {
      return res.status(401).json({ error: error.message });
    }
    
    return res.status(500).json({ error: "Failed to cancel subscription" });
  }
}

