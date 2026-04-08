# ✅ Vercel Deployment Checklist

**Use this checklist to ensure a smooth deployment**

---

## 📋 Pre-Deployment (Do Once)

- [ ] **Vercel account created** → https://vercel.com/signup
- [ ] **Vercel CLI installed** → `npm install -g vercel`
- [ ] **Git initialized** → `git init` (if not already)
- [ ] **Code committed** → `git add . && git commit -m "Ready for deployment"`
- [ ] **ML models exist** → Check `ml/models/*.pkl` files
- [ ] **Database ready** → Neon PostgreSQL connection string available
- [ ] **Read deployment guide** → `DEPLOY_QUICK_START.md`

---

## 🚀 Deployment Process

### Step 1: Deploy ML API

- [ ] Navigate to ml directory → `cd f:\dig\ml`
- [ ] Deploy to Vercel → `vercel`
- [ ] Follow CLI prompts
- [ ] Copy deployment URL → Save as `ML_API_URL`
- [ ] Test health endpoint → `https://your-ml-api.vercel.app/api/health`

### Step 2: Deploy Backend

- [ ] Navigate to backend directory → `cd f:\dig\backend`
- [ ] Deploy to Vercel → `vercel`
- [ ] Follow CLI prompts
- [ ] Copy deployment URL → Save as `BACKEND_URL`
- [ ] Go to Vercel Dashboard → Settings → Environment Variables
- [ ] Add environment variables:
  - [ ] `DATABASE_URL` → From Neon Console
  - [ ] `JWT_SECRET` → Generate 32+ character secret
  - [ ] `ML_API_URL` → From Step 1
  - [ ] `NODE_ENV` → `production`
  - [ ] `JWT_EXPIRES_IN` → `7d`
  - [ ] `FRONTEND_URL` → (add after Step 3)
- [ ] Redeploy → `vercel --prod`
- [ ] Test health endpoint → `https://your-backend.vercel.app/health`

### Step 3: Deploy Frontend

- [ ] Navigate to frontend directory → `cd f:\dig\frontend`
- [ ] Deploy to Vercel → `vercel`
- [ ] Follow CLI prompts
- [ ] Copy deployment URL → Save as `FRONTEND_URL`
- [ ] Go to Vercel Dashboard → Settings → Environment Variables
- [ ] Add environment variables:
  - [ ] `VITE_API_URL` → Backend URL from Step 2
  - [ ] `VITE_ML_API_URL` → ML API URL from Step 1
- [ ] Redeploy → `vercel --prod`
- [ ] Test app loads → `https://your-frontend.vercel.app`

---

## 🔧 Post-Deployment Configuration

### Update Backend CORS

- [ ] Open `backend/src/server.ts`
- [ ] Add your frontend URL to CORS origins:
  ```typescript
  origin: [
    'http://localhost:3001',
    'https://your-frontend.vercel.app'  // Add this
  ]
  ```
- [ ] Commit changes → `git add . && git commit -m "Update CORS"`
- [ ] Redeploy backend → `cd backend && vercel --prod`

### Update Backend Environment (FRONTEND_URL)

- [ ] Go to Backend project in Vercel Dashboard
- [ ] Settings → Environment Variables
- [ ] Add/Update `FRONTEND_URL` → Your frontend Vercel URL
- [ ] Redeploy → `vercel --prod`

---

## ✅ Testing & Verification

### Test Each Service Individually

- [ ] **ML API Health**
  - URL: `https://your-ml-api.vercel.app/api/health`
  - Expected: `{"status": "healthy", "model_loaded": true}`

- [ ] **Backend Health**
  - URL: `https://your-backend.vercel.app/health`
  - Expected: `{"status": "OK", "timestamp": "..."}`

- [ ] **Frontend Loads**
  - URL: `https://your-frontend.vercel.app`
  - Expected: Login page with modern UI

### Test Full Application Flow

- [ ] **Login** → Use demo account credentials
- [ ] **Dashboard** → Loads with patient data
- [ ] **BPM Display** → Shows animated heart
- [ ] **Stroke Assessment** → Form loads correctly
- [ ] **Submit Prediction** → Works without errors
- [ ] **Risk Score** → Displays result
- [ ] **UI Design** → Glassmorphism and gradients visible
- [ ] **No Console Errors** → Open DevTools and check

---

## 🎨 Visual Verification

Confirm these design elements are working:

- [ ] Gradient heart logo with heartbeat animation
- [ ] Glassmorphism effects (backdrop blur)
- [ ] Gradient buttons and cards
- [ ] Modern typography (Outfit + DM Sans fonts)
- [ ] Smooth hover effects and transitions
- [ ] Responsive design on mobile

---

## 🐛 Troubleshooting Checks

If something doesn't work:

- [ ] Check browser console for errors
- [ ] Verify all environment variables are set
- [ ] Confirm CORS includes your frontend URL
- [ ] Check Vercel deployment logs
- [ ] Test API endpoints directly (using Postman/curl)
- [ ] Verify database connection in backend logs

---

## 🔒 Security Verification

- [ ] `JWT_SECRET` is NOT the default value
- [ ] `.env` files are NOT committed to Git
- [ ] Database password is strong
- [ ] HTTPS is enabled (Vercel default)
- [ ] CORS only allows your domains
- [ ] No sensitive data in frontend code

---

## 📊 Performance Check

- [ ] Frontend loads in < 3 seconds
- [ ] API responses in < 1 second
- [ ] ML predictions in < 2 seconds
- [ ] No unnecessary re-renders
- [ ] Images optimized and cached

---

## 🎉 Production Deployment

Once everything works in preview:

- [ ] Deploy to production → `vercel --prod` (all services)
- [ ] Update environment variables for production
- [ ] Test production URLs
- [ ] Share with users! 🌍

---

## 📝 Optional Enhancements

- [ ] Add custom domain (in Vercel Dashboard)
- [ ] Set up monitoring/analytics
- [ ] Configure deployment notifications
- [ ] Set up staging environment
- [ ] Add CI/CD pipeline (GitHub Actions)

---

## 🚨 Emergency Rollback

If deployment breaks:

```bash
# Rollback to previous deployment
vercel rollback

# Or redeploy from specific commit
git checkout <previous-commit>
vercel --prod
```

---

## 📞 Support Resources

- [ ] Saved: Vercel Dashboard → https://vercel.com/dashboard
- [ ] Saved: Neon Console → https://console.neon.tech
- [ ] Bookmarked: `VERCEL_DEPLOYMENT_GUIDE.md`
- [ ] Bookmarked: `ENV_VARIABLES_REFERENCE.md`

---

## ✨ Completion Status

**Deployment Completed:**  
Date: _______________  
Time: _______________

**Live URLs:**  
Frontend: _____________________________  
Backend: _____________________________  
ML API: _____________________________

**Custom Domain (if any):**  
_____________________________

---

**🎉 Congratulations! Your CardioMonitor+ app is live! 🎉**

---

*Use this checklist every time you deploy updates*
