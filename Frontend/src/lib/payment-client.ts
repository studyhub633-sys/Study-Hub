/**
 * Payment Client for Study Spark Hub
 * Handles PayPal payment integration
 */

// Use Vercel URL in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? window.location.origin
    : "http://localhost:3001");

import { createClient } from "@supabase/supabase-js";

/**
 * Get the current Supabase session token
 */
async function getAuthToken(supabaseClient?: any): Promise<string | null> {
  try {
    let supabase = supabaseClient;

    if (!supabase) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey =
        import.meta.env.VITE_SUPABASE_ANON_KEY ||
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Supabase credentials not found");
        return null;
      }

      supabase = createClient(supabaseUrl, supabaseAnonKey);
    }

    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
}

/**
 * Create PayPal subscription
 */
export async function createCheckoutSession(
  planType: "monthly" | "yearly",
  supabaseClient?: any
): Promise<{ subscriptionId: string; approvalUrl: string } | { error: string }> {
  try {
    const token = await getAuthToken(supabaseClient);

    if (!token) {
      return { error: "Not authenticated. Please sign in." };
    }

    console.log(`[Payment Client] Creating subscription for ${planType} plan`);
    console.log(`[Payment Client] API URL: ${API_BASE_URL}`);

    const response = await fetch(`${API_BASE_URL}/api/payments/create-subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ planType }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || `HTTP ${response.status}` };
      }
      console.error("[Payment Client] API Error:", errorData);
      return { error: errorData.error || `Failed to create subscription (${response.status})` };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[Payment Client] Network Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Network error occurred";

    // Provide more helpful error messages
    if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
      return {
        error: `Cannot connect to server. Make sure the backend is running at ${API_BASE_URL}`,
      };
    }

    return { error: errorMessage };
  }
}

/**
 * Get user's current subscription
 */
export async function getSubscription(supabaseClient?: any) {
  try {
    const token = await getAuthToken(supabaseClient);

    if (!token) {
      return { error: "Not authenticated" };
    }

    const response = await fetch(`${API_BASE_URL}/api/payments/subscription`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "Failed to get subscription" };
    }

    return data;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(supabaseClient?: any) {
  try {
    const token = await getAuthToken(supabaseClient);

    if (!token) {
      return { error: "Not authenticated" };
    }

    const response = await fetch(`${API_BASE_URL}/api/payments/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "Failed to cancel subscription" };
    }

    return data;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Get payment history
 */
export async function getPaymentHistory(supabaseClient?: any) {
  try {
    const token = await getAuthToken(supabaseClient);

    if (!token) {
      return { error: "Not authenticated" };
    }

    const response = await fetch(`${API_BASE_URL}/api/payments/payment-history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "Failed to get payment history" };
    }

    return data;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

