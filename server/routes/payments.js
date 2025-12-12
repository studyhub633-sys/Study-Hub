import express from "express";
import { createClient } from "@supabase/supabase-js";
import paypal from "@paypal/checkout-server-sdk";

const router = express.Router();

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// PayPal Configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox"; // 'sandbox' or 'live'
const PAYPAL_BASE_URL = PAYPAL_MODE === "live" 
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

// PayPal Plan IDs (create these in PayPal dashboard)
const PAYPAL_PLAN_IDS = {
  monthly: process.env.PAYPAL_PLAN_ID_MONTHLY || "",
  yearly: process.env.PAYPAL_PLAN_ID_YEARLY || "",
};

// PayPal Environment Setup
function paypalEnvironment() {
  if (PAYPAL_MODE === "live") {
    return new paypal.core.LiveEnvironment(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET);
  }
  return new paypal.core.SandboxEnvironment(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET);
}

function paypalClient() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return null;
  }
  return new paypal.core.PayPalHttpClient(paypalEnvironment());
}

// Helper function to verify authentication
async function verifyAuth(req, res, next) {
  if (!supabase) {
    return res.status(503).json({ error: "Authentication service not configured" });
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

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /api/payments/create-subscription
// Create PayPal subscription
router.post("/create-subscription", verifyAuth, async (req, res) => {
  const client = paypalClient();
  if (!client) {
    return res.status(503).json({ 
      error: "PayPal not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your .env file." 
    });
  }

  try {
    const { planType } = req.body; // 'monthly' or 'yearly'

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
      start_time: new Date(Date.now() + 60000).toISOString(), // Start in 1 minute
      subscriber: {
        name: {
          given_name: req.user.user_metadata?.full_name?.split(' ')[0] || "User",
          surname: req.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || "",
        },
        email_address: req.user.email,
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
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/premium?success=true`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/premium?canceled=true`,
      },
    });

    const response = await client.execute(request);

    if (response.statusCode === 201) {
      // Store subscription in database (pending)
      await supabase
        .from("subscriptions")
        .insert({
          user_id: req.user.id,
          plan_type: planType,
          status: "pending",
          paypal_subscription_id: response.result.id,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + (planType === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
        });

      // Return approval URL
      const approvalUrl = response.result.links.find(link => link.rel === "approve")?.href;

      res.json({
        subscriptionId: response.result.id,
        approvalUrl: approvalUrl,
      });
    } else {
      res.status(response.statusCode).json({ 
        error: "Failed to create subscription",
        details: response.result 
      });
    }

  } catch (error) {
    console.error("PayPal subscription creation error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
});

// POST /api/payments/webhook
// PayPal webhook handler
router.post("/webhook", express.json(), async (req, res) => {
  const client = paypalClient();
  if (!client) {
    return res.status(503).json({ error: "PayPal not configured" });
  }

  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    const headers = req.headers;

    // Verify webhook signature (optional but recommended)
    if (webhookId && headers["paypal-transmission-id"]) {
      try {
        const request = new paypal.notifications.WebhooksVerifyRequest();
        request.headers = {
          "PAYPAL-AUTH-ALGO": headers["paypal-auth-algo"] || "",
          "PAYPAL-CERT-URL": headers["paypal-cert-url"] || "",
          "PAYPAL-TRANSMISSION-ID": headers["paypal-transmission-id"] || "",
          "PAYPAL-TRANSMISSION-SIG": headers["paypal-transmission-sig"] || "",
          "PAYPAL-TRANSMISSION-TIME": headers["paypal-transmission-time"] || "",
        };
        request.requestBody({
          webhook_id: webhookId,
          webhook_event: req.body,
        });

        await client.execute(request);
      } catch (verifyError) {
        console.error("Webhook verification failed:", verifyError);
        // Continue anyway for development, but log the error
        // In production, you might want to return an error here
      }
    }

    const event = req.body;
    const eventType = event.event_type;

    try {
      switch (eventType) {
        case "BILLING.SUBSCRIPTION.CREATED":
        case "BILLING.SUBSCRIPTION.ACTIVATED": {
          await handleSubscriptionActivated(event);
          break;
        }

        case "BILLING.SUBSCRIPTION.UPDATED": {
          await handleSubscriptionUpdated(event);
          break;
        }

        case "BILLING.SUBSCRIPTION.CANCELLED":
        case "BILLING.SUBSCRIPTION.EXPIRED": {
          await handleSubscriptionCancelled(event);
          break;
        }

        case "PAYMENT.SALE.COMPLETED":
        case "PAYMENT.CAPTURE.COMPLETED": {
          await handlePaymentCompleted(event);
          break;
        }

        case "PAYMENT.SALE.DENIED":
        case "PAYMENT.SALE.REFUNDED":
        case "PAYMENT.CAPTURE.DENIED":
        case "PAYMENT.CAPTURE.REFUNDED": {
          await handlePaymentFailed(event);
          break;
        }

        default:
          console.log(`Unhandled event type: ${eventType}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook handler error:", error);
      res.status(500).json({ error: "Webhook handler failed" });
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Helper: Handle subscription activated
async function handleSubscriptionActivated(event) {
  const subscriptionId = event.resource?.id;
  const status = event.resource?.status;

  if (!subscriptionId) return;

  // Get subscription details from PayPal
  const client = paypalClient();
  const request = new paypal.subscriptions.SubscriptionsGetRequest(subscriptionId);
  const response = await client.execute(request);

  if (response.statusCode === 200) {
    const subscription = response.result;
    const userId = subscription.subscriber?.email_address 
      ? await getUserIdByEmail(subscription.subscriber.email_address)
      : null;

    if (userId) {
      // Update or create subscription
      await supabase
        .from("subscriptions")
        .upsert({
          user_id: userId,
          plan_type: subscription.billing_info?.cycle_executions?.[0]?.tenure_type === "REGULAR" ? "monthly" : "yearly",
          status: mapPayPalStatus(status),
          paypal_subscription_id: subscriptionId,
          paypal_plan_id: subscription.plan_id,
          current_period_start: subscription.billing_info?.next_billing_time 
            ? new Date(subscription.billing_info.next_billing_time).toISOString()
            : new Date().toISOString(),
          current_period_end: subscription.billing_info?.next_billing_time
            ? new Date(new Date(subscription.billing_info.next_billing_time).getTime() + (subscription.billing_info.cycle_executions?.[0]?.tenure_type === "REGULAR" ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }, {
          onConflict: "paypal_subscription_id"
        });

      // Update premium status
      if (mapPayPalStatus(status) === "active") {
        await supabase
          .from("profiles")
          .update({ is_premium: true })
          .eq("id", userId);
      }
    }
  }
}

// Helper: Handle subscription updated
async function handleSubscriptionUpdated(event) {
  const subscriptionId = event.resource?.id;
  const status = event.resource?.status;

  if (!subscriptionId) return;

  await supabase
    .from("subscriptions")
    .update({
      status: mapPayPalStatus(status),
      updated_at: new Date().toISOString(),
    })
    .eq("paypal_subscription_id", subscriptionId);

  // Update premium status
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("paypal_subscription_id", subscriptionId)
    .single();

  if (subscription) {
    const isActive = mapPayPalStatus(status) === "active";
    await supabase
      .from("profiles")
      .update({ is_premium: isActive })
      .eq("id", subscription.user_id);
  }
}

// Helper: Handle subscription cancelled
async function handleSubscriptionCancelled(event) {
  const subscriptionId = event.resource?.id;

  if (!subscriptionId) return;

  await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
    })
    .eq("paypal_subscription_id", subscriptionId);

  // Remove premium status
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("paypal_subscription_id", subscriptionId)
    .single();

  if (subscription) {
    await supabase
      .from("profiles")
      .update({ is_premium: false })
      .eq("id", subscription.user_id);
  }
}

// Helper: Handle payment completed
async function handlePaymentCompleted(event) {
  const sale = event.resource;
  // PayPal subscription ID can be in different places depending on event type
  const subscriptionId = sale.billing_agreement_id || sale.subscription_id || event.resource_id;

  if (!subscriptionId) {
    // Try to find subscription by payment ID
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("subscription_id")
      .eq("paypal_payment_id", sale.id || event.id)
      .single();
    
    if (existingPayment?.subscription_id) {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("user_id, id, plan_type")
        .eq("id", existingPayment.subscription_id)
        .single();

      if (subscription) {
        await supabase
          .from("payments")
          .update({
            status: "succeeded",
          })
          .eq("paypal_payment_id", sale.id || event.id);
      }
    }
    return;
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("user_id, id, plan_type")
    .eq("paypal_subscription_id", subscriptionId)
    .single();

  if (subscription) {
    await supabase
      .from("payments")
      .upsert({
        user_id: subscription.user_id,
        subscription_id: subscription.id,
        amount: Math.round(parseFloat(sale.amount?.total || sale.amount?.value || "0") * 100), // Convert to cents/pence
        currency: sale.amount?.currency_code || sale.amount?.currency || "GBP",
        status: "succeeded",
        paypal_payment_id: sale.id || event.id,
        plan_type: subscription.plan_type,
      }, {
        onConflict: "paypal_payment_id"
      });
  }
}

// Helper: Handle payment failed
async function handlePaymentFailed(event) {
  const sale = event.resource;
  const subscriptionId = sale.billing_agreement_id || sale.subscription_id || event.resource_id;

  if (!subscriptionId) return;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("user_id, id, plan_type")
    .eq("paypal_subscription_id", subscriptionId)
    .single();

  if (subscription) {
    await supabase
      .from("payments")
      .upsert({
        user_id: subscription.user_id,
        subscription_id: subscription.id,
        amount: Math.round(parseFloat(sale.amount?.total || sale.amount?.value || "0") * 100),
        currency: sale.amount?.currency_code || sale.amount?.currency || "GBP",
        status: "failed",
        paypal_payment_id: sale.id || event.id,
        plan_type: subscription.plan_type,
      }, {
        onConflict: "paypal_payment_id"
      });

    // Update subscription status
    await supabase
      .from("subscriptions")
      .update({ status: "past_due" })
      .eq("paypal_subscription_id", subscriptionId);
  }
}

// Helper: Map PayPal status to our status
function mapPayPalStatus(paypalStatus) {
  const statusMap = {
    "ACTIVE": "active",
    "APPROVAL_PENDING": "pending",
    "APPROVED": "active",
    "SUSPENDED": "past_due",
    "CANCELLED": "canceled",
    "EXPIRED": "expired",
  };
  return statusMap[paypalStatus] || "past_due";
}

// Helper: Get user ID by email
async function getUserIdByEmail(email) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();
  return profile?.id || null;
}

// GET /api/payments/subscription
// Get user's current subscription
router.get("/subscription", verifyAuth, async (req, res) => {
  try {
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", req.user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: error.message });
    }

    res.json({ subscription: subscription || null });
  } catch (error) {
    console.error("Get subscription error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/payments/cancel
// Cancel subscription
router.post("/cancel", verifyAuth, async (req, res) => {
  const client = paypalClient();
  if (!client) {
    return res.status(503).json({ error: "PayPal not configured" });
  }

  try {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("paypal_subscription_id")
      .eq("user_id", req.user.id)
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

    res.json({ message: "Subscription canceled successfully" });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

// GET /api/payments/payment-history
// Get user's payment history
router.get("/payment-history", verifyAuth, async (req, res) => {
  try {
    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ payments: payments || [] });
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
