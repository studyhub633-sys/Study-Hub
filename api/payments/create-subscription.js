import { verifyAuth, corsHeaders, supabase } from "../lib/auth.js";
import { paypalClient, PAYPAL_PLAN_IDS, isPayPalConfigured } from "../lib/paypal.js";
import paypal from "@paypal/checkout-server-sdk";

export default async function handler(req, res) {
  // Handle CORS
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
    // Verify authentication
    const user = await verifyAuth(req);

    // Check PayPal configuration
    const client = paypalClient();
    if (!client || !isPayPalConfigured()) {
      return res.status(503).json({ 
        error: "PayPal not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET." 
      });
    }

    const { planType } = req.body;

    if (!planType || !['monthly', 'yearly'].includes(planType)) {
      return res.status(400).json({ error: "Invalid plan type. Must be 'monthly' or 'yearly'" });
    }

    const planId = PAYPAL_PLAN_IDS[planType];
    if (!planId) {
      return res.status(500).json({ 
        error: `PayPal plan ID for ${planType} plan not configured` 
      });
    }

    // Create subscription request
    const request = new paypal.subscriptions.SubscriptionsCreateRequest();
    request.requestBody({
      plan_id: planId,
      start_time: new Date(Date.now() + 60000).toISOString(),
      subscriber: {
        name: {
          given_name: user.user_metadata?.full_name?.split(' ')[0] || "User",
          surname: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || "",
        },
        email_address: user.email,
      },
      application_context: {
        brand_name: "Study Spark Hub",
        locale: "en-GB",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
        },
        return_url: `${process.env.FRONTEND_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173')}/premium?success=true`,
        cancel_url: `${process.env.FRONTEND_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173')}/premium?canceled=true`,
      },
    });

    const response = await client.execute(request);

    if (response.statusCode === 201) {
      // Store subscription in database (pending)
      await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan_type: planType,
          status: "pending",
          paypal_subscription_id: response.result.id,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + (planType === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
        });

      // Return approval URL
      const approvalUrl = response.result.links.find(link => link.rel === "approve")?.href;

      return res.status(200).json({
        subscriptionId: response.result.id,
        approvalUrl: approvalUrl,
      });
    } else {
      return res.status(response.statusCode).json({ 
        error: "Failed to create subscription",
        details: response.result 
      });
    }

  } catch (error) {
    console.error("Create subscription error:", error);
    
    if (error.message === "Authorization header required" || error.message === "Invalid or expired token") {
      return res.status(401).json({ error: error.message });
    }
    
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
}

