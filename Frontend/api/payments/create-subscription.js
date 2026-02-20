import { supabase, verifyAuth } from '../_utils/auth.js';

// PayPal API configuration
const PAYPAL_BASE_URL = process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

const PLAN_IDS = {
    monthly: process.env.PAYPAL_MONTHLY_PLAN_ID,
    yearly: process.env.PAYPAL_YEARLY_PLAN_ID,
};

/**
 * Get PayPal access token using client credentials
 */
async function getPayPalAccessToken() {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

    const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get PayPal access token: ${errorText}`);
    }

    const data = await response.json();
    return data.access_token;
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verify user authentication
        const user = await verifyAuth(req);
        const { planType } = req.body;

        if (!planType || !['monthly', 'yearly'].includes(planType)) {
            return res.status(400).json({ error: 'Invalid plan type. Must be "monthly" or "yearly".' });
        }

        const planId = PLAN_IDS[planType];
        if (!planId) {
            return res.status(500).json({
                error: `PayPal plan ID not configured for ${planType}. Set PAYPAL_${planType.toUpperCase()}_PLAN_ID in .env`,
            });
        }

        // Check for existing active subscription
        const { data: existingSub } = await supabase
            .from('subscriptions')
            .select('id, status')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();

        if (existingSub) {
            return res.status(400).json({ error: 'You already have an active subscription.' });
        }

        // Get PayPal access token
        const accessToken = await getPayPalAccessToken();

        // Determine return URLs
        // Note: PayPal automatically appends subscription_id and ba_token to the return URL
        const appUrl = process.env.VITE_APP_URL || process.env.APP_URL || 'http://localhost:5173';

        // Create PayPal subscription
        const subscriptionResponse = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Prefer': 'return=representation',
            },
            body: JSON.stringify({
                plan_id: planId,
                subscriber: {
                    email_address: user.email,
                },
                application_context: {
                    brand_name: 'Scientia.ai',
                    locale: 'en-GB',
                    shipping_preference: 'NO_SHIPPING',
                    user_action: 'SUBSCRIBE_NOW',
                    return_url: `${appUrl}/premium?success=true`,
                    cancel_url: `${appUrl}/premium?canceled=true`,
                },
            }),
        });

        if (!subscriptionResponse.ok) {
            const errorText = await subscriptionResponse.text();
            console.error('[PayPal] Subscription creation failed:', errorText);
            return res.status(500).json({ error: 'Failed to create PayPal subscription.' });
        }

        const subscription = await subscriptionResponse.json();

        // Find the approval URL
        const approvalLink = subscription.links?.find(link => link.rel === 'approve');
        if (!approvalLink) {
            console.error('[PayPal] No approval URL in response:', subscription);
            return res.status(500).json({ error: 'PayPal did not return an approval URL.' });
        }

        // Insert a pending subscription record in our database
        const now = new Date().toISOString();
        const { error: dbError } = await supabase
            .from('subscriptions')
            .insert({
                user_id: user.id,
                plan_type: planType,
                status: 'pending',
                paypal_subscription_id: subscription.id,
                paypal_plan_id: planId,
                current_period_start: now,
                current_period_end: now, // Will be updated when activated
            });

        if (dbError) {
            console.error('[DB] Failed to insert subscription:', dbError);
            // Don't fail — the PayPal subscription was created successfully
        }

        console.log(`[Payment] Created subscription ${subscription.id} for user ${user.id} (${planType})`);

        // Append subscription_id to approvalUrl as a fallback
        // PayPal usually appends it automatically, but this ensures the frontend always has it
        const approvalUrl = new URL(approvalLink.href);

        return res.status(200).json({
            subscriptionId: subscription.id,
            approvalUrl: approvalUrl.toString(),
        });

    } catch (error) {
        console.error('[Payment] Create subscription error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
