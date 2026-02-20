import { supabase, verifyAuth } from '../_utils/auth.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const user = await verifyAuth(req);

        // Get the user's most recent active subscription
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
