# 🚀 CardioMonitor+ Vercel Deployment Guide

**Complete guide to deploy your full-stack healthcare application to Vercel**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Deployment Options](#deployment-options)
4. [Option 1: Monorepo Deployment (Recommended)](#option-1-monorepo-deployment-recommended)
5. [Option 2: Separate Deployments](#option-2-separate-deployments)
6. [Environment Variables Configuration](#environment-variables-configuration)
7. [Post-Deployment Steps](#post-deployment-steps)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

Before deploying, ensure you have:

- [ ] **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
- [ ] **GitHub/GitLab Account** - For repository hosting
- [ ] **Neon PostgreSQL Database** - Already configured in `.env`
- [ ] **Project pushed to Git** - All code committed and pushed

### Install Vercel CLI (Optional but Recommended)

```bash
npm install -g vercel
```

---

## 📁 Project Structure

```
f:\dig\
├── frontend/          # React + Vite application
│   ├── vercel.json   # Frontend-specific config
│   └── .env.example  # Environment variables template
├── backend/           # Node.js + Express API
│   ├── vercel.json   # Backend-specific config
│   └── .env.example  # Environment variables template
├── ml/                # Python ML API
│   ├── api/          # Vercel serverless functions
│   │   └── index.py  # ML prediction endpoint
│   └── vercel.json   # ML API config
└── vercel.json        # Root monorepo config (optional)
```

---

## 🎯 Deployment Options

### **Option A: Monorepo (Single Deployment)**
✅ Simpler setup  
✅ Single URL  
❌ Longer build times  

### **Option B: Separate Deployments (Recommended)**
✅ Faster builds  
✅ Independent scaling  
✅ Better error isolation  
❌ Need to configure 3 separate projects  

---

## 🚀 Option 1: Monorepo Deployment (Recommended)

### Step 1: Push to GitHub

```bash
# Initialize git if not already done
cd f:\dig
git init
git add .
git commit -m "Initial commit - CardioMonitor+ ready for Vercel"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/cardiomonitor-plus.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Via Vercel Dashboard (Easiest):

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install`

4. Add Environment Variables (see section below)
5. Click **Deploy**

#### Via Vercel CLI:

```bash
cd f:\dig
vercel

# Follow prompts:
# Set up and deploy? [Y/n] Y
# Which scope? [Your account]
# Link to existing project? [N]
# Project name: cardiomonitor-plus
# In which directory is your code? ./
# Auto-detected framework: Other
# Override settings? [N] Y
# Build Command: cd frontend && npm install && npm run build
# Output Directory: frontend/dist
# Development Command: npm run dev
```

---

## 🔧 Option 2: Separate Deployments

Deploy each part independently for better control.

### 2.1 Deploy Frontend

```bash
cd f:\dig\frontend
vercel

# Configuration:
# Framework: Vite
# Build Command: npm run build
# Output Directory: dist
# Install Command: npm install
```

**Add Environment Variables:**
```
VITE_API_URL=https://your-backend.vercel.app
VITE_ML_API_URL=https://your-ml-api.vercel.app
```

### 2.2 Deploy Backend API

```bash
cd f:\dig\backend
vercel

# Configuration:
# Framework: Other
# Build Command: npm run vercel-build
# Output Directory: dist
# Install Command: npm install
```

**Add Environment Variables:**
```
DATABASE_URL=postgresql://...your-neon-url...
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
ML_API_URL=https://your-ml-api.vercel.app
```

### 2.3 Deploy ML API

```bash
cd f:\dig\ml
vercel

# Configuration:
# Framework: Other
# Build Command: (leave empty)
# Output Directory: .
# Install Command: pip install -r requirements.txt
```

---

## 🔐 Environment Variables Configuration

### Frontend Environment Variables

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add the following:

| Name | Value | Notes |
|------|-------|-------|
| `VITE_API_URL` | `https://your-backend.vercel.app` | Backend API URL |
| `VITE_ML_API_URL` | `https://your-ml-api.vercel.app` | ML API URL |

### Backend Environment Variables

| Name | Value | Notes |
|------|-------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:...@...neon.tech/neondb?sslmode=require` | From Neon Console |
| `JWT_SECRET` | `your-random-32-char-secret-key` | Generate securely |
| `JWT_EXPIRES_IN` | `7d` | Token expiration |
| `NODE_ENV` | `production` | Environment |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | For CORS |
| `ML_API_URL` | `https://your-ml-api.vercel.app` | ML predictions |

**Generate Secure JWT Secret:**
```bash
# In PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

---

## ✅ Post-Deployment Steps

### 1. Update CORS Origins

After deployment, update backend CORS to allow your Vercel frontend:

**File: `backend/src/server.ts`**

```typescript
const corsOptions = {
  origin: [
    'http://localhost:3001',
    'http://localhost:3002',
    'https://your-frontend.vercel.app',  // Add this
    'https://your-custom-domain.com'      // Add custom domain if any
  ],
  credentials: true,
};
```

### 2. Run Database Migration

```bash
# Connect to your deployed backend
vercel env pull .env.production
npm run prisma:migrate
```

Or via Vercel CLI:
```bash
cd f:\dig\backend
vercel env pull
npx prisma migrate deploy
```

### 3. Test Your Deployment

Visit your Vercel URLs:

- **Frontend**: `https://your-project.vercel.app`
- **Backend API Health**: `https://your-backend.vercel.app/health`
- **ML API Health**: `https://your-ml-api.vercel.app/api/health`

### 4. Configure Custom Domain (Optional)

1. Go to **Vercel Dashboard → Your Project → Settings → Domains**
2. Add your custom domain (e.g., `cardiomonitor.com`)
3. Update DNS records as instructed by Vercel
4. Update environment variables with new domain

---

## 🎨 Update Frontend API URLs

After deployment, update your frontend environment:

**Create `.env.production` in frontend:**
```env
VITE_API_URL=https://cardiomonitor-backend.vercel.app
VITE_ML_API_URL=https://cardiomonitor-ml.vercel.app
```

Redeploy frontend:
```bash
cd f:\dig\frontend
vercel --prod
```

---

## 🐛 Troubleshooting

### Issue: Build Fails on Frontend

**Error**: `vite build` fails with TypeScript errors

**Solution**:
```bash
# Update vercel-build script to skip TypeScript check
# In frontend/package.json:
"vercel-build": "vite build"
```

### Issue: Backend Can't Connect to Database

**Error**: `Error: P1001: Can't reach database server`

**Solutions**:
1. Verify `DATABASE_URL` in Vercel environment variables
2. Ensure Neon database is active (not suspended)
3. Check connection string includes `?sslmode=require`
4. Regenerate Prisma Client: Add to `vercel-build`:
   ```json
   "vercel-build": "prisma generate && prisma migrate deploy && tsc"
   ```

### Issue: ML API Not Loading Model

**Error**: `Model not found` or 404 errors

**Solutions**:
1. Ensure `models/` directory is committed to Git
2. Check file paths in `ml/api/index.py`
3. Add models to Git (if using .gitignore):
   ```bash
   git add -f ml/models/*.pkl
   git commit -m "Add ML model files"
   git push
   ```

### Issue: CORS Errors

**Error**: `Access to fetch blocked by CORS policy`

**Solutions**:
1. Add your Vercel URL to backend CORS origins
2. Ensure `credentials: true` in CORS config
3. Update `FRONTEND_URL` environment variable in backend
4. Redeploy backend after changes

### Issue: WebSocket Connection Fails

**Note**: Vercel serverless functions don't support WebSockets for Socket.io

**Alternative Solutions**:
1. **Use Polling**: Update frontend to use HTTP polling instead
2. **Deploy Backend to Railway/Render**: For WebSocket support
3. **Use Vercel Edge Functions**: Beta feature for real-time

**Quick Fix - Disable Socket.io in frontend:**

```typescript
// In frontend/src/contexts/AuthContext.tsx
// Comment out Socket.io initialization for Vercel deployment
```

---

## 📊 Performance Optimization

### Enable Edge Caching

Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "s-maxage=60, stale-while-revalidate" }
      ]
    }
  ]
}
```

### Optimize Build Size

1. **Frontend**: Enable code splitting in Vite
2. **Backend**: Use tree-shaking for dependencies
3. **ML**: Use lighter model format (ONNX) if needed

---

## 🔒 Security Checklist

- [ ] Change `JWT_SECRET` from default
- [ ] Enable HTTPS only (Vercel default)
- [ ] Set secure CORS origins
- [ ] Don't commit `.env` files
- [ ] Use Vercel environment variables
- [ ] Enable rate limiting on sensitive endpoints
- [ ] Validate all user inputs server-side

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Frontend loads at Vercel URL
- [ ] Login works with demo accounts
- [ ] Dashboard shows patient data
- [ ] BPM monitoring displays correctly
- [ ] Stroke prediction works
- [ ] Modern UI displays (glassmorphism, gradients)
- [ ] No console errors
- [ ] All API endpoints respond

---

## 📞 Support & Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Neon Docs**: [neon.tech/docs](https://neon.tech/docs)
- **Prisma on Vercel**: [prisma.io/docs/guides/deployment/vercel](https://prisma.io/docs/guides/deployment/vercel)

---

## 🚀 Quick Deploy Commands

```bash
# One-command deployment (after setup)
cd f:\dig\frontend && vercel --prod
cd f:\dig\backend && vercel --prod
cd f:\dig\ml && vercel --prod
```

---

**🎨 Your CardioMonitor+ app with Biometric Luxury design is now live on Vercel! 🚀**

**Demo URLs:**
- Frontend: `https://cardiomonitor-plus.vercel.app`
- Backend API: `https://cardiomonitor-api.vercel.app`
- ML API: `https://cardiomonitor-ml.vercel.app`

**Need help?** Check the troubleshooting section or Vercel's support documentation.

---

*Last Updated: February 22, 2026*
