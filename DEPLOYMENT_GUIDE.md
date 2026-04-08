# 🚀 Deployment Guide

Production deployment guide for all components of the Heartbeat Monitoring Web App.

## Architecture Overview

```
Frontend (Vercel)  →  Backend (Render)  →  Database (Neon)
                    ↓
                ML API (Render/Railway)
```

## Phase 1: Database Deployment

### Neon PostgreSQL (Already Set Up)

✅ If you followed SETUP_GUIDE.md, your Neon database is ready for production.

**Production checklist:**
- [x] Project created on Neon
- [ ] Connection pooling enabled (recommended for serverless)
- [ ] Backups enabled (automatic on Neon)
- [ ] Region close to backend deployment

**Get pooled connection string:**
1. Go to Neon Console → Your Project
2. Click "Connection Details"
3. Switch to **"Pooled connection"**
4. Copy connection string (contains `:5432/neondb?sslmode=require`)

Use this for production `DATABASE_URL`.

## Phase 2: Backend Deployment (Render)

### 2.1 Prepare Repository

```bash
cd f:\dig\backend
git init
git add .
git commit -m "Initial backend setup"

# Push to GitHub
gh repo create heartbeat-backend --private
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/heartbeat-backend.git
git push -u origin main
```

### 2.2 Deploy to Render

1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect `heartbeat-backend` repository
5. Configure:

**Settings:**
| Field | Value |
|-------|-------|
| Name | `heartbeat-api` |
| Region | Oregon (US West) or closest |
| Branch | `main` |
| Root Directory | `.` or `backend` (if monorepo) |
| Runtime | Node |
| Build Command | `npm install && npx prisma generate` |
| Start Command | `npm start` |
| Instance Type | Free (for testing) or Starter ($7/month) |

**Environment Variables:**
```env
DATABASE_URL=postgresql://...neon.tech...?sslmode=require
JWT_SECRET=production-secret-min-32-characters-random-string-here
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
ML_API_URL=https://your-ml-api.onrender.com
```

6. Click **"Create Web Service"**
7. Wait ~3 minutes for deployment

### 2.3 Run Database Migration

After deployment:

1. Go to Render dashboard → `heartbeat-api` → **Shell** tab
2. Run:
   ```bash
   npx prisma migrate deploy
   npm run seed
   ```

**Your backend is live!** 🎉

API endpoint: `https://heartbeat-api.onrender.com/api`

**Test:**
```bash
curl https://heartbeat-api.onrender.com/health
# Should return: {"status":"OK","timestamp":"..."}
```

## Phase 3: ML API Deployment (Render)

### 3.1 Prepare ML Directory

```bash
cd f:\dig\ml
git init
git add .
git commit -m "ML inference API"

gh repo create heartbeat-ml --private
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/heartbeat-ml.git
git push -u origin main
```

### 3.2 Deploy to Render

1. Render Dashboard → **"New +"** → **"Web Service"**
2. Connect `heartbeat-ml` repository
3. Configure:

| Field | Value |
|-------|-------|
| Name | `heartbeat-ml` |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt && python train.py` |
| Start Command | `python predict.py` |
| Instance Type | Free (512MB RAM sufficient) |

4. Click **"Create Web Service"**
5. Wait ~5 minutes (model training during build)

**ML API is live!** 🧠

Endpoint: `https://heartbeat-ml.onrender.com/predict`

**Test:**
```bash
curl -X POST https://heartbeat-ml.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 67,
    "gender": "Male",
    "hypertension": true,
    "heartDisease": false,
    "bmi": 28.5,
    "avgGlucoseLevel": 105,
    "smokingStatus": "formerly"
  }'
```

## Phase 4: Frontend Deployment (Vercel)

### 4.1 Update Frontend Config

**Before deploying, update API URLs:**

Create `frontend/.env.production`:
```env
VITE_API_URL=https://heartbeat-api.onrender.com/api
VITE_WS_URL=wss://heartbeat-api.onrender.com
```

### 4.2 Deploy to Vercel

**Option 1: Vercel CLI**
```bash
cd f:\dig\frontend
npm install -g vercel
vercel login
vercel --prod
```

**Option 2: Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Import from GitHub
3. Select `heartbeat-monitor` repository
4. Configure build:

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Root Directory | `frontend` (if monorepo) |
| Build Command | `npm run build` |
| Output Directory | `dist` |

5. Add environment variables:
   ```
   VITE_API_URL=https://heartbeat-api.onrender.com/api
   VITE_WS_URL=wss://heartbeat-api.onrender.com
   ```

6. Click **"Deploy"**
7. Wait ~2 minutes

**Frontend is live!** 🎨

URL: `https://heartbeat-monitor-xyz.vercel.app`

### 4.3 Update Backend CORS

