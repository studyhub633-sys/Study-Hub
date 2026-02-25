import { supabase, verifyAuth } from '../_utils/auth.js';

// ─── Main Router ────────────────────────────────────────────────
export default async function handler(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const action = url.pathname.split('/').pop();

    switch (action) {
        case 'create-payment':
            return handleCreatePayment(req, res);
        case 'subscription':
            return handleGetSubscription(req, res);
        case 'cancel':
            return handleCancel(req, res);
        case 'payment-history':
            return handlePaymentHistory(req, res);
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

// ─── Create Payment (one-time, called after PayPal order capture) ─────────
async function handleCreatePayment(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const user = await verifyAuth(req);
        const { paypalOrderId } = req.body;

        if (!paypalOrderId) {
            return res.status(400).json({ error: 'PayPal order ID is required.' });
        }

        // Verify the order with PayPal API
        const { token, base } = await getPayPalAccessToken();
        const orderRes = await fetch(`${base}/v2/checkout/orders/${paypalOrderId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!orderRes.ok) {
            const errText = await orderRes.text();
            console.error('[PayPal] Failed to verify order:', errText);
            return res.status(400).json({ error: 'Could not verify PayPal order.' });
        }

        const paypalOrder = await orderRes.json();

        if (paypalOrder.status !== 'COMPLETED') {
            return res.status(400).json({ error: `PayPal order is not completed (status: ${paypalOrder.status}).` });
        }

        // Check for existing active subscription / purchase
        const { data: existingSub } = await supabase
            .from('subscriptions')
            .select('id, status')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();

        if (existingSub) {
            return res.status(400).json({ error: 'You already have active premium access.' });
        }

        const now = new Date();

        // Insert active one-time purchase record
        const { data: newSub, error: dbError } = await supabase
            .from('subscriptions')
            .insert({
                user_id: user.id,
                plan_type: 'one_time',
                status: 'active',
                paypal_subscription_id: paypalOrderId, // reuse column for order ID
                current_period_start: now.toISOString(),
                current_period_end: null, // one-time = no expiry
            })
            .select('id')
            .single();

        if (dbError) {
            console.error('[DB] Failed to insert payment record:', dbError);
            return res.status(500).json({ error: 'Failed to create payment record.' });
        }

        // Activate premium
        await supabase
            .from('profiles')
            .update({ is_premium: true })
            .eq('id', user.id);

        // Record payment
        await supabase.from('payments').insert({
            user_id: user.id,
            subscription_id: newSub.id,
            amount: 2500, // £25.00 in pence
            currency: 'gbp',
            status: 'succeeded',
            paypal_subscription_id: paypalOrderId,
            plan_type: 'one_time',
        });

        console.log(`[PayPal] Activated one-time premium for user ${user.id} (order: ${paypalOrderId})`);

        return res.status(200).json({
            subscriptionId: newSub.id,
            status: 'active',
            message: 'Premium activated successfully.',
        });

    } catch (error) {
        console.error('[PayPal] Create payment error:', error);
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

// ─── Cancel / Deactivate Premium ───────────────────────────────
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
            return res.status(404).json({ error: 'No active premium access found.' });
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
            return res.status(500).json({ error: 'Failed to cancel premium.' });
        }

        // Deactivate premium
        await supabase
            .from('profiles')
            .update({ is_premium: false })
            .eq('id', user.id);

        console.log(`[PayPal] Deactivated premium for user ${user.id}`);

        return res.status(200).json({
            success: true,
            message: 'Premium access has been deactivated.',
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
