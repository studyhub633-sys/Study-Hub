import Stripe from "stripe";
import { supabase, verifyAuth } from "../_utils/auth.js";
import { applyCors, setNoStore } from "../_utils/http.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
});

// ─── Plan Prices (GBP) ───────────────────────────────────────────
const PLAN_PRICES = {
    weekly:   0.99,
    monthly:  3.99,
    yearly:   25.00,
};

// How long each plan lasts
function getPlanPeriodEnd(planType, fromDate = new Date()) {
    const d = new Date(fromDate);
    switch (planType) {
        case 'weekly':  d.setDate(d.getDate() + 7); break;
        case 'monthly': d.setMonth(d.getMonth() + 1); break;
        case 'yearly':  d.setFullYear(d.getFullYear() + 1); break;
        default: return null;
    }
    return d.toISOString();
}

// ─── Discount Codes ──────────────────────────────────────────────
// code -> discount fraction (e.g. 0.2 = 20% off)
const DISCOUNT_CODES = {
    PUBE20: 0.2,
    FRANQ20: 0.2,
    FREE100: 1.0,  // 100% off for lifetime premium
};

// ─── Main Router ────────────────────────────────────────────────
export default async function handler(req, res) {
    setNoStore(res);
    if (applyCors(req, res)) return;

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

// ─── Create Stripe PaymentIntent ─────────────────────
async function handleCreatePayment(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const user = await verifyAuth(req);
        const { amount, currency, provider, discountCode, planType } = req.body || {};

        if (provider !== "stripe") {
            return res.status(400).json({ error: "Unsupported payment provider." });
        }

        if (amount === undefined || amount === null || !currency) {
            return res.status(400).json({ error: "Amount and currency are required." });
        }

        // Validate plan type
        const validPlan = planType && PLAN_PRICES[planType] ? planType : 'yearly';

        // Validate and apply discount code (server-side authoritative check)
        let finalAmount = amount;
        let appliedCode = null;
        if (discountCode) {
            const code = String(discountCode).trim().toUpperCase();
            const fraction = DISCOUNT_CODES[code];
            if (fraction !== undefined) {
                finalAmount = parseFloat((amount * (1 - fraction)).toFixed(2));
                appliedCode = code;
            } else {
                // Unknown code — reject so fraudulent amounts can't be submitted
                return res.status(400).json({ error: `Invalid discount code: ${discountCode}` });
            }
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

        // If the final amount is 0, we bypass Stripe entirely and activate premium directly
        if (finalAmount <= 0) {
            const now = new Date();

            const { data: newSub, error: dbError } = await supabase
                .from('subscriptions')
                .insert({
                    user_id: user.id,
                    plan_type: validPlan,
                    status: 'active',
                    stripe_payment_intent_id: `free_${Math.random().toString(36).substring(2, 15)}`,
                    current_period_start: now.toISOString(),
                    current_period_end: getPlanPeriodEnd(validPlan, now),
                })
                .select('id')
                .single();

            if (dbError) {
                console.error('[DB] Failed to insert free premium record:', dbError);
                return res.status(500).json({
                    error: 'Failed to create premium record.',
                    ...(process.env.NODE_ENV !== "production" ? { detail: dbError.message } : {}),
                });
            }

            await supabase
                .from('profiles')
                .update({ is_premium: true })
                .eq('id', user.id);

            await supabase.from('payments').insert({
                user_id: user.id,
                subscription_id: newSub.id,
                amount: 0,
                currency: currency.toLowerCase(),
                status: 'succeeded',
                stripe_payment_intent_id: null,
                plan_type: validPlan,
            });

            console.log(`Activated free ${validPlan} premium for user ${user.id} with code ${appliedCode}`);

            return res.status(200).json({
                clientSecret: null,
                isFree: true,
                message: "Premium activated successfully for free"
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(finalAmount * 100), // e.g. 20.0 -> 2000
            currency: currency.toLowerCase(),       // "GBP" -> "gbp"
            metadata: {
                user_id: user.id,
                plan_type: validPlan,
                ...(appliedCode ? { discount_code: appliedCode, original_amount: Math.round(amount * 100) } : {}),
            },
        });

        return res.status(200).json({
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error) {
        console.error('[Stripe] Create payment error:', error);
        return res.status(500).json({
            error: process.env.NODE_ENV !== "production"
                ? (error.message || 'Internal server error')
                : 'Payment processing failed.',
        });
    }
}

// ─── Confirm Stripe Payment & Activate Premium ─────────
async function handleConfirmStripe(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const user = await verifyAuth(req);
        const { paymentIntentId, planType } = req.body || {};

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
        const validPlan = planType && PLAN_PRICES[planType] ? planType : (paymentIntent.metadata?.plan_type || 'yearly');

        // Insert active purchase record
        const { data: newSub, error: dbError } = await supabase
            .from('subscriptions')
            .insert({
                user_id: user.id,
                plan_type: validPlan,
                status: 'active',
                stripe_payment_intent_id: paymentIntentId,
                current_period_start: now.toISOString(),
                current_period_end: getPlanPeriodEnd(validPlan, now),
            })
            .select('id')
            .single();

        if (dbError) {
            console.error('[DB] Failed to insert Stripe payment record:', JSON.stringify(dbError));
            return res.status(500).json({
                error: 'Failed to create payment record.',
                ...(process.env.NODE_ENV !== "production"
                    ? { detail: dbError.message, code: dbError.code }
                    : {}),
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
            plan_type: validPlan,
        });

        console.log(`[Stripe] Activated ${validPlan} premium for user ${user.id} (paymentIntent: ${paymentIntentId})`);

        return res.status(200).json({
            subscriptionId: newSub.id,
            status: 'active',
            message: 'Premium activated successfully.',
        });

    } catch (error) {
        console.error('[Stripe] Confirm payment error:', error);
        return res.status(500).json({
            error: process.env.NODE_ENV !== "production"
                ? (error.message || 'Internal server error')
                : 'Payment confirmation failed.',
        });
    }
}

// ─── Get Subscription ──────────────────────────────────────────
async function handleGetSubscription(req, res) {
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

        // ── Auto-expire weekly / monthly subs past their period end ──
        if (subscription && subscription.current_period_end) {
            const expiry = new Date(subscription.current_period_end);
            if (expiry < new Date()) {
                console.log(`[Subscription] Auto-expiring ${subscription.plan_type} sub ${subscription.id} for user ${user.id} (expired: ${subscription.current_period_end})`);

                // Mark subscription as expired
                await supabase
                    .from('subscriptions')
                    .update({
                        status: 'expired',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', subscription.id);

                // Deactivate premium on profile
                await supabase
                    .from('profiles')
                    .update({ is_premium: false })
                    .eq('id', user.id);

                return res.status(200).json({
                    subscription: { ...subscription, status: 'expired' },
                    isPremium: false,
                    expired: true,
                });
            }
        }

        return res.status(200).json({
            subscription: subscription || null,
            isPremium: !!subscription,
        });

    } catch (error) {
        console.error('[Stripe] Get subscription error:', error);
        return res.status(500).json({
            error: process.env.NODE_ENV !== "production"
                ? (error.message || 'Internal server error')
                : 'Internal server error',
        });
    }
}

// ─── Cancel / Deactivate Premium + Stripe Refund ───────────────
async function handleCancel(req, res) {
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

        const intentId = subscription.stripe_payment_intent_id;

        // ── Refund logic (all plans, within 14-day window) ──
        let refunded = false;
        const REFUND_WINDOW_DAYS = 14;
        const purchaseDate = new Date(subscription.current_period_start);
        const daysSincePurchase = Math.floor((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
        const withinRefundWindow = daysSincePurchase <= REFUND_WINDOW_DAYS;

        if (withinRefundWindow && intentId && !intentId.startsWith('free_')) {
            try {
                const refund = await stripe.refunds.create({
                    payment_intent: intentId,
                });
                refunded = refund.status === 'succeeded' || refund.status === 'pending';
                console.log(`[Stripe] Refund ${refund.id} created for user ${user.id} (status: ${refund.status}, days: ${daysSincePurchase})`);
            } catch (refundError) {
                if (refundError.code === 'charge_already_refunded') {
                    console.log(`[Stripe] Charge already refunded for user ${user.id}`);
                    refunded = true;
                } else {
                    console.error('[Stripe] Refund failed:', refundError.message);
                    return res.status(500).json({
                        error: 'Unable to process your refund. Please contact support.',
                    });
                }
            }
        } else if (!withinRefundWindow) {
            console.log(`[Stripe] Refund window expired for user ${user.id} (${daysSincePurchase} days since purchase)`);
        }

        // ── Update subscription status ──
        const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
                status: 'canceled',
                cancel_at_period_end: false,
                canceled_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', subscription.id);

        if (updateError) {
            console.error('[DB] Failed to update subscription:', updateError);
            return res.status(500).json({ error: 'Failed to cancel premium.' });
        }

        // ── Deactivate premium on profile ──
        await supabase
            .from('profiles')
            .update({ is_premium: false })
            .eq('id', user.id);

        console.log(`[Stripe] Deactivated ${subscription.plan_type} premium for user ${user.id} (refunded: ${refunded})`);

        const message = refunded
            ? 'Premium cancelled and payment refunded. It may take 5–10 business days to appear on your statement.'
            : 'Premium access has been deactivated.';

        return res.status(200).json({
            success: true,
            refunded,
            message,
        });

    } catch (error) {
        console.error('[Stripe] Cancel error:', error);
        return res.status(500).json({
            error: process.env.NODE_ENV !== "production"
                ? (error.message || 'Internal server error')
                : 'Internal server error',
        });
    }
}

// ─── Payment History ───────────────────────────────────────────
async function handlePaymentHistory(req, res) {
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
        return res.status(500).json({
            error: process.env.NODE_ENV !== "production"
                ? (error.message || 'Internal server error')
                : 'Internal server error',
        });
    }
}
