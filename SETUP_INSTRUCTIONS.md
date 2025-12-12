# Premium & Admin Setup - Quick Start

## ✅ What's Been Created

1. **Database Schema** (`supabase/premium_subscriptions.sql`)
   - Subscriptions table
   - Payments table
   - Admin and premium flags

2. **Backend Routes**
   - `/api/payments/*` - Stripe payment handling
   - `/api/admin/*` - Admin user management
   - Webhook handler for Stripe events

3. **Frontend Components**
   - Updated Premium page with payment flow
   - Admin dashboard with user management
   - Premium status utilities

## 🚀 Quick Setup Steps

### 1. Install Dependencies

```bash
cd server
npm install stripe
```

### 2. Run Database Migration

1. Go to Supabase Dashboard → SQL Editor
2. Run `supabase/premium_subscriptions.sql`
3. Grant yourself admin: 
   ```sql
   UPDATE profiles SET is_admin = TRUE WHERE email = 'your-email@example.com';
   ```

### 3. Set Up PayPal

1. Create PayPal Business account
2. Create app in PayPal Developer Dashboard
3. Create subscription plans (Monthly £5.99, Yearly £65.99)
4. Copy Plan IDs (start with `P-`)
5. Set up webhook: `https://your-domain.com/api/payments/webhook`
6. Copy webhook ID (starts with `WH-`)

### 4. Add Environment Variables

**Local (.env):**
```env
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox
PAYPAL_PLAN_ID_MONTHLY=P-...
PAYPAL_PLAN_ID_YEARLY=P-...
PAYPAL_WEBHOOK_ID=WH-...
FRONTEND_URL=http://localhost:5173
```

**Vercel:**
Add same variables in Vercel Dashboard → Settings → Environment Variables

### 5. Install Dependencies

```bash
cd server
npm install @paypal/checkout-server-sdk
npm run dev
```

### 6. Test

1. Visit `/premium` page
2. Click "Get Monthly" or "Get Yearly"
3. Complete PayPal checkout with sandbox account
4. Verify premium access

## ⚠️ Important: Vercel Deployment

**The Express server needs to be deployed separately** because Vercel uses serverless functions, not a persistent Express server.

### Option A: Deploy Express Server Separately (Recommended)

Use Railway, Render, or similar:
1. Deploy `server/` directory
2. Set environment variables
3. Update `VITE_API_URL` to your server URL

### Option B: Convert to Vercel Functions

Convert Express routes to Vercel serverless functions in `api/` directory.

## 📍 Admin Access

1. Visit `/admin` (only accessible to admins)
2. Manage users, grant premium, view stats
3. Grant/revoke admin access

## 🔗 Key Files

- `supabase/premium_subscriptions.sql` - Database schema
- `server/routes/payments.js` - PayPal payment handling
- `server/routes/admin.js` - Admin routes
- `src/pages/Premium.tsx` - Premium page with payment
- `src/pages/Admin.tsx` - Admin dashboard
- `src/lib/premium.ts` - Premium utilities
- `src/lib/payment-client.ts` - Payment client

## 🧪 Testing

Use Stripe test mode:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

Check webhook events in Stripe Dashboard → Webhooks → Your endpoint → Events

