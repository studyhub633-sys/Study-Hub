import { supabase, verifyAuth } from '../_utils/auth.js';

// ─── Main Router ────────────────────────────────────────────────
export default async function handler(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const action = url.pathname.split('/').pop();

    switch (action) {
        case 'create-subscription':
            return handleCreateSubscription(req, res);
        case 'verify-payment':
            return handleVerifyPayment(req, res);
        case 'subscription':
            return handleGetSubscription(req, res);
        case 'cancel':
            return handleCancel(req, res);
        case 'payment-history':
            return handlePaymentHistory(req, res);
        case 'pending-payments':
            return handlePendingPayments(req, res);
        default:
            return res.status(404).json({ error: 'Payment action not found' });
    }
}

// ─── Create Subscription (Pending - Wise Bank Transfer) ────────
async function handleCreateSubscription(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const user = await verifyAuth(req);
        const { planType, paymentReference } = req.body;

        if (!planType || !['monthly', 'yearly'].includes(planType)) {
            return res.status(400).json({ error: 'Invalid plan type. Must be "monthly" or "yearly".' });
        }

        if (!paymentReference) {
            return res.status(400).json({ error: 'Payment reference is required.' });
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

        // Check for existing pending subscription
        const { data: pendingSub } = await supabase
            .from('subscriptions')
            .select('id, status, payment_reference')
            .eq('user_id', user.id)
            .eq('status', 'pending')
            .maybeSingle();

        if (pendingSub) {
            return res.status(400).json({
                error: 'You already have a pending payment being verified. Please wait for admin approval or contact support.',
            });
        }

        const now = new Date().toISOString();

        // Insert a pending subscription record
        const { data: newSub, error: dbError } = await supabase
            .from('subscriptions')
            .insert({
                user_id: user.id,
                plan_type: planType,
                status: 'pending',
                payment_reference: paymentReference,
                current_period_start: now,
                current_period_end: now,
            })
            .select('id')
            .single();

        if (dbError) {
            console.error('[DB] Failed to insert subscription:', dbError);
            return res.status(500).json({ error: 'Failed to create subscription record.' });
        }

        console.log(`[Payment] Created pending subscription ${newSub.id} for user ${user.id} (${planType}) - ref: ${paymentReference}`);

        return res.status(200).json({
            subscriptionId: newSub.id,
            status: 'pending',
            paymentReference,
            message: 'Subscription created. Please transfer the payment to our Wise account using the reference code. Your premium will be activated once verified.',
        });

    } catch (error) {
        console.error('[Payment] Create subscription error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}

// ─── Verify Payment (Admin Only) ──────────────────────────────
async function handleVerifyPayment(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const adminUser = await verifyAuth(req);

        // Check admin status
        const { data: adminProfile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', adminUser.id)
            .single();

        if (!adminProfile?.is_admin) {
            return res.status(403).json({ error: 'Admin access required.' });
        }

        const { subscriptionId, approve, wiseTransferId } = req.body;

        if (!subscriptionId) {
            return res.status(400).json({ error: 'Subscription ID is required.' });
        }

        // Get the pending subscription
        const { data: subscription, error: fetchError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('id', subscriptionId)
            .eq('status', 'pending')
            .single();

        if (fetchError || !subscription) {
            return res.status(404).json({ error: 'Pending subscription not found.' });
        }

        if (approve === false) {
            // Reject the subscription
            await supabase
                .from('subscriptions')
                .update({
                    status: 'canceled',
                    canceled_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', subscriptionId);

            console.log(`[Payment] Rejected subscription ${subscriptionId}`);
            return res.status(200).json({ success: true, message: 'Subscription rejected.' });
        }

        // Approve and activate the subscription
        const now = new Date();
        const periodEnd = new Date(now);

        if (subscription.plan_type === 'yearly') {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
        }

        // Update subscription to active
        const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
                status: 'active',
                current_period_start: now.toISOString(),
                current_period_end: periodEnd.toISOString(),
                updated_at: now.toISOString(),
            })
            .eq('id', subscriptionId);

        if (updateError) {
            console.error('[DB] Failed to update subscription:', updateError);
            return res.status(500).json({ error: 'Failed to activate subscription.' });
        }

        // Update user premium status
        await supabase
            .from('profiles')
            .update({ is_premium: true })
            .eq('id', subscription.user_id);

        // Record the payment
        const planPrices = { monthly: 499, yearly: 3999 };
        const amount = planPrices[subscription.plan_type] || 0;

        await supabase
            .from('payments')
            .insert({
                user_id: subscription.user_id,
                subscription_id: subscriptionId,
                amount,
                currency: 'gbp',
                status: 'succeeded',
                wise_transfer_id: wiseTransferId || null,
                plan_type: subscription.plan_type,
            });

        console.log(`[Payment] Approved and activated subscription ${subscriptionId} for user ${subscription.user_id}`);

        return res.status(200).json({
            success: true,
            message: 'Subscription approved and activated.',
        });

    } catch (error) {
        console.error('[Payment] Verify payment error:', error);
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
            .in('status', ['active', 'pending'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (fetchError) {
            console.error('[DB] Failed to fetch subscription:', fetchError);
            return res.status(500).json({ error: 'Failed to fetch subscription.' });
        }

        if (!subscription) {
            return res.status(404).json({ error: 'No active or pending subscription found.' });
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

        // If the subscription was pending, also revoke premium immediately
        if (subscription.status === 'pending') {
            console.log(`[Payment] Cancelled pending subscription ${subscription.id} for user ${user.id}`);
            return res.status(200).json({
                success: true,
                message: 'Pending payment cancelled.',
            });
        }

        // For active subscriptions, premium remains until period end
        console.log(`[Payment] Cancelled subscription ${subscription.id} for user ${user.id}`);

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

// ─── Pending Payments (Admin Only) ─────────────────────────────
async function handlePendingPayments(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const adminUser = await verifyAuth(req);

        // Check admin status
        const { data: adminProfile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', adminUser.id)
            .single();

        if (!adminProfile?.is_admin) {
            return res.status(403).json({ error: 'Admin access required.' });
        }

        const { data: pendingSubs, error } = await supabase
            .from('subscriptions')
            .select(`
                id,
                user_id,
                plan_type,
                status,
                payment_reference,
                created_at,
                profiles!inner(email, full_name)
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[DB] Failed to fetch pending payments:', error);
            return res.status(500).json({ error: 'Failed to fetch pending payments.' });
        }

        return res.status(200).json({
            pendingPayments: pendingSubs || [],
        });

    } catch (error) {
        console.error('[Payment] Pending payments error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
