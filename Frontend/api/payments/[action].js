import { supabase, verifyAuth } from '../_utils/auth.js';

// ─── Main Router ────────────────────────────────────────────────
export default async function handler(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const action = url.pathname.split('/').pop();

    switch (action) {
        case 'create-subscription':
            return handleCreateSubscription(req, res);
        case 'subscription':
            return handleGetSubscription(req, res);
        case 'cancel':
            return handleCancel(req, res);
        case 'payment-history':
            return handlePaymentHistory(req, res);
        case 'paypal-webhook':
            return handlePayPalWebhook(req, res);
        default:
            return res.status(404).json({ error: 'Payment action not found' });
    }
}

// ─── Get PayPal Access Token ─────────────────────────────────────
async function getPayPalAccessToken() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const base = process.env.PAYPAL_ENV === 'sandbox'
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com';

    const response = await fetch(`${base}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    return { token: data.access_token, base };
}

// ─── Create Subscription (called after PayPal approval) ─────────
async function handleCreateSubscription(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const user = await verifyAuth(req);
        const { planType, paypalSubscriptionId } = req.body;

        if (!planType || !['monthly', 'yearly'].includes(planType)) {
            return res.status(400).json({ error: 'Invalid plan type. Must be "monthly" or "yearly".' });
        }

        if (!paypalSubscriptionId) {
            return res.status(400).json({ error: 'PayPal subscription ID is required.' });
        }

        // Verify the subscription with PayPal API
        const { token, base } = await getPayPalAccessToken();
        const subRes = await fetch(`${base}/v1/billing/subscriptions/${paypalSubscriptionId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!subRes.ok) {
            const errText = await subRes.text();
            console.error('[PayPal] Failed to verify subscription:', errText);
            return res.status(400).json({ error: 'Could not verify PayPal subscription.' });
        }

        const paypalSub = await subRes.json();

        if (paypalSub.status !== 'ACTIVE') {
            return res.status(400).json({ error: `PayPal subscription is not active (status: ${paypalSub.status}).` });
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

        const now = new Date();
        const periodEnd = new Date(now);
        if (planType === 'yearly') {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
        }

        // Insert active subscription
        const { data: newSub, error: dbError } = await supabase
            .from('subscriptions')
            .insert({
                user_id: user.id,
                plan_type: planType,
                status: 'active',
                paypal_subscription_id: paypalSubscriptionId,
                current_period_start: now.toISOString(),
                current_period_end: periodEnd.toISOString(),
            })
            .select('id')
            .single();

        if (dbError) {
            console.error('[DB] Failed to insert subscription:', dbError);
            return res.status(500).json({ error: 'Failed to create subscription record.' });
        }

        // Activate premium
        await supabase
            .from('profiles')
            .update({ is_premium: true })
            .eq('id', user.id);

        // Record payment
        const planAmounts = { monthly: 499, yearly: 2500 };
        await supabase.from('payments').insert({
            user_id: user.id,
            subscription_id: newSub.id,
            amount: planAmounts[planType] || 0,
            currency: 'gbp',
            status: 'succeeded',
            paypal_subscription_id: paypalSubscriptionId,
            plan_type: planType,
        });

        console.log(`[PayPal] Activated subscription ${newSub.id} for user ${user.id} (${planType})`);

        return res.status(200).json({
            subscriptionId: newSub.id,
            status: 'active',
            message: 'Subscription activated successfully.',
        });

    } catch (error) {
        console.error('[PayPal] Create subscription error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}

// ─── Get Subscription ──────────────────────────────────────────
async function handleGetSubscription(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const user = await verifyAuth(req);

        const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error('[DB] Failed to fetch subscription:', error);
            return res.status(500).json({ error: 'Failed to fetch subscription.' });
        }

        return res.status(200).json({
            subscription: subscription || null,
            isPremium: !!subscription,
        });

    } catch (error) {
        console.error('[PayPal] Get subscription error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}

// ─── Cancel Subscription ───────────────────────────────────────
async function handleCancel(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const user = await verifyAuth(req);

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

        // Cancel on PayPal side if we have a PayPal subscription ID
        if (subscription.paypal_subscription_id) {
            try {
                const { token, base } = await getPayPalAccessToken();
                await fetch(`${base}/v1/billing/subscriptions/${subscription.paypal_subscription_id}/cancel`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ reason: 'User requested cancellation' }),
                });
            } catch (ppErr) {
                console.warn('[PayPal] Could not cancel on PayPal side:', ppErr);
            }
        }

        const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
                status: 'canceled',
                cancel_at_period_end: true,
                canceled_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', subscription.id);

        if (updateError) {
            console.error('[DB] Failed to update subscription:', updateError);
            return res.status(500).json({ error: 'Failed to cancel subscription.' });
        }

        console.log(`[PayPal] Cancelled subscription ${subscription.id} for user ${user.id}`);

        return res.status(200).json({
            success: true,
            message: 'Subscription cancelled. You will retain premium access until the end of your billing period.',
            periodEnd: subscription.current_period_end,
        });

    } catch (error) {
        console.error('[PayPal] Cancel error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}

// ─── Payment History ───────────────────────────────────────────
async function handlePaymentHistory(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const user = await verifyAuth(req);

        const { data: payments, error } = await supabase
            .from('payments')
            .select('id, amount, currency, status, plan_type, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('[DB] Failed to fetch payment history:', error);
            return res.status(500).json({ error: 'Failed to fetch payment history.' });
        }

        const formattedPayments = (payments || []).map(payment => ({
            ...payment,
            amountFormatted: `£${(payment.amount / 100).toFixed(2)}`,
        }));

        return res.status(200).json({ payments: formattedPayments });

    } catch (error) {
        console.error('[PayPal] Payment history error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}

// ─── PayPal Webhook ────────────────────────────────────────────
async function handlePayPalWebhook(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, PayPal-Transmission-Id, PayPal-Transmission-Time, PayPal-Cert-Url, PayPal-Auth-Algo, PayPal-Transmission-Sig');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Respond immediately to acknowledge receipt
    res.status(200).json({ received: true });

    try {
        const event = req.body;
        const eventType = event?.event_type;
        console.log('[PayPal Webhook] Received event:', eventType);

        // Handle subscription cancellation from PayPal side
        if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
            const subscriptionId = event?.resource?.id;
            if (!subscriptionId) return;

            const { data: sub } = await supabase
                .from('subscriptions')
                .select('id, user_id')
                .eq('paypal_subscription_id', subscriptionId)
                .maybeSingle();

            if (sub) {
                await supabase.from('subscriptions').update({
                    status: 'canceled',
                    canceled_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }).eq('id', sub.id);

                await supabase.from('profiles')
                    .update({ is_premium: false })
                    .eq('id', sub.user_id);

                console.log(`[PayPal Webhook] Cancelled subscription ${sub.id} for user ${sub.user_id}`);
            }
        }

        // Handle subscription expiry / failed payment
        if (eventType === 'BILLING.SUBSCRIPTION.SUSPENDED' || eventType === 'BILLING.SUBSCRIPTION.EXPIRED') {
            const subscriptionId = event?.resource?.id;
            if (!subscriptionId) return;

            const { data: sub } = await supabase
                .from('subscriptions')
                .select('id, user_id')
                .eq('paypal_subscription_id', subscriptionId)
                .maybeSingle();

            if (sub) {
                await supabase.from('subscriptions').update({
                    status: 'canceled',
                    updated_at: new Date().toISOString(),
                }).eq('id', sub.id);

                await supabase.from('profiles')
                    .update({ is_premium: false })
                    .eq('id', sub.user_id);

                console.log(`[PayPal Webhook] Deactivated subscription ${sub.id} (${eventType})`);
            }
        }

    } catch (error) {
        console.error('[PayPal Webhook] Processing error:', error);
    }
}