In Render: Go to `heartbeat-api` → Environment → Add:
```
FRONTEND_URL=https://heartbeat-monitor-xyz.vercel.app
```

Click **"Save Changes"** (triggers redeploy).

## Phase 5: Post-Deployment

### 5.1 Test Full Flow

1. **Frontend:** Open `https://heartbeat-monitor-xyz.vercel.app`
2. **Login:** Use seeded account `doctor@cardiomonitor.com` / `password123`
3. **Dashboard:** Should load patient data from database
4. **Real-time:** Open 2 browser tabs, record BPM in one → see update in other
5. **ML:** Create health profile → Assess stroke risk

### 5.2 Performance Monitoring

**Render:**
- Monitor → Metrics (CPU, memory, response time)
- Logs → View real-time application logs

**Vercel:**
- Analytics → Page views, performance scores
- Logs → Build and runtime logs

**Neon:**
- Monitoring → Database connections, query performance

### 5.3 Custom Domain (Optional)

**Frontend (Vercel):**
1. Domains → Add Domain
2. Enter: `heartmonitor.yourdomain.com`
3. Configure DNS: Add CNAME record

**Backend (Render):**
1. Settings → Custom Domain
2. Enter: `api.heartmonitor.yourdomain.com`
3. Update DNS

## Cost Estimate

**Free Tier (for demo/MVP):**
- ✅ Neon: Free (512MB storage, 0.5 compute hours)
- ✅ Render Backend: Free (512MB RAM, spins down after 15min)
- ✅ Render ML: Free (same limits)
- ✅ Vercel: Free (100GB bandwidth)
- **Total: $0/month** (with cold start delays)

**Production Tier:**
- Neon Scale: $19/month (autoscaling compute)
- Render Starter: $7/month (always-on backend)
- Render Starter: $7/month (always-on ML)
- Vercel Pro: $20/month (team features, analytics)
- **Total: ~$53/month**

**High-Performance Tier:**
- Neon Business: $69/month (dedicated compute)
- Render Standard: $25/month (1GB RAM backend)
- Render Standard: $25/month (ML API)
- Vercel Pro: $20/month
- **Total: ~$139/month**

## Security Checklist

**Before going live:**

- [ ] Change `JWT_SECRET` to strong random string (32+ chars)
- [ ] Enable HTTPS only (automatic on Render/Vercel)
- [ ] Set secure CORS origins (no wildcards)
- [ ] Enable rate limiting (future: express-rate-limit)
- [ ] Review database permissions (Neon role-based access)
- [ ] Enable 2FA on hosting accounts
- [ ] Set up monitoring alerts (Render, Vercel, Neon)
- [ ] Back up environment variables securely (1Password, etc.)

## CI/CD (Optional)

**GitHub Actions for Backend:**

`.github/workflows/deploy-backend.yml`:
```yaml
name: Deploy Backend
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test  # Add tests
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

**Automatic deploys on push:**
- Vercel: Already enabled by default
- Render: Auto-deploy on push to main (enable in settings)

## Troubleshooting

### Issue: "Application failed to respond"
**Solution:** Check Render logs. Common: Port binding (ensure `PORT=5000` in env)

### Issue: Frontend can't connect to backend
**Solution:** Verify CORS settings, check `FRONTEND_URL` in backend `.env`

### Issue: WebSocket connection fails
**Solution:** Use `wss://` not `ws://` for production. Check Socket.io CORS config.

### Issue: ML predictions returning 500
**Solution:** Check if model file exists. May need to re-run `python train.py` in Render shell.

### Issue: Database connection pool exhausted
**Solution:** Use Neon pooled connection string (`-pooler` endpoint)

## Rollback Strategy

**Backend:**
1. Render Dashboard → Deploys → Find previous working version
2. Click "Rollback"

**Frontend:**
1. Vercel Dashboard → Deployments → Previous version
2. Click "Promote to Production"

**Database:**
- Neon Point-in-Time Recovery (Business plan)
- OR: Restore from manual backup

## Monitoring & Alerts

**Set up alerts for:**
- Backend downtime (UptimeRobot, Render built-in)
- High error rates (Sentry integration)
- Database connection issues (Neon webhooks)
- API response time > 2s (Render metrics)

**Recommended tools:**
- [Sentry.io](https://sentry.io) - Error tracking
- [UptimeRobot](https://uptimerobot.com) - Uptime monitoring (free)
- [Posthog](https://posthog.com) - Product analytics

---

**Deployment Complete!** 🎉

Your app is now live at:
- Frontend: `https://heartbeat-monitor.vercel.app`
- Backend: `https://heartbeat-api.onrender.com`
- ML API: `https://heartbeat-ml.onrender.com`
- Database: Neon Cloud (serverless)

For questions, review [README.md](README.md) or [SETUP_GUIDE.md](SETUP_GUIDE.md).
