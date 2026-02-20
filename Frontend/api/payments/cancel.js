import { supabase, verifyAuth } from '../_utils/auth.js';

const PAYPAL_BASE_URL = process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

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
        throw new Error('Failed to get PayPal access token');
    }

    const data = await response.json();
    return data.access_token;
}

export default async function handler(req, res) {
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
        const user = await verifyAuth(req);

        // Find the user's active subscription
        const { data: subscription, error: fetchError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (fetchError) {
            console.error('[DB] Failed to fetch subscription:', fetchError);
            return res.status(500).json({ error: 'Failed to fetch subscription.' });
        }

        if (!subscription) {
            return res.status(404).json({ error: 'No active subscription found.' });
        }

        if (!subscription.paypal_subscription_id) {
            return res.status(400).json({ error: 'Subscription does not have a PayPal ID.' });
        }

        // Cancel the subscription on PayPal
        const accessToken = await getPayPalAccessToken();

        const cancelResponse = await fetch(
            `${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscription.paypal_subscription_id}/cancel`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reason: 'User requested cancellation',
                }),
            }
        );

        // PayPal returns 204 No Content on success
        if (!cancelResponse.ok && cancelResponse.status !== 204) {
            const errorText = await cancelResponse.text();
            console.error('[PayPal] Failed to cancel subscription:', errorText);
            return res.status(500).json({ error: 'Failed to cancel subscription with PayPal.' });
        }

        // Update our database — mark as cancelling at end of period
        const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
                cancel_at_period_end: true,
                canceled_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', subscription.id);

        if (updateError) {
            console.error('[DB] Failed to update subscription:', updateError);
            return res.status(500).json({ error: 'Subscription cancelled on PayPal but failed to update database.' });
        }

        console.log(`[Payment] Cancelled subscription ${subscription.paypal_subscription_id} for user ${user.id}`);

        return res.status(200).json({
            success: true,
            message: 'Subscription cancelled. You will retain premium access until the end of your billing period.',
            periodEnd: subscription.current_period_end,
        });

    } catch (error) {
        console.error('[Payment] Cancel error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
