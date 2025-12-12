# PayPal Setup Scripts

## Create PayPal Subscription Plans

This script creates subscription plans in PayPal using the Developer API.

### Prerequisites

1. PayPal Developer account with Client ID and Secret
2. Environment variables set in `.env`:
   ```env
   PAYPAL_CLIENT_ID=your_client_id
   PAYPAL_CLIENT_SECRET=your_client_secret
   PAYPAL_MODE=sandbox  # or 'live'
   ```

### Usage

```bash
cd server
npm run create-paypal-plans
```

Or directly:
```bash
node scripts/create-paypal-plans.js
```

### What it does

1. ✅ Checks for existing plans
2. ✅ Creates a Product (if needed)
3. ✅ Creates Monthly subscription plan (£5.99/month)
4. ✅ Creates Yearly subscription plan (£65.99/year)
5. ✅ Outputs Plan IDs to add to your `.env` file

### Output

The script will output Plan IDs like:
```
PAYPAL_PLAN_ID_MONTHLY=P-5ML1234567890
PAYPAL_PLAN_ID_YEARLY=P-5YL1234567890
```

Copy these to your `.env` file.

### Troubleshooting

**Error: "Product creation failed"**
- This is usually fine - PayPal might auto-create products
- The script will continue and try to create plans anyway

**Error: "Invalid client credentials"**
- Check your `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`
- Make sure you're using the correct credentials for sandbox/live mode

**Error: "Plan already exists"**
- The script will show existing Plan IDs
- Use those Plan IDs in your `.env` file instead

### Notes

- Plans are created in the mode specified by `PAYPAL_MODE` (sandbox or live)
- Make sure you're using the correct Client ID/Secret for the mode
- Sandbox plans won't work with live credentials and vice versa

