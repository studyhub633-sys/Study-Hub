import { supabase } from '../_utils/auth.js';

/**
 * PayPal Webhook Handler
 * 
 * Handles these PayPal events:
 * - BILLING.SUBSCRIPTION.ACTIVATED — Subscription becomes active
 * - BILLING.SUBSCRIPTION.CANCELLED — Subscription cancelled
 * - BILLING.SUBSCRIPTION.EXPIRED — Subscription expired
 * - BILLING.SUBSCRIPTION.SUSPENDED — Subscription suspended (payment failure)
 * - PAYMENT.SALE.COMPLETED — Recurring payment received
 */
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const event = req.body;

        if (!event || !event.event_type) {
            return res.status(400).json({ error: 'Invalid webhook payload' });
        }

        console.log(`[Webhook] Received event: ${event.event_type}`);

        // NOTE: In production, you should verify the webhook signature.
        // See: https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature_post
        // For now, we proceed with processing the event.

        const resource = event.resource;

        switch (event.event_type) {
            case 'BILLING.SUBSCRIPTION.ACTIVATED': {
                const subscriptionId = resource?.id;
                if (!subscriptionId) break;

                console.log(`[Webhook] Subscription activated: ${subscriptionId}`);

                // Update subscription status
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .update({
                        status: 'active',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('paypal_subscription_id', subscriptionId)
                    .select('user_id')
                    .single();

                // Grant premium access
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

                // Update subscription status
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

                // Revoke premium access (only if no other active subscriptions)
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

                // Find the subscription
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('id, user_id, plan_type')
                    .eq('paypal_subscription_id', billingAgreementId)
                    .single();

                if (sub) {
                    // Record the payment
                    const amount = Math.round(
                        parseFloat(resource.amount?.total || '0') * 100
                    );
                    const currency = (resource.amount?.currency || 'GBP').toLowerCase();

                    // Check for duplicate payment
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

                    // Update subscription period (extend the end date)
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

                    // Ensure premium is active
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

        // Always respond with 200 to acknowledge receipt
        return res.status(200).json({ received: true });

    } catch (error) {
        console.error('[Webhook] Processing error:', error);
        // Still return 200 to prevent PayPal from retrying
        return res.status(200).json({ received: true, error: error.message });
    }
}
