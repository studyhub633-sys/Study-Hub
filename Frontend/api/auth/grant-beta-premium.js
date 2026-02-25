// This endpoint has been disabled. Premium access is now only granted via PayPal subscriptions.
export default async function handler(req, res) {
    return res.status(410).json({ error: 'This endpoint has been permanently disabled. Use PayPal subscriptions to access premium.' });
}
