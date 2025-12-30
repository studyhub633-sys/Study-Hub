# Migration Steps: Separate Frontend and Backend

Follow these steps to reorganize your project into `Frontend/` and `Backend/` folders.

## Option 1: Automated (PowerShell)

Run the provided script:

```powershell
.\reorganize.ps1
```

Then continue with the manual steps below.

## Option 2: Manual Steps

### Step 1: Create Folders

```powershell
mkdir Frontend
mkdir Backend
```

### Step 2: Move Frontend Files

Move these files/folders to `Frontend/`:
- `src/`
- `public/`
- `index.html`
- `vite.config.ts`
- `tailwind.config.ts`
- `postcss.config.js`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `components.json`
- `eslint.config.js`
- `package.json` (copy, then update)
- `package-lock.json` (copy if exists)

### Step 3: Move Backend Files

Move these folders to `Backend/`:
- `server/`
- `api/`

### Step 4: Update Configuration Files

1. **Frontend/package.json** - Already created (removed backend dependencies)
2. **Backend/package.json** - Already created
3. **vercel.json** - Already updated with new paths
4. **Frontend/vite.config.ts** - No changes needed (paths are relative)
5. **Frontend/tsconfig.json** - No changes needed

### Step 5: Install Dependencies

```bash
# Frontend
cd Frontend
npm install

# Backend
cd ../Backend/server
npm install
```

### Step 6: Update .env File Location

Keep `.env` in the **root** directory. Both frontend and backend will read from it.

### Step 7: Test

**Test Frontend:**
```bash
cd Frontend
npm run dev
```

**Test Backend (in new terminal):**
```bash
cd Backend/server
npm run dev
```

## What Changed

### Frontend
- All React/Vite code is now in `Frontend/`
- Frontend has its own `package.json` (no backend dependencies)
- Runs independently on port 8080 (or configured port)

### Backend
- Express server in `Backend/server/`
- Vercel functions in `Backend/api/`
- Backend root has a simple `package.json` for convenience scripts

### Root
- Only documentation, `.env`, and `supabase/` migrations
- `vercel.json` updated for new structure

## Running After Migration

### Development

**Terminal 1 - Backend:**
```bash
cd Backend/server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

### Production (Vercel)

The `vercel.json` is already configured. Just deploy:
- Frontend builds from `Frontend/`
- API routes served from `Backend/api/`

## Troubleshooting

### "Module not found" errors
- Make sure you ran `npm install` in both `Frontend/` and `Backend/server/`
- Check that all files were moved correctly

### Frontend can't connect to backend
- Check `VITE_API_URL=http://localhost:3001` in root `.env`
- Make sure backend is running on port 3001
- Check CORS settings in `Backend/server/index.js`

### Vercel deployment issues
- Verify `vercel.json` paths are correct
- Check that environment variables are set in Vercel dashboard
- Ensure `Backend/api/` functions are accessible

## File Structure After Migration

```
study-spark-hub/
├── Frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── Backend/
│   ├── server/
│   │   ├── routes/
│   │   ├── package.json
│   │   └── ...
│   ├── api/
│   │   ├── ai.js
│   │   └── ...
│   └── package.json
├── supabase/
├── .env
├── vercel.json
└── *.md
```





