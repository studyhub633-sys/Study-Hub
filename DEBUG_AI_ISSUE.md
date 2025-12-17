# Debug AI Knowledge Organizer Issue - Step by Step

Follow these steps to identify and fix the issue:

## Step 1: Check if Express Server is Running

1. **Open a terminal** and run:
   ```bash
   npm run server
   ```
   OR
   ```bash
   cd server && npm run dev
   ```

2. **You should see**:
   ```
   🚀 Server running on http://localhost:3001
   ✅ Supabase service role key loaded successfully
   ```

3. **If you see errors**, check:
   - Is port 3001 already in use?
   - Are environment variables loaded correctly?

## Step 2: Test the Health Endpoint

1. **Open a new terminal** (keep server running)
2. **Test the health endpoint**:
   ```bash
   curl http://localhost:3001/api/ai/health
   ```
   
   OR open in browser: `http://localhost:3001/api/ai/health`

3. **Expected response**:
   ```json
   {
     "status": "ready",
     "services": {
       "huggingface": "configured",
       "authentication": "configured"
     },
     "message": "AI services are ready"
   }
   ```

4. **If you see "missing_api_key"**:
   - Check your `.env` file has `HUGGINGFACE_API_KEY`
   - Restart the server after adding it

## Step 3: Check Frontend Connection

1. **Make sure frontend is running**:
   ```bash
   npm run dev
   ```

2. **Open browser console** (F12)
3. **Look for these messages**:
   ```
   [AI Client] API Base URL: http://localhost:3001
   [AI Client] VITE_API_URL env: http://localhost:3001 (or "not set")
   ```

4. **If VITE_API_URL shows "not set"**:
   - Add `VITE_API_URL=http://localhost:3001` to your `.env` file
   - Restart the frontend dev server

## Step 4: Test the Knowledge Organizer Endpoint Directly

1. **Get your auth token**:
   - Open browser DevTools → Application/Storage → Local Storage
   - Look for Supabase auth token (or check Network tab for Authorization header)

2. **Test with curl** (replace YOUR_TOKEN):
   ```bash
   curl -X POST http://localhost:3001/api/ai/generate-knowledge-organizer \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"prompt":"Cell biology","subject":"Biology"}'
   ```

3. **Check the response**:
   - If you get an error, note what it says
   - If you get data, the endpoint is working!

## Step 5: Check Browser Network Tab

1. **Open browser DevTools** → **Network tab**
2. **Try generating a knowledge organizer** in the UI
3. **Look for the request** to `/api/ai/generate-knowledge-organizer`
4. **Check**:
   - **Status Code**: Should be 200 (success) or see the error code
   - **Request URL**: Should be `http://localhost:3001/api/ai/generate-knowledge-organizer`
   - **Response**: Click on the request to see the response body

## Step 6: Common Issues & Fixes

### Issue: "Failed to fetch"
- **Cause**: Server not running or wrong URL
- **Fix**: 
  1. Make sure Express server is running (`npm run server`)
  2. Check `VITE_API_URL=http://localhost:3001` in `.env`
  3. Restart frontend after changing `.env`

### Issue: "404 Not Found"
- **Cause**: Route not found
- **Fix**: 
  1. Check server logs - is the route registered?
  2. Make sure you restarted the server after adding the route
  3. Verify the route is `/api/ai/generate-knowledge-organizer`

### Issue: "401 Unauthorized"
- **Cause**: Auth token missing or invalid
- **Fix**:
  1. Make sure you're logged in
  2. Check browser console for auth errors
  3. Try logging out and back in

### Issue: "503 Model is loading"
- **Cause**: Hugging Face model needs to warm up
- **Fix**: Wait 30 seconds and try again (first request only)

### Issue: "Database configuration missing"
- **Cause**: Supabase keys not set
- **Fix**:
  1. Check `.env` has `SUPABASE_SERVICE_ROLE_KEY`
  2. Restart server after adding it

### Issue: "Table does not exist"
- **Cause**: `ai_usage_tracking` table not created
- **Fix**: Run the SQL migration in Supabase (see `AI_KNOWLEDGE_ORGANIZER_SETUP.md`)

## Step 7: Check Server Logs

When you try to generate, check the **server terminal** for:
- Any error messages
- Request received logs
- Hugging Face API responses

## Quick Test Checklist

- [ ] Express server running on port 3001
- [ ] Health endpoint returns success
- [ ] Frontend shows correct API URL in console
- [ ] Network tab shows request being made
- [ ] Server logs show request received
- [ ] No CORS errors in browser console
- [ ] Auth token is being sent in request

## Still Not Working?

1. **Share the exact error message** from:
   - Browser console
   - Network tab (response body)
   - Server terminal logs

2. **Check these files**:
   - `.env` - Has all required variables?
   - `server/routes/ai.js` - Has the route?
   - `src/lib/ai-client.ts` - Correct endpoint path?

3. **Try the health endpoint first** - if that works, the connection is fine

---

**Most likely issue**: Express server not running or `VITE_API_URL` not set in `.env`





