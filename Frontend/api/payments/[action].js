import Stripe from "stripe";
import { supabase, verifyAuth } from "../_utils/auth.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
});

// ─── Main Router ────────────────────────────────────────────────
export default async function handler(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const action = url.pathname.split("/").pop();

    switch (action) {
        case "create-payment":
            return handleCreatePayment(req, res);
        case "confirm-stripe":
            return handleConfirmStripe(req, res);
        case "subscription":
            return handleGetSubscription(req, res);
        case "cancel":
            return handleCancel(req, res);
        case "payment-history":
            return handlePaymentHistory(req, res);
        default:
            return res.status(404).json({ error: "Payment action not found" });
    }
}

// ─── Create Stripe PaymentIntent (one-time) ─────────
async function handleCreatePayment(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const user = await verifyAuth(req);
        const { amount, currency, provider } = req.body || {};

        if (provider !== "stripe") {
            return res.status(400).json({ error: "Unsupported payment provider." });
        }

        if (!amount || !currency) {
            return res.status(400).json({ error: "Amount and currency are required." });
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

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // e.g. 25.0 -> 2500
            currency: currency.toLowerCase(), // "GBP" -> "gbp"
            metadata: {
                user_id: user.id,
                plan_type: "one_time",
            },
        });

        return res.status(200).json({
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error) {
        console.error('[Stripe] Create payment error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}

// ─── Confirm Stripe Payment & Activate Premium ─────────
async function handleConfirmStripe(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const user = await verifyAuth(req);
        const { paymentIntentId } = req.body || {};

        if (!paymentIntentId) {
            return res.status(400).json({ error: 'Stripe paymentIntentId is required.' });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (!paymentIntent || !['succeeded', 'requires_capture'].includes(paymentIntent.status)) {
            return res.status(400).json({ error: `Stripe payment is not completed (status: ${paymentIntent?.status}).` });
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
                stripe_payment_intent_id: paymentIntentId,
                current_period_start: now.toISOString(),
                current_period_end: null,
            })
            .select('id')
            .single();

        if (dbError) {
            console.error('[DB] Failed to insert Stripe payment record:', JSON.stringify(dbError));
            return res.status(500).json({
                error: 'Failed to create payment record.',
                detail: dbError.message,   // <-- expose this temporarily
                code: dbError.code
            });
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
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            stripe_payment_intent_id: paymentIntentId,
            plan_type: 'one_time',
        });

        console.log(`[Stripe] Activated one-time premium for user ${user.id} (paymentIntent: ${paymentIntentId})`);

        return res.status(200).json({
            subscriptionId: newSub.id,
            status: 'active',
            message: 'Premium activated successfully.',
        });

    } catch (error) {
        console.error('[Stripe] Confirm payment error:', error);
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
        console.error('[Stripe] Get subscription error:', error);
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

        console.log(`[Stripe] Deactivated premium for user ${user.id}`);

        return res.status(200).json({
            success: true,
            message: 'Premium access has been deactivated.',
        });

    } catch (error) {
        console.error('[Stripe] Cancel error:', error);
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
        console.error('[Stripe] Payment history error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
