# Environment Variables Setup Summary

## What You Already Have ✅

Based on what you've provided, you have:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - This is your anon/public key (works the same as `VITE_SUPABASE_ANON_KEY`)

## What You Need to Add

### 1. PORT (Optional - Has Default)
The PORT is optional. If you don't set it, the server will default to port 3001.

**Add to .env (optional):**
```env
PORT=3001
```

### 2. SUPABASE_SERVICE_ROLE_KEY (Required for Backend)
This is needed for your Express.js backend to work with admin privileges.

**How to get it:**
1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Scroll to "Project API keys"
5. Find "service_role" (it's marked as "secret")
6. Click "Reveal" to show it
7. Copy the entire key

**Add to .env:**
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

See `HOW_TO_GET_SERVICE_ROLE_KEY.md` for detailed instructions.

## Your Complete .env File Should Look Like:

```env
# Your existing variables
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_publishable_key_here

# Optional - defaults to 3001 if not set
PORT=3001

# Required for backend (get from Supabase dashboard)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Notes

- ✅ **Frontend will work** with just `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- ⚠️ **Backend needs** `SUPABASE_SERVICE_ROLE_KEY` for full functionality
- ✅ The code now supports `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` as an alternative to `VITE_SUPABASE_ANON_KEY`
- ✅ The server will work without the service role key, but some features won't be available

## Testing

1. **Test Frontend (works without service role key):**
   ```bash
   npm run dev
   ```
   - Go to http://localhost:8080/landing
   - Try signing up and logging in

2. **Test Backend (needs service role key):**
   ```bash
   npm run server
   ```
   - Should start on http://localhost:3001
   - Visit http://localhost:3001/health to test

