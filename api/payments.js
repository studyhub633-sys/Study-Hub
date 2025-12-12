import { verifyAuth, corsHeaders, supabase } from "./lib/auth.js";
import { paypalClient, PAYPAL_PLAN_IDS, isPayPalConfigured } from "./lib/paypal.js";
import paypal from "@paypal/checkout-server-sdk";

// Helper functions for webhook
async function getUserIdByEmail(email) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();
  return profile?.id || null;
}

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

export default async function handler(req, res) {
  const headers = corsHeaders();
  Object.keys(headers).forEach(key => {
    res.setHeader(key, headers[key]);
  });

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Extract route from URL
  let path = req.url || "";
  path = path.split("?")[0]; // Remove query string
  path = path.replace(/^\/api\/payments/, "").replace(/^\//, "");
  const route = path.split("/").filter(Boolean)[0] || "";
  
  // Determine route based on path and method
  let actualRoute = route;
  if (!actualRoute) {
    // No path means root - check if it's webhook or create-subscription
    if (req.method === "POST" && (req.headers["paypal-transmission-id"] || req.body?.event_type)) {
      actualRoute = "webhook";
    } else if (req.method === "POST") {
      actualRoute = "create-subscription";
    } else if (req.method === "GET") {
      actualRoute = "subscription";
    }
  }

  try {
    // Webhook doesn't need auth - handle it separately
    if (actualRoute === "webhook") {
      return await handleWebhook(req, res);
    }
    
    // All other routes need auth
    const user = await verifyAuth(req);

    switch (actualRoute) {
      case "create-subscription":
        return await handleCreateSubscription(req, res, user);
      case "subscription":
        return await handleGetSubscription(req, res, user);
      case "cancel":
        return await handleCancel(req, res, user);
      case "payment-history":
        return await handlePaymentHistory(req, res, user);
      case "webhook":
        return await handleWebhook(req, res);
      default:
        return res.status(404).json({ error: `Route not found: ${actualRoute || route}` });
    }
  } catch (error) {
    console.error(`Payment API error (${route}):`, error);
    
    if (error.message === "Authorization header required" || error.message === "Invalid or expired token") {
      return res.status(401).json({ error: error.message });
    }
    
    return res.status(500).json({ error: "Internal server error", message: error.message });
  }
}

// Create subscription
async function handleCreateSubscription(req, res, user) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
}

// Get subscription
async function handleGetSubscription(req, res, user) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ subscription: subscription || null });
}

// Cancel subscription
async function handleCancel(req, res, user) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

  const request = new paypal.subscriptions.SubscriptionsCancelRequest(subscription.paypal_subscription_id);
  request.requestBody({
    reason: "User requested cancellation",
  });

  await client.execute(request);

  await supabase
    .from("subscriptions")
    .update({ 
      status: "canceled",
      canceled_at: new Date().toISOString(),
      cancel_at_period_end: true,
    })
    .eq("paypal_subscription_id", subscription.paypal_subscription_id);

  return res.status(200).json({ message: "Subscription canceled successfully" });
}

// Payment history
async function handlePaymentHistory(req, res, user) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
}

// Webhook handler
async function handleWebhook(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const client = paypalClient();
  if (!client || !isPayPalConfigured()) {
    return res.status(503).json({ error: "PayPal not configured" });
  }

  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const headers = req.headers;

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
    }
  }

  const event = req.body;
  const eventType = event.event_type;

  switch (eventType) {
    case "BILLING.SUBSCRIPTION.CREATED":
    case "BILLING.SUBSCRIPTION.ACTIVATED":
      await handleSubscriptionActivated(event);
      break;
    case "BILLING.SUBSCRIPTION.UPDATED":
      await handleSubscriptionUpdated(event);
      break;
    case "BILLING.SUBSCRIPTION.CANCELLED":
    case "BILLING.SUBSCRIPTION.EXPIRED":
      await handleSubscriptionCancelled(event);
      break;
    case "PAYMENT.SALE.COMPLETED":
    case "PAYMENT.CAPTURE.COMPLETED":
      await handlePaymentCompleted(event);
      break;
    case "PAYMENT.SALE.DENIED":
    case "PAYMENT.SALE.REFUNDED":
    case "PAYMENT.CAPTURE.DENIED":
    case "PAYMENT.CAPTURE.REFUNDED":
      await handlePaymentFailed(event);
      break;
    default:
      console.log(`Unhandled event type: ${eventType}`);
  }

  return res.status(200).json({ received: true });
}

async function handleSubscriptionActivated(event) {
  const subscriptionId = event.resource?.id;
  const status = event.resource?.status;

  if (!subscriptionId) return;

  const client = paypalClient();
  if (!client) return;

  try {
    const request = new paypal.subscriptions.SubscriptionsGetRequest(subscriptionId);
    const response = await client.execute(request);

    if (response.statusCode === 200) {
      const subscription = response.result;
      const userId = subscription.subscriber?.email_address 
        ? await getUserIdByEmail(subscription.subscriber.email_address)
        : null;

      if (userId) {
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

        if (mapPayPalStatus(status) === "active") {
          await supabase
            .from("profiles")
            .update({ is_premium: true })
            .eq("id", userId);
        }
      }
    }
  } catch (error) {
    console.error("Error handling subscription activated:", error);
  }
}

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

async function handlePaymentCompleted(event) {
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
        status: "succeeded",
        paypal_payment_id: sale.id || event.id,
        plan_type: subscription.plan_type,
      }, {
        onConflict: "paypal_payment_id"
      });
  }
}

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

    await supabase
      .from("subscriptions")
      .update({ status: "past_due" })
      .eq("paypal_subscription_id", subscriptionId);
  }
}

