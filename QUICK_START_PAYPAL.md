# Quick Start: PayPal Setup

## 🚀 Fastest Way to Set Up PayPal Plans

### Step 1: Get PayPal Credentials

1. Go to https://developer.paypal.com/
2. Log in
3. Dashboard → My Apps & Credentials
4. Find your app (or create one)
5. Copy **Client ID** and **Secret**

### Step 2: Add to .env

Create or update `server/.env`:

```env
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here
PAYPAL_MODE=sandbox
```

### Step 3: Run the Script

```bash
cd server
npm install  # If you haven't already
npm run create-paypal-plans
```

### Step 4: Copy Plan IDs

The script will output something like:

```
📝 Add these to your .env file:
==================================================
PAYPAL_PLAN_ID_MONTHLY=P-5ML1234567890
PAYPAL_PLAN_ID_YEARLY=P-5YL1234567890
```

Add these to your `server/.env`:

```env
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here
PAYPAL_MODE=sandbox
PAYPAL_PLAN_ID_MONTHLY=P-5ML1234567890
PAYPAL_PLAN_ID_YEARLY=P-5YL1234567890
```

### Step 5: Test It!

1. Start your server: `npm run dev`
2. Visit `/premium` page
3. Click "Get Monthly" or "Get Yearly"
4. Complete PayPal checkout

## ✅ Done!

Your PayPal subscription plans are now set up and ready to use!

## 🐛 Troubleshooting

**Script says "Invalid credentials"**
- Double-check your Client ID and Secret
- Make sure you're using sandbox credentials if `PAYPAL_MODE=sandbox`

**Script says "Product creation failed"**
- This is usually fine - the script will continue
- Plans might still be created successfully

**No Plan IDs in output**
- Check the error messages
- You might need to create plans manually in PayPal dashboard
- Or check if plans already exist (script will show them)

## 📚 More Help

See `PAYPAL_SETUP.md` for detailed instructions and webhook setup.

