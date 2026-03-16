# Pre-Deployment Checklist

## 🔴 Critical (Must Fix Before Deploy)

### 1. Environment & Configuration
- [x] ✅ MongoDB connection configured
- [x] ✅ Google OAuth configured
- [ ] ⚠️ Update NEXTAUTH_URL in production env vars
- [ ] ⚠️ Generate new NEXTAUTH_SECRET for production
- [x] ✅ Database schema up to date

### 2. Authentication & Security
- [x] ✅ Google OAuth working
- [x] ✅ Credentials provider working
- [ ] ⚠️ Email verification (optional - see notes below)
- [x] ✅ Password hashing (bcrypt)
- [x] ✅ Session management (JWT)

**Email Verification Note:** Currently not implemented. Users can sign up and use the app immediately. For MVP launch, this is acceptable. Can add later if needed.

### 3. Error Handling
- [ ] ⚠️ Create global error page (`app/error.tsx`)
- [ ] ⚠️ Create 404 page (`app/not-found.tsx`)
- [x] ✅ API error responses
- [x] ✅ Form validation

### 4. Core Features Working
- [x] ✅ Quiz (3 questions)
- [x] ✅ Training (20+ cards)
- [x] ✅ Axes calibration
- [x] ✅ Profile view
- [x] ✅ Advanced profile
- [x] ✅ Debug mode
- [x] ✅ Reset profile

---

## 🟡 Important (Highly Recommended)

### 5. SEO & Metadata
- [x] ✅ Basic title and description
- [ ] 📝 Enhanced metadata with Open Graph tags
- [ ] 📝 Favicon/app icon
- [ ] 📝 robots.txt
- [ ] 📝 sitemap.xml

### 6. UI/UX Polish
- [x] ✅ Loading states on forms
- [x] ✅ Error messages
- [x] ✅ Success feedback
- [ ] 📝 Loading page component (`app/loading.tsx`)
- [x] ✅ Responsive design

### 7. Performance
- [x] ✅ Image optimization (using Next.js Image)
- [x] ✅ Code splitting (automatic with Next.js)
- [ ] 📝 Analyze bundle size
- [x] ✅ Font optimization

### 8. TODOs in Code
- [ ] 📝 Tier progression logic (currently set to "novice")
  - Location: `apps/web/src/app/api/v2/training/submit/route.ts:137`
  - Impact: Medium (gamification feature)
  - Can launch without it

---

## 🟢 Nice to Have (Can Do Later)

### 9. Additional Features
- [ ] 💡 Analytics tracking (Google Analytics, Vercel Analytics)
- [ ] 💡 User settings page
- [ ] 💡 Export profile data
- [ ] 💡 Share profile link
- [ ] 💡 Multiple named profiles (beyond debug)

### 10. Documentation
- [x] ✅ Deployment guide
- [ ] 💡 User guide / Help page
- [ ] 💡 API documentation (if exposing API)
- [ ] 💡 About page
- [ ] 💡 FAQ page

### 11. Legal (if applicable)
- [ ] 💡 Privacy policy
- [ ] 💡 Terms of service
- [ ] 💡 Cookie consent (if tracking cookies)
- [ ] 💡 GDPR compliance (if EU users)

### 12. Monitoring & Logging
- [x] ✅ Console logging (development)
- [ ] 💡 Error tracking (Sentry, LogRocket)
- [ ] 💡 Performance monitoring
- [ ] 💡 User analytics

---

## 📋 Quick Action Items (30 minutes)

### Minimum Viable Deployment Package

**1. Create Error Pages (5 min)**
```bash
# Create these files:
apps/web/src/app/error.tsx
apps/web/src/app/not-found.tsx
```

**2. Add Favicon (5 min)**
```bash
# Add to apps/web/src/app/
favicon.ico (or icon.png)
```

**3. Enhanced Metadata (10 min)**
```bash
# Update apps/web/src/app/layout.tsx with Open Graph tags
```

**4. Implement Tier Progression (10 min)**
```bash
# Update training/submit route.ts with tier logic
# Or leave as "novice" for MVP
```

**5. Test Everything (optional but recommended)**
```bash
# Manual testing checklist:
- [ ] Sign up with Google
- [ ] Sign in with credentials
- [ ] Complete quiz
- [ ] Do training
- [ ] Toggle debug mode
- [ ] Reset profile
```

---

## 🚀 Deployment Decision

### Can Deploy Now Without?
- ✅ Email verification - YES (can add later)
- ✅ Tier progression - YES (basic gamification works)
- ✅ Analytics - YES (can add later)
- ✅ Legal pages - YES (if not required by law)
- ⚠️ Error pages - RECOMMENDED to add
- ⚠️ Favicon - RECOMMENDED to add
- ✅ Enhanced SEO - YES (basic works)

### Minimum for Production Launch
1. Error pages (404, error)
2. Favicon
3. Environment variables configured
4. One full test run

**Estimated time: 30-60 minutes**

---

## 🎯 Recommended Pre-Deploy Actions

### Priority 1 (Do Now - 30 min)
1. Create error pages
2. Add favicon
3. Test core flows
4. Set up MongoDB Atlas
5. Configure Vercel env vars

### Priority 2 (Do Soon - 1-2 hours)
1. Enhanced metadata/SEO
2. Tier progression logic
3. Analytics setup
4. About/Help page

### Priority 3 (Can Wait)
1. Email verification
2. Legal pages
3. Advanced analytics
4. Export features

---

## Current Status: 🟢 Ready to Deploy

**What's Working:**
- ✅ All core features complete
- ✅ Authentication system solid
- ✅ Database integration working
- ✅ Debug mode fully functional
- ✅ Profile management complete

**What to Add (30 min):**
- Error pages
- Favicon
- Final testing

**Bottom Line:** Your app is **90% ready**. You can deploy now and add the nice-to-haves incrementally.

---

## Next Steps

1. **Review this checklist**
2. **Decide: Quick deploy or polish first?**
3. **If quick deploy:**
   - Add error pages (5 min)
   - Add favicon (5 min)
   - Deploy!
4. **If polish first:**
   - Work through Priority 1 items
   - Then deploy

**My recommendation:** Do Priority 1 items (30 min), then deploy. Add everything else post-launch based on user feedback.
