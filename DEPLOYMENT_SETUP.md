# Deployment Setup Guide for Study Spark Hub

This guide covers setting up premium subscriptions, payments, and admin features for Vercel deployment.

## 🗄️ Database Setup

### Step 1: Run Premium Subscriptions Migration

1. Go to your Supabase Dashboard → SQL Editor
2. Open `supabase/premium_subscriptions.sql`
3. Copy and paste the entire SQL script
4. Click "Run" to execute

This creates:
- `is_admin` and `is_premium` columns in profiles
- `subscriptions` table
- `payments` table
- Automatic premium status updates

### Step 2: Grant Admin Access

To make yourself an admin, run this SQL (replace with your email):

```sql
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE email = 'your-email@example.com';
```

## 💳 PayPal Setup

### Step 1: Create PayPal Business Account

1. Sign up at https://www.paypal.com/business
2. Complete business verification
3. Go to https://developer.paypal.com/

### Step 2: Create PayPal App

1. Go to PayPal Developer Dashboard → My Apps & Credentials
2. Click "Create App"
3. Name: "Study Spark Hub"
4. Select "Merchant" account type
5. Copy your **Client ID** and **Secret**

### Step 3: Create Subscription Plans

1. Go to PayPal Dashboard → Products & Plans
2. Click "Create Plan"

**Monthly Plan:**
- Name: "Study Hub Premium - Monthly"
- Type: Recurring
- Billing cycle: Monthly
- Price: £5.99
- Copy the **Plan ID** (starts with `P-`)

**Yearly Plan:**
- Name: "Study Hub Premium - Yearly"
- Type: Recurring
- Billing cycle: Yearly
- Price: £65.99
- Copy the **Plan ID** (starts with `P-`)

### Step 4: Set Up Webhook

1. Go to PayPal Dashboard → My Apps & Credentials
2. Find your app → Webhooks
3. Click "Add Webhook URL"
4. URL: `https://your-domain.vercel.app/api/payments/webhook`
5. Select events:
   - `BILLING.SUBSCRIPTION.CREATED`
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `PAYMENT.SALE.COMPLETED`
   - `PAYMENT.SALE.DENIED`
   - `PAYMENT.SALE.REFUNDED`
6. Copy the **Webhook ID** (starts with `WH-`)

## 🔐 Environment Variables

### Vercel Dashboard Setup

Go to your Vercel project → Settings → Environment Variables and add:

#### Supabase (if not already set)
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

#### PayPal
```
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox  # or 'live' for production
PAYPAL_PLAN_ID_MONTHLY=P-...
PAYPAL_PLAN_ID_YEARLY=P-...
PAYPAL_WEBHOOK_ID=WH-...
```

#### Frontend URL
```
FRONTEND_URL=https://your-domain.vercel.app
VITE_API_URL=https://your-domain.vercel.app
```

#### Hugging Face (for AI features)
```
HUGGINGFACE_API_KEY=hf_...
```

### Local Development (.env)

Create `.env` in project root:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# PayPal
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox
PAYPAL_PLAN_ID_MONTHLY=P-...
PAYPAL_PLAN_ID_YEARLY=P-...
PAYPAL_WEBHOOK_ID=WH-...

# Frontend
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3001

# Hugging Face
HUGGINGFACE_API_KEY=hf_...
```

## 🚀 Vercel Deployment

### Option 1: Serverless Functions (Recommended)

The current setup uses Express.js server. For Vercel, you have two options:

#### A. Keep Express Server (Current Setup)

1. Deploy frontend to Vercel
2. Deploy Express server separately (Railway, Render, etc.)
3. Set `VITE_API_URL` to your server URL

#### B. Convert to Vercel Serverless Functions

Convert Express routes to Vercel serverless functions in `api/` directory.

### Option 2: Hybrid Approach

Keep Express for development, use Vercel functions for production.

## 📝 Testing Checklist

### Before Going Live

- [ ] Database migrations run successfully
- [ ] Admin access granted to your account
- [ ] Stripe test mode working
- [ ] Webhook endpoint receiving events
- [ ] Premium status updates correctly
- [ ] Payment flow completes successfully
- [ ] Admin dashboard accessible
- [ ] User management working
- [ ] Premium features gated correctly

### Test Payment Flow

1. Use Stripe test card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any CVC
4. Complete checkout
5. Verify subscription created in database
6. Verify user has premium access

## 🔍 Troubleshooting

### Webhook Not Working

1. Check webhook URL is correct
2. Verify `STRIPE_WEBHOOK_SECRET` is set
3. Check Vercel function logs
4. Test webhook in Stripe Dashboard → Webhooks → Send test webhook

### Premium Status Not Updating

1. Check database triggers are created
2. Verify subscription status is "active"
3. Check `current_period_end` is in the future
4. Manually update: `UPDATE profiles SET is_premium = TRUE WHERE id = 'user-id'`

### Admin Access Issues

1. Verify `is_admin = TRUE` in profiles table
2. Check user is logged in
3. Clear browser cache/cookies
4. Re-login

## 📊 Monitoring

### PayPal Dashboard
- Monitor payments, subscriptions, and webhooks
- Set up email alerts for failed payments
- View subscription management

### Supabase Dashboard
- Monitor database usage
- Check RLS policies
- View subscription data

### Vercel Dashboard
- Monitor function execution
- Check error logs
- Monitor API response times

## 🔒 Security Notes

- ✅ Never expose PayPal Client Secret in frontend
- ✅ Always verify webhook signatures
- ✅ Use RLS policies in Supabase
- ✅ Validate user permissions server-side
- ✅ Use HTTPS in production
- ✅ Keep API keys in environment variables
- ✅ Use sandbox mode for development/testing

## 📚 Additional Resources

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Subscriptions API](https://developer.paypal.com/docs/subscriptions/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

