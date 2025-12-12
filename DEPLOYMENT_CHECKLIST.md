# 🚀 Vercel Deployment Checklist

Use this checklist to ensure everything is ready for deployment.

## ✅ Pre-Deployment

### Code
- [ ] All code committed and pushed to GitHub
- [ ] No console errors in development
- [ ] All API routes converted to Vercel serverless functions
- [ ] `vercel.json` configured correctly
- [ ] `package.json` includes all dependencies

### Environment Variables (Local)
- [ ] `.env` file has all required variables
- [ ] Tested locally with all features working

## 🔐 Environment Variables (Vercel)

Add these in Vercel Dashboard → Settings → Environment Variables:

### Supabase
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`

### PayPal
- [ ] `PAYPAL_CLIENT_ID`
- [ ] `PAYPAL_CLIENT_SECRET`
- [ ] `PAYPAL_MODE` (sandbox or live)
- [ ] `PAYPAL_PLAN_ID_MONTHLY`
- [ ] `PAYPAL_PLAN_ID_YEARLY`
- [ ] `PAYPAL_WEBHOOK_ID`

### Hugging Face
- [ ] `HUGGINGFACE_API_KEY`

### Frontend
- [ ] `FRONTEND_URL` (your Vercel domain)
- [ ] `VITE_API_URL` (your Vercel domain)

**Important**: 
- Add for **Production**, **Preview**, and **Development**
- Redeploy after adding variables

## 🔗 External Services

### PayPal
- [ ] Webhook URL updated: `https://your-project.vercel.app/api/payments/webhook`
- [ ] Webhook events configured
- [ ] Test webhook in sandbox mode

### Supabase
- [ ] Database migrations run
- [ ] RLS policies configured
- [ ] Service role key copied

### Hugging Face
- [ ] API key generated
- [ ] Token has "Make calls to Inference Providers" permission

## 🧪 Testing

### Local Testing
- [ ] Authentication works
- [ ] AI features work
- [ ] Payment flow works (sandbox)
- [ ] Admin panel works
- [ ] Premium features work

### Post-Deployment Testing
- [ ] Visit deployed site
- [ ] Test `/api/health` endpoint
- [ ] Test `/api/ai/health` endpoint
- [ ] Sign up new account
- [ ] Test authentication
- [ ] Test AI question generation
- [ ] Test payment flow (sandbox)
- [ ] Test admin panel (if admin)
- [ ] Test premium features

## 📝 Documentation

- [ ] `VERCEL_DEPLOYMENT.md` reviewed
- [ ] Environment variables documented
- [ ] Webhook URLs documented
- [ ] Team members have access

## 🚨 Common Issues

### If deployment fails:
- [ ] Check Vercel build logs
- [ ] Verify all dependencies in `package.json`
- [ ] Check for syntax errors
- [ ] Verify Node.js version compatibility

### If API routes don't work:
- [ ] Check files are in `api/` directory
- [ ] Verify file names match routes
- [ ] Check function logs in Vercel dashboard
- [ ] Verify CORS headers

### If environment variables don't work:
- [ ] Check variable names (case-sensitive)
- [ ] Verify added to correct environment
- [ ] Redeploy after adding variables
- [ ] Check for typos

## 🎯 Production Checklist

Before going live:

- [ ] `PAYPAL_MODE` set to `live` (not `sandbox`)
- [ ] Live PayPal credentials configured
- [ ] Live PayPal webhook URL set
- [ ] `FRONTEND_URL` set to production domain
- [ ] All features tested in production
- [ ] Error monitoring set up
- [ ] Backup strategy in place

## 📊 Post-Deployment

- [ ] Monitor Vercel function logs
- [ ] Check error rates
- [ ] Monitor API usage
- [ ] Test webhook deliveries
- [ ] Check payment processing
- [ ] Monitor user signups

## 🆘 Support

If something doesn't work:
1. Check Vercel function logs
2. Check browser console
3. Test endpoints individually
4. Verify environment variables
5. Check external service dashboards

---

**Ready to deploy?** Follow the steps in `VERCEL_DEPLOYMENT.md`!

