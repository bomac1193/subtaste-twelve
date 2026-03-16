# Deployment Guide - Subtaste Twelve

## Pre-Deployment Checklist

### 1. Database Setup (MongoDB Atlas)

**Why MongoDB Atlas?** Vercel doesn't support local MongoDB. You need a cloud database.

**Steps:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier is fine for starting)
4. Create a database user with password
5. Whitelist IP: `0.0.0.0/0` (allows all IPs - needed for Vercel)
6. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/subtaste?retryWrites=true&w=majority
   ```

**Note:** MongoDB Atlas doesn't require replica sets for basic operations, so this will work better than local MongoDB.

### 2. Google OAuth Setup

**Current Status:** ✅ Already configured in code

**For Production:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create new)
3. Go to **APIs & Services** → **Credentials**
4. Edit your OAuth 2.0 Client ID
5. Add **Authorized redirect URIs**:
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```
6. Keep your Client ID and Secret for environment variables

### 3. Environment Variables

**Required for Vercel:**

```bash
# Database
DATABASE_URL=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/subtaste?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-here-use-openssl-rand-base64-32

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Code Changes Needed

#### Update .env.example (for documentation)
Already exists - just verify it's up to date.

#### Update NEXTAUTH_URL in .env (local development)
Change from `http://localhost:3020` to `http://localhost:3000`

### 5. Vercel Deployment Steps

**Option 1: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd /home/sphinxy/subtaste-twelve
vercel
```

**Option 2: GitHub Integration**
1. Push code to GitHub
2. Connect repository to Vercel
3. Vercel auto-deploys on push

### 6. Post-Deployment Checklist

- [ ] Test Google OAuth login
- [ ] Test profile creation (quiz)
- [ ] Test training system
- [ ] Test axes calibration
- [ ] Test debug mode (should still work)
- [ ] Test reset profile
- [ ] Verify MongoDB data is persisting

### 7. Important Notes

**Debug Mode in Production:**
- Debug mode will still work in production
- Each user will have their own debug profile separate from main profile
- Useful for testing without affecting main profile

**Database Migration:**
- Prisma should auto-create collections on first use
- No manual migration needed with MongoDB

**Environment Variables in Vercel:**
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add all variables from the list above
4. Make sure to set them for **Production**, **Preview**, and **Development**

---

## Quick Start Guide

### Local Development
1. Copy `.env.example` to `.env`
2. Update `DATABASE_URL` to your local MongoDB
3. Run `pnpm install`
4. Run `pnpm dev`
5. Visit `http://localhost:3000`

### Production Deployment
1. Set up MongoDB Atlas
2. Configure Google OAuth redirect URIs
3. Set Vercel environment variables
4. Deploy with `vercel --prod`
5. Test all features

---

## Troubleshooting

**Issue: "Adapter is not configured correctly"**
- Solution: Verify DATABASE_URL is correct and MongoDB is accessible

**Issue: "Google OAuth not working"**
- Solution: Check redirect URI in Google Cloud Console matches your domain

**Issue: "Session not persisting"**
- Solution: Verify NEXTAUTH_SECRET is set correctly

**Issue: "Database connection timeout"**
- Solution: Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`

---

## Architecture Notes

### Current Setup
- **Frontend**: Next.js 16 with App Router
- **Auth**: NextAuth.js with Google + Credentials
- **Database**: MongoDB (Prisma ORM)
- **Deployment**: Vercel (serverless)

### Profile System
- Normal profile: Uses authenticated user ID
- Debug profile: Separate user ID for testing
- Both profiles persist in database
- Completely isolated from each other

### Data Flow
```
User Login (Google/Credentials)
  ↓
NextAuth Session
  ↓
User ID from session
  ↓
Profile Operations (quiz, training, etc.)
  ↓
MongoDB (taste_genomes collection)
```

---

## Next Steps After Deployment

1. **Custom Domain** (Optional)
   - Configure in Vercel settings
   - Update NEXTAUTH_URL and Google OAuth redirect

2. **Monitoring**
   - Enable Vercel Analytics
   - Monitor MongoDB Atlas metrics

3. **Backup Strategy**
   - MongoDB Atlas has automatic backups
   - Consider exporting user data periodically

4. **Security**
   - Rotate NEXTAUTH_SECRET periodically
   - Monitor OAuth usage in Google Console
   - Review MongoDB access logs

---

## Support

- **NextAuth Docs**: https://next-auth.js.org/
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/
- **Prisma Docs**: https://www.prisma.io/docs
