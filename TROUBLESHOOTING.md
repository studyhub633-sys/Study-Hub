# Troubleshooting Guide

## "Failed to Fetch" Error

This error occurs when the frontend cannot connect to the backend API.

### Common Causes & Solutions

#### 1. Backend Server Not Running

**Problem:** The Express server isn't running.

**Solution:**
```bash
cd server
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3001
```

#### 2. Wrong API URL

**Problem:** `VITE_API_URL` is incorrect or not set.

**Check:**
- Open browser console
- Look for: `[Payment Client] API URL: ...`
- Should be: `http://localhost:3001` (for local dev)

**Solution:**
Create `.env` in project root:
```env
VITE_API_URL=http://localhost:3001
```

Or in `server/.env`:
```env
FRONTEND_URL=http://localhost:5173
```

#### 3. CORS Error

**Problem:** Browser blocking cross-origin requests.

**Check:**
- Open browser DevTools → Network tab
- Look for CORS errors in console

**Solution:**
- Make sure `FRONTEND_URL` is set in `server/.env`
- Restart the server after adding it

#### 4. Port Mismatch

**Problem:** Frontend and backend on different ports.

**Check:**
- Frontend: Usually `http://localhost:5173` (Vite default)
- Backend: Should be `http://localhost:3001`

**Solution:**
Make sure `VITE_API_URL=http://localhost:3001` matches your server port.

### Quick Diagnostic Steps

1. **Check if server is running:**
   ```bash
   curl http://localhost:3001/health
   ```
   Should return: `{"status":"ok","message":"Server is running"}`

2. **Check browser console:**
   - Open DevTools (F12)
   - Look for the exact error message
   - Check Network tab for failed requests

3. **Check server logs:**
   - Look at the terminal where server is running
   - Check for any error messages

4. **Verify environment variables:**
   ```bash
   # In server directory
   node -e "require('dotenv').config(); console.log('API URL:', process.env.FRONTEND_URL)"
   ```

### Testing the Connection

1. **Test health endpoint:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Test from browser:**
   Open: `http://localhost:3001/health`
   Should see: `{"status":"ok","message":"Server is running"}`

3. **Test API endpoint (requires auth):**
   ```bash
   curl http://localhost:3001/api/payments/subscription \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Common Error Messages

**"Cannot connect to server"**
- Server not running
- Wrong port
- Firewall blocking

**"CORS policy"**
- Add `FRONTEND_URL` to server `.env`
- Restart server

**"401 Unauthorized"**
- Not logged in
- Invalid/expired token
- Check authentication

**"503 Service Unavailable"**
- Missing environment variables
- PayPal/Stripe not configured
- Check server logs

## Still Having Issues?

1. Check server terminal for errors
2. Check browser console for detailed error messages
3. Verify all environment variables are set
4. Make sure both frontend and backend are running
5. Try accessing the API directly in browser/Postman

