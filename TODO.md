# Deployment Preparation for Vercel

## Tasks
- [ ] Create vercel.json configuration file
- [ ] Create api/ directory structure
- [ ] Convert Express routes to serverless functions:
  - [ ] /api/health.js
  - [ ] /api/auth/verify.js
  - [ ] /api/user/profile.js
- [ ] Update package.json scripts if needed
- [ ] Test local build
- [ ] Verify deployment readiness

## Notes
- Environment variables need to be set in Vercel dashboard
- Supabase integration requires proper env vars
- CORS handled in serverless functions
