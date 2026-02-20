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
        const { subscriptionId } = req.body;

        if (!subscriptionId) {
            return res.status(400).json({ error: 'Subscription ID is required.' });
        }

        // Verify subscription status with PayPal
        const accessToken = await getPayPalAccessToken();

        const ppResponse = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!ppResponse.ok) {
            const errorText = await ppResponse.text();
            console.error('[PayPal] Failed to get subscription details:', errorText);
            return res.status(500).json({ error: 'Failed to verify subscription with PayPal.' });
        }

        const ppSubscription = await ppResponse.json();

        // Accept both ACTIVE and APPROVAL_PENDING (since PayPal may take a moment)
        if (!['ACTIVE', 'APPROVAL_PENDING'].includes(ppSubscription.status)) {
            return res.status(400).json({
                error: `Subscription is not active. Current status: ${ppSubscription.status}`,
            });
        }

        // Calculate period dates
        const startTime = ppSubscription.start_time || new Date().toISOString();
        const billingInfo = ppSubscription.billing_info;
        const nextBillingTime = billingInfo?.next_billing_time || null;

        // Determine end date based on plan type
        let periodEnd;
        if (nextBillingTime) {
            periodEnd = nextBillingTime;
        } else {
            // Estimate based on plan
            const start = new Date(startTime);
            const { data: subRecord } = await supabase
                .from('subscriptions')
                .select('plan_type')
                .eq('paypal_subscription_id', subscriptionId)
                .maybeSingle();

            if (subRecord?.plan_type === 'yearly') {
                start.setFullYear(start.getFullYear() + 1);
            } else {
                start.setMonth(start.getMonth() + 1);
            }
            periodEnd = start.toISOString();
        }

        // Update the subscription record in our database
        const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
                status: ppSubscription.status === 'ACTIVE' ? 'active' : 'pending',
                current_period_start: startTime,
                current_period_end: periodEnd,
                updated_at: new Date().toISOString(),
            })
            .eq('paypal_subscription_id', subscriptionId)
            .eq('user_id', user.id);

        if (updateError) {
            console.error('[DB] Failed to update subscription:', updateError);
            return res.status(500).json({ error: 'Failed to update subscription record.' });
        }

        // If subscription is active, grant premium access
        if (ppSubscription.status === 'ACTIVE') {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ is_premium: true })
                .eq('id', user.id);

            if (profileError) {
                console.error('[DB] Failed to update premium status:', profileError);
            }

            // Record the initial payment if billing info exists
            if (billingInfo?.last_payment) {
                const amount = Math.round(
                    parseFloat(billingInfo.last_payment.amount?.value || '0') * 100
                );
                const currency = billingInfo.last_payment.amount?.currency_code?.toLowerCase() || 'gbp';

                const { data: subData } = await supabase
                    .from('subscriptions')
                    .select('id, plan_type')
                    .eq('paypal_subscription_id', subscriptionId)
                    .single();

                if (subData) {
                    await supabase
                        .from('payments')
                        .insert({
                            user_id: user.id,
                            subscription_id: subData.id,
                            amount,
                            currency,
                            status: 'succeeded',
                            paypal_payment_id: `${subscriptionId}_initial`,
                            plan_type: subData.plan_type,
                        });
                }
            }
        }

        console.log(`[Payment] Activated subscription ${subscriptionId} for user ${user.id}`);

        return res.status(200).json({
            success: true,
            status: ppSubscription.status === 'ACTIVE' ? 'active' : 'pending',
            message: ppSubscription.status === 'ACTIVE'
                ? 'Subscription activated! You now have premium access.'
                : 'Subscription is being processed. Premium will be activated shortly.',
        });

    } catch (error) {
        console.error('[Payment] Activate error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
