# Fix "Failed to Fetch" Error

The "failed to fetch" error means your frontend cannot connect to the API server. Here's how to fix it:

## Quick Fix for Local Development

### Option 1: Using Vercel CLI (Recommended for Vercel serverless functions)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Start Vercel dev server**:
   ```bash
   vercel dev
   ```
   This will start both your frontend and API serverless functions locally.

3. **Set VITE_API_URL** in your `.env` file:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
   (Vercel dev usually runs on port 3000)

4. **Start your frontend** (in a separate terminal):
   ```bash
   npm run dev
   ```

### Option 2: Using Express Server (if you have one)

If you have an Express server in the `server/` folder:

1. **Start the Express server**:
   ```bash
   npm run server
   # or
   cd server && npm run dev
   ```

2. **Set VITE_API_URL** in your `.env` file:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

3. **Start your frontend**:
   ```bash
   npm run dev
   ```

## Check Your Current Setup

1. **Open browser console** (F12) and look for:
   ```
   [AI Client] API Base URL: http://localhost:XXXX
   ```

2. **Check if that URL is accessible**:
   - Open the URL in your browser
   - Or run: `curl http://localhost:3001/api/ai/health` (or whatever port you're using)

3. **Check Network tab**:
   - Open DevTools → Network tab
   - Try generating again
   - Look at the failed request - what URL is it trying to reach?
   - What's the error message?

## Common Issues

### Issue 1: API Server Not Running

**Symptom:** Console shows `[AI Client] API Base URL: http://localhost:3001` but requests fail

**Solution:**
- Make sure your API server is running
- For Vercel: Run `vercel dev`
- For Express: Run `npm run server`

### Issue 2: Wrong Port

**Symptom:** API URL shows one port, but server is on another

**Solution:**
- Check what port your API server is actually running on
- Update `VITE_API_URL` in `.env` to match
- Restart your frontend dev server

### Issue 3: CORS Error

**Symptom:** Browser console shows CORS-related errors

**Solution:**
- Make sure `FRONTEND_URL` is set in your API environment
- For Vercel: Set `FRONTEND_URL=http://localhost:5173` (or your frontend port)
- Restart the API server

### Issue 4: Environment Variables Not Loading

**Symptom:** `VITE_API_URL` shows as "not set" in console

**Solution:**
- Make sure `.env` file is in the project root (same level as `package.json`)
- Restart your dev server after adding/changing `.env`
- Vite only loads `.env` files that start with `VITE_`

## Testing the Connection

1. **Test health endpoint**:
   ```bash
   curl http://localhost:3001/api/ai/health
   ```
   Should return JSON with status information.

2. **Test from browser**:
   Open: `http://localhost:3001/api/ai/health`
   Should see JSON response.

3. **Check browser console**:
   After the improved error handling, you should see:
   ```
   [AI Client] API Base URL: http://localhost:XXXX
   [AI Client] VITE_API_URL env: http://localhost:XXXX (or "not set")
   [AI Client] Making request to: http://localhost:XXXX/api/ai/generate-knowledge-organizer
   ```

## Production (Vercel Deployment)

If you're deployed to Vercel:

1. **Set environment variables in Vercel Dashboard**:
   - Go to your project → Settings → Environment Variables
   - Add `VITE_API_URL` = `https://your-project.vercel.app`
   - Add `HUGGINGFACE_API_KEY` = your key
   - Add `SUPABASE_SERVICE_ROLE_KEY` = your key

2. **Redeploy** after adding environment variables

## Still Not Working?

1. **Check the exact error** in browser console
2. **Check Network tab** - what's the status code?
3. **Check server logs** - any errors there?
4. **Verify environment variables** are actually loaded:
   ```bash
   # In your frontend code, temporarily add:
   console.log('API URL:', import.meta.env.VITE_API_URL);
   ```

---

**Most Common Solution:** Make sure you're running `vercel dev` (for Vercel serverless) or `npm run server` (for Express) in addition to your frontend dev server!





