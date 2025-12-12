import { corsHeaders, supabase } from "../lib/auth.js";
import { paypalClient, isPayPalConfigured } from "../lib/paypal.js";
import paypal from "@paypal/checkout-server-sdk";

// Helper functions
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

export default async function handler(req, res) {
  // PayPal webhooks don't need CORS (they come from PayPal servers)
  // But we'll allow it for testing
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const client = paypalClient();
  if (!client || !isPayPalConfigured()) {
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
        // Continue anyway for development
      }
    }

    const event = req.body;
    const eventType = event.event_type;

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

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

