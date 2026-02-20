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

// ─── Main Router ────────────────────────────────────────────────
export default async function handler(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const action = url.pathname.split('/').pop();

    switch (action) {
        case 'create-subscription':
            return handleCreateSubscription(req, res);
        case 'activate':
            return handleActivate(req, res);
        case 'subscription':
            return handleGetSubscription(req, res);
        case 'cancel':
            return handleCancel(req, res);
        case 'payment-history':
            return handlePaymentHistory(req, res);
        case 'webhook':
            return handleWebhook(req, res);
        default:
            return res.status(404).json({ error: 'Payment action not found' });
    }
}

// ─── Create Subscription ───────────────────────────────────────
async function handleCreateSubscription(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
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

        const accessToken = await getPayPalAccessToken();

        const appUrl = process.env.VITE_APP_URL || process.env.APP_URL || 'http://localhost:5173';

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
                    brand_name: 'Revisely.ai',
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

        const approvalLink = subscription.links?.find(link => link.rel === 'approve');
        if (!approvalLink) {
            console.error('[PayPal] No approval URL in response:', subscription);
            return res.status(500).json({ error: 'PayPal did not return an approval URL.' });
        }

        // Insert a pending subscription record
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
                current_period_end: now,
            });

        if (dbError) {
            console.error('[DB] Failed to insert subscription:', dbError);
        }

        console.log(`[Payment] Created subscription ${subscription.id} for user ${user.id} (${planType})`);

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

// ─── Activate Subscription ─────────────────────────────────────
async function handleActivate(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const user = await verifyAuth(req);
        const { subscriptionId } = req.body;

        if (!subscriptionId) {
            return res.status(400).json({ error: 'Subscription ID is required.' });
        }

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

        if (!['ACTIVE', 'APPROVAL_PENDING'].includes(ppSubscription.status)) {
            return res.status(400).json({
                error: `Subscription is not active. Current status: ${ppSubscription.status}`,
            });
        }

        const startTime = ppSubscription.start_time || new Date().toISOString();
        const billingInfo = ppSubscription.billing_info;
        const nextBillingTime = billingInfo?.next_billing_time || null;

        let periodEnd;
        if (nextBillingTime) {
            periodEnd = nextBillingTime;
        } else {
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

        if (ppSubscription.status === 'ACTIVE') {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ is_premium: true })
                .eq('id', user.id);

            if (profileError) {
                console.error('[DB] Failed to update premium status:', profileError);
            }

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
            .in('status', ['active', 'pending'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error('[DB] Failed to fetch subscription:', error);
            return res.status(500).json({ error: 'Failed to fetch subscription.' });
        }

        return res.status(200).json({
            subscription: subscription || null,
            isPremium: !!subscription && subscription.status === 'active',
        });

    } catch (error) {
        console.error('[Payment] Get subscription error:', error);
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

        if (!subscription.paypal_subscription_id) {
            return res.status(400).json({ error: 'Subscription does not have a PayPal ID.' });
        }

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

        if (!cancelResponse.ok && cancelResponse.status !== 204) {
            const errorText = await cancelResponse.text();
            console.error('[PayPal] Failed to cancel subscription:', errorText);
            return res.status(500).json({ error: 'Failed to cancel subscription with PayPal.' });
        }

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

        return res.status(200).json({
            payments: formattedPayments,
        });

    } catch (error) {
        console.error('[Payment] Payment history error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}

// ─── Webhook ───────────────────────────────────────────────────
async function handleWebhook(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const event = req.body;

        if (!event || !event.event_type) {
            return res.status(400).json({ error: 'Invalid webhook payload' });
        }

        console.log(`[Webhook] Received event: ${event.event_type}`);

        const resource = event.resource;

        switch (event.event_type) {
            case 'BILLING.SUBSCRIPTION.ACTIVATED': {
                const subscriptionId = resource?.id;
                if (!subscriptionId) break;

                console.log(`[Webhook] Subscription activated: ${subscriptionId}`);

                const { data: sub } = await supabase
                    .from('subscriptions')
                    .update({
                        status: 'active',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('paypal_subscription_id', subscriptionId)
                    .select('user_id')
                    .single();

                if (sub?.user_id) {
                    await supabase
                        .from('profiles')
                        .update({ is_premium: true })
                        .eq('id', sub.user_id);
                }
                break;
            }

            case 'BILLING.SUBSCRIPTION.CANCELLED':
            case 'BILLING.SUBSCRIPTION.EXPIRED': {
                const subscriptionId = resource?.id;
                if (!subscriptionId) break;

                const newStatus = event.event_type.includes('CANCELLED') ? 'canceled' : 'expired';
                console.log(`[Webhook] Subscription ${newStatus}: ${subscriptionId}`);

                const { data: sub } = await supabase
                    .from('subscriptions')
                    .update({
                        status: newStatus,
                        canceled_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    .eq('paypal_subscription_id', subscriptionId)
                    .select('user_id')
                    .single();

                if (sub?.user_id) {
                    const { data: otherActive } = await supabase
                        .from('subscriptions')
                        .select('id')
                        .eq('user_id', sub.user_id)
                        .eq('status', 'active')
                        .limit(1);

                    if (!otherActive || otherActive.length === 0) {
                        await supabase
                            .from('profiles')
                            .update({ is_premium: false })
                            .eq('id', sub.user_id);
                    }
                }
                break;
            }

            case 'BILLING.SUBSCRIPTION.SUSPENDED': {
                const subscriptionId = resource?.id;
                if (!subscriptionId) break;

                console.log(`[Webhook] Subscription suspended: ${subscriptionId}`);

                await supabase
                    .from('subscriptions')
                    .update({
                        status: 'past_due',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('paypal_subscription_id', subscriptionId);
                break;
            }

            case 'PAYMENT.SALE.COMPLETED': {
                const billingAgreementId = resource?.billing_agreement_id;
                const paymentId = resource?.id;

                if (!billingAgreementId || !paymentId) break;

                console.log(`[Webhook] Payment completed: ${paymentId} for subscription ${billingAgreementId}`);

                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('id, user_id, plan_type')
                    .eq('paypal_subscription_id', billingAgreementId)
                    .single();

                if (sub) {
                    const amount = Math.round(
                        parseFloat(resource.amount?.total || '0') * 100
                    );
                    const currency = (resource.amount?.currency || 'GBP').toLowerCase();

                    const { data: existing } = await supabase
                        .from('payments')
                        .select('id')
                        .eq('paypal_payment_id', paymentId)
                        .maybeSingle();

                    if (!existing) {
                        await supabase
                            .from('payments')
                            .insert({
                                user_id: sub.user_id,
                                subscription_id: sub.id,
                                amount,
                                currency,
                                status: 'succeeded',
                                paypal_payment_id: paymentId,
                                plan_type: sub.plan_type,
                            });
                    }

                    const nextBillingDate = new Date();
                    if (sub.plan_type === 'yearly') {
                        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
                    } else {
                        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
                    }

                    await supabase
                        .from('subscriptions')
                        .update({
                            status: 'active',
                            current_period_start: new Date().toISOString(),
                            current_period_end: nextBillingDate.toISOString(),
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', sub.id);

                    await supabase
                        .from('profiles')
                        .update({ is_premium: true })
                        .eq('id', sub.user_id);
                }
                break;
            }

            default:
                console.log(`[Webhook] Unhandled event type: ${event.event_type}`);
        }

        return res.status(200).json({ received: true });

    } catch (error) {
        console.error('[Webhook] Processing error:', error);
        return res.status(200).json({ received: true, error: error.message });
    }
}
