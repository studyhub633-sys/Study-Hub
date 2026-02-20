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

        // Get the user's payment history, ordered by most recent first
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

        // Format amounts from pence to pounds for display
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
