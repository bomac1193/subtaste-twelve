# Vercel Deployment - Quick Checklist

## Before You Deploy

### 1. Set Up MongoDB Atlas (5 minutes)
- [ ] Go to https://www.mongodb.com/cloud/atlas
- [ ] Create free account and cluster
- [ ] Create database user
- [ ] Whitelist IP: `0.0.0.0/0`
- [ ] Copy connection string

### 2. Update Google OAuth (2 minutes)
- [ ] Go to https://console.cloud.google.com/
- [ ] Add redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`

### 3. Generate NEXTAUTH_SECRET (30 seconds)
```bash
openssl rand -base64 32
```

## Deploy to Vercel

### Option A: CLI (Fastest)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd /home/sphinxy/subtaste-twelve
vercel

# Follow prompts and add environment variables when asked
```

### Option B: GitHub (Recommended for continuous deployment)
```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Go to vercel.com
# 3. Click "Import Project"
# 4. Select your GitHub repo
# 5. Add environment variables (see below)
# 6. Deploy!
```

## Environment Variables to Add in Vercel

**Copy these to Vercel dashboard → Settings → Environment Variables:**

```
DATABASE_URL=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/subtaste
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=<generated-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true
```

**Note:** Make sure to set for **Production**, **Preview**, AND **Development** environments.

## After Deployment

### Test These Features:
- [ ] Google OAuth login works
- [ ] Create profile (3-question quiz)
- [ ] Training (20+ cards)
- [ ] Axes calibration
- [ ] Advanced profile view
- [ ] Debug mode toggle
- [ ] Reset profile (both normal and debug)

### If Something Breaks:

**Can't connect to database?**
→ Check MongoDB Atlas IP whitelist has `0.0.0.0/0`

**Google login not working?**
→ Verify redirect URI in Google Console matches your Vercel domain

**Session issues?**
→ Regenerate NEXTAUTH_SECRET and redeploy

## Production URLs

Once deployed, your app will be at:
- **Main**: `https://your-project.vercel.app`
- **Auth**: `https://your-project.vercel.app/auth/signin`
- **Profile**: `https://your-project.vercel.app/profile`

## Monitoring

**Vercel Dashboard:**
- View deployment logs
- Monitor performance
- Check errors

**MongoDB Atlas:**
- View database metrics
- Monitor queries
- Check storage usage

---

## Quick Reference

**Vercel CLI Commands:**
```bash
vercel          # Deploy to preview
vercel --prod   # Deploy to production
vercel logs     # View logs
vercel env ls   # List environment variables
```

**Useful Links:**
- Vercel Dashboard: https://vercel.com/dashboard
- MongoDB Atlas: https://cloud.mongodb.com/
- Google Console: https://console.cloud.google.com/

---

## Estimated Time to Deploy

- **First-time setup**: ~15 minutes
- **Subsequent deploys**: ~2 minutes (automatic with GitHub)

Ready to deploy? Start with Step 1!
