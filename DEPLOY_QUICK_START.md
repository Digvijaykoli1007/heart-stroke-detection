# 🚀 Quick Start: Deploy to Vercel

**Get your CardioMonitor+ app live in minutes!**

---

## ⚡ Super Quick Deploy (3 Steps)

### 1️⃣ Install Vercel CLI

```bash
npm install -g vercel
```

### 2️⃣ Run Deploy Script

```powershell
cd f:\dig
.\deploy-vercel.ps1
```

Choose option **4** (Deploy All) for first deployment.

### 3️⃣ Configure Environment Variables

Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Projects → Settings → Environment Variables

**Add these for each project:**

#### Frontend:
- `VITE_API_URL` → Your backend URL
- `VITE_ML_API_URL` → Your ML API URL

#### Backend:
- `DATABASE_URL` → Your Neon PostgreSQL URL (from .env)
- `JWT_SECRET` → Generate a secure 32+ character secret
- `FRONTEND_URL` → Your frontend URL
- `ML_API_URL` → Your ML API URL

✅ **Done!** Your app is live!

---

## 📚 Full Documentation

- **Complete Guide**: See [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
- **Environment Variables**: See [ENV_VARIABLES_REFERENCE.md](./ENV_VARIABLES_REFERENCE.md)

---

## 🎯 Deployment URLs

After deployment, you'll get 3 URLs:

- 🎨 **Frontend**: `https://cardiomonitor-xxx.vercel.app`
- 🔧 **Backend API**: `https://cardiomonitor-backend-xxx.vercel.app`
- 🤖 **ML API**: `https://cardiomonitor-ml-xxx.vercel.app`

Update cross-references in environment variables and CORS settings.

---

## ⚠️ Before You Deploy

Make sure:

- [ ] Git repository is initialized and code is committed
- [ ] `.env` files are NOT committed (they're in `.gitignore`)
- [ ] ML model files ARE committed (`git add -f ml/models/*.pkl`)
- [ ] Database is set up on Neon (you already have this)
- [ ] You have a Vercel account

---

## 🔧 Manual Deployment (Alternative)

### Deploy via GitHub Integration:

1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Ready for Vercel deployment"
   git remote add origin https://github.com/YOUR_USERNAME/cardiomonitor.git
   git push -u origin main
   ```

2. Go to [vercel.com/new](https://vercel.com/new)

3. Import your GitHub repository

4. Configure each service:
   - **Frontend**: Build Command: `npm run build`, Output: `dist`
   - **Backend**: Build Command: `npm run vercel-build`, Output: `dist`
   - **ML API**: Build Command: (empty), Output: `.`

5. Add environment variables from ENV_VARIABLES_REFERENCE.md

6. Click **Deploy**

---

## 🐛 Quick Fixes

### Build fails?
```bash
# Update build command in package.json
"vercel-build": "vite build"
```

### CORS errors?
Update `backend/src/server.ts` with your Vercel frontend URL in CORS origins.

### Database connection fails?
Verify `DATABASE_URL` in Vercel environment variables matches your Neon connection string.

---

## 🎉 Success Checklist

Test your deployment:

- [ ] Frontend loads at your Vercel URL
- [ ] Can login with demo account
- [ ] Dashboard shows data
- [ ] Stroke prediction works
- [ ] Modern UI displays correctly
- [ ] No console errors

---

## 📞 Need Help?

- Full guide: [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Vercel Support: [vercel.com/support](https://vercel.com/support)

---

**Your CardioMonitor+ with Biometric Luxury design is ready for the cloud! 🌟**

*Deployment time: ~15 minutes*
