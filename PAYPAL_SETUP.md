# PayPal Payment Setup Guide

This guide covers setting up PayPal subscriptions for Study Spark Hub.

## 🏦 PayPal Account Setup

### Step 1: Create PayPal Business Account

1. Go to https://www.paypal.com/business
2. Sign up for a PayPal Business account
3. Complete business verification

### Step 2: Create PayPal App

1. Go to https://developer.paypal.com/
2. Log in with your PayPal account
3. Navigate to Dashboard → My Apps & Credentials
4. Click "Create App"
5. Name: "Study Spark Hub"
6. Select "Merchant" account type
7. Copy your **Client ID** and **Secret**

### Step 3: Create Subscription Plans

You have two options to create subscription plans:

#### Option A: Using the Script (Recommended - Easiest)

1. Make sure you have PayPal credentials in your `.env`:
   ```env
   PAYPAL_CLIENT_ID=your_client_id
   PAYPAL_CLIENT_SECRET=your_client_secret
   PAYPAL_MODE=sandbox
   ```

2. Run the script:
   ```bash
   cd server
   npm run create-paypal-plans
   ```

3. The script will:
   - Create a Product (if needed)
   - Create Monthly plan (£5.99/month)
   - Create Yearly plan (£65.99/year)
   - Output Plan IDs to copy to your `.env`

4. Copy the Plan IDs from the output and add to `.env`:
   ```env
   PAYPAL_PLAN_ID_MONTHLY=P-...
   PAYPAL_PLAN_ID_YEARLY=P-...
   ```

#### Option B: Using PayPal Dashboard (If you have Business account)

1. Go to PayPal Business Dashboard → Products & Services → Subscriptions
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

### Local Development (.env)

```env
# PayPal
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox  # or 'live' for production
PAYPAL_PLAN_ID_MONTHLY=P-...
PAYPAL_PLAN_ID_YEARLY=P-...
PAYPAL_WEBHOOK_ID=WH-...

# Frontend
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3001
```

### Vercel Deployment

Add the same variables in Vercel Dashboard → Settings → Environment Variables

**Important:** 
- Use `PAYPAL_MODE=sandbox` for testing
- Use `PAYPAL_MODE=live` for production
- Make sure to use the correct Client ID/Secret for each environment

## 📦 Install Dependencies

```bash
cd server
npm install @paypal/checkout-server-sdk
```

## 🧪 Testing

### Sandbox Testing

1. Use PayPal sandbox accounts:
   - Go to https://developer.paypal.com/ → Sandbox → Accounts
   - Create test buyer account
   - Use test account email for checkout

2. Test subscription flow:
   - Visit `/premium` page
   - Click "Get Monthly" or "Get Yearly"
   - Complete PayPal checkout with sandbox account
   - Verify subscription created in database

### Webhook Testing

1. Use PayPal webhook simulator:
   - Go to PayPal Dashboard → Webhooks
   - Click on your webhook → "Send test webhook"
   - Select event type and send

2. Check server logs for webhook events

## 🔄 Switching to Live Mode

1. Get live credentials from PayPal Dashboard
2. Update environment variables:
   - `PAYPAL_CLIENT_ID` (live)
   - `PAYPAL_CLIENT_SECRET` (live)
   - `PAYPAL_MODE=live`
   - Update webhook URL to production domain
3. Redeploy application

## 📊 Monitoring

### PayPal Dashboard
- View subscriptions: Dashboard → Subscriptions
- View payments: Dashboard → Transactions
- Monitor webhooks: Dashboard → Webhooks → Your endpoint

### Database
- Check `subscriptions` table for subscription status
- Check `payments` table for payment history
- Check `profiles.is_premium` for user premium status

## 🔒 Security Notes

- ✅ Never expose PayPal Client Secret in frontend
- ✅ Always verify webhook signatures
- ✅ Use HTTPS in production
- ✅ Keep credentials in environment variables
- ✅ Use sandbox mode for development

## 🆚 PayPal vs Stripe Differences

| Feature | PayPal | Stripe |
|---------|--------|--------|
| Checkout | Redirect to PayPal | Embedded or redirect |
| Webhooks | Event-based | Event-based |
| Subscriptions | Plans required | Prices required |
| SDK | `@paypal/checkout-server-sdk` | `stripe` |
| Test Mode | Sandbox | Test mode |

## 🐛 Troubleshooting

### Subscription Not Created

1. Check PayPal plan IDs are correct
2. Verify Client ID/Secret are valid
3. Check server logs for errors
4. Verify webhook is receiving events

### Webhook Not Working

1. Verify webhook URL is accessible
2. Check webhook ID is correct
3. Verify webhook signature validation
4. Check server logs for webhook errors

### Premium Status Not Updating

1. Check webhook events are being received
2. Verify database triggers are working
3. Manually update: `UPDATE profiles SET is_premium = TRUE WHERE id = 'user-id'`

## 📚 Resources

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Subscriptions API](https://developer.paypal.com/docs/subscriptions/)
- [PayPal Node.js SDK](https://github.com/paypal/Checkout-NodeJS-SDK)

