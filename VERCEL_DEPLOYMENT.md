# Vercel Deployment Guide

This guide will help you deploy Study Spark Hub to Vercel with all features working.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com
2. **GitHub Repository**: Your code should be in a GitHub repo
3. **Supabase Project**: Already set up
4. **PayPal Developer Account**: For payment processing
5. **Hugging Face Account**: For AI features

## 🚀 Step-by-Step Deployment

### Step 1: Push to GitHub

Make sure all your code is committed and pushed:

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Import to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will auto-detect it's a Vite project
4. Click "Deploy"

### Step 3: Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

#### Supabase
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

#### Hugging Face
```
HUGGINGFACE_API_KEY=hf_...
```

#### Frontend URL
```
FRONTEND_URL=https://your-project.vercel.app
VITE_API_URL=https://your-project.vercel.app
```

**Important**: 
- Add these for **Production**, **Preview**, and **Development** environments
- After adding variables, **redeploy** your project

### Step 4: Update PayPal Webhook URL

1. Go to PayPal Developer Dashboard
2. Find your webhook configuration
3. Update the webhook URL to:
   ```
   https://your-project.vercel.app/api/payments/webhook
   ```

### Step 5: Deploy

1. Vercel will automatically deploy on every push to `main`
2. Or manually trigger a deployment from the Vercel dashboard
3. Wait for deployment to complete

### Step 6: Verify Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Test the health endpoint: `https://your-project.vercel.app/api/health`
3. Test AI health: `https://your-project.vercel.app/api/ai/health`
4. Sign up and test authentication
5. Test premium subscription flow

## 📁 Project Structure

```
study-spark-hub/
├── api/                    # Vercel serverless functions
│   ├── ai/                 # AI endpoints
│   ├── payments/           # Payment endpoints
│   ├── admin/              # Admin endpoints
│   └── lib/                # Shared utilities
├── src/                    # Frontend React app
├── vercel.json            # Vercel configuration
└── package.json           # Dependencies
```

## 🔧 Configuration Files

### vercel.json
- Handles routing for SPA
- Configures function timeouts
- Sets up rewrites

### package.json
- Contains all dependencies
- Vercel installs these automatically

## 🐛 Troubleshooting

### "Function not found" errors

**Problem**: API routes return 404

**Solution**:
- Make sure files are in `api/` directory
- Check file names match the route (e.g., `api/payments/create-subscription.js` → `/api/payments/create-subscription`)
- Redeploy after adding new API routes

### CORS errors

**Problem**: Frontend can't call API

**Solution**:
- Check `FRONTEND_URL` is set correctly
- Make sure CORS headers are set in API functions
- Check browser console for exact error

### Environment variables not working

**Problem**: Variables not accessible in functions

**Solution**:
- Make sure variables are added in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)
- Use `VITE_` prefix for frontend variables

### PayPal webhook not working

**Problem**: Webhooks not received

**Solution**:
- Verify webhook URL in PayPal dashboard
- Check `PAYPAL_WEBHOOK_ID` is set
- Check Vercel function logs for errors
- Test webhook manually using PayPal webhook simulator

### AI features not working

**Problem**: AI endpoints return errors

**Solution**:
- Verify `HUGGINGFACE_API_KEY` is set
- Check API key is valid
- Check function logs for detailed errors
- Test with `/api/ai/health` endpoint

## 📊 Monitoring

### Vercel Dashboard

- **Deployments**: View all deployments
- **Functions**: See serverless function logs
- **Analytics**: Monitor traffic and performance

### Function Logs

1. Go to Vercel Dashboard → Your Project → Functions
2. Click on any function to see logs
3. Check for errors or warnings

## 🔄 Updating Your Deployment

1. Make changes locally
2. Commit and push to GitHub
3. Vercel automatically deploys
4. Or manually trigger from dashboard

## 🎯 Production Checklist

- [ ] All environment variables set
- [ ] PayPal webhook URL updated
- [ ] `PAYPAL_MODE` set to `live` (not `sandbox`)
- [ ] `FRONTEND_URL` set to production domain
- [ ] Database migrations run
- [ ] Test all features:
  - [ ] Authentication
  - [ ] AI features
  - [ ] Payment flow
  - [ ] Admin panel
  - [ ] Premium features

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [Supabase Documentation](https://supabase.com/docs)

## 💡 Tips

1. **Use Preview Deployments**: Test changes before merging to main
2. **Monitor Logs**: Check function logs regularly for errors
3. **Environment Variables**: Keep production and development separate
4. **Webhooks**: Test webhooks in sandbox before going live
5. **Backup**: Keep backups of your database and important data

## 🆘 Need Help?

- Check Vercel logs for detailed error messages
- Review function code for issues
- Test endpoints individually
- Check environment variables are correct
- Verify all dependencies are in `package.json`

