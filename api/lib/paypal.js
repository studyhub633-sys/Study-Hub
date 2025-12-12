/**
 * PayPal utilities for Vercel serverless functions
 */

import paypal from "@paypal/checkout-server-sdk";

// PayPal Configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox";

// PayPal Plan IDs
export const PAYPAL_PLAN_IDS = {
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

export function paypalClient() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return null;
  }
  return new paypal.core.PayPalHttpClient(paypalEnvironment());
}

export function isPayPalConfigured() {
  return !!(PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET);
}

