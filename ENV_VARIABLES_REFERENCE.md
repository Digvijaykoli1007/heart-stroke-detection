# 🔐 Environment Variables Quick Reference

**Copy this file and fill in your actual values before deployment**

---

## 🎨 Frontend (.env in frontend/)

```env
# API Endpoints (Update after backend deployment)
VITE_API_URL=https://your-backend-name.vercel.app
VITE_ML_API_URL=https://your-ml-api-name.vercel.app

# For local development:
# VITE_API_URL=http://localhost:5000
# VITE_ML_API_URL=http://localhost:5001
```

---

## 🔧 Backend (.env in backend/)

```env
# Database - Neon PostgreSQL
# Get from: https://console.neon.tech/app/projects
DATABASE_URL=postgresql://neondb_owner:npg_XXXXXXXXXXXXXXXX@ep-XXXXXX.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Configuration
# Generate secure key: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-random-string
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=production

# CORS - Frontend URL
FRONTEND_URL=https://your-frontend-name.vercel.app

# ML API
ML_API_URL=https://your-ml-api-name.vercel.app

# Email (Optional - for alerts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

---

## 🤖 ML API (No .env needed)

The ML API uses the trained model files directly. Ensure these files are committed:

- `ml/models/stroke_model.pkl`
- `ml/models/preprocessor.pkl`
- `ml/models/feature_names.pkl`

---

## 📝 How to Set in Vercel Dashboard

### Via Web Interface:

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add each variable:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://...`
   - **Environments**: Production, Preview, Development (select all)
5. Click **Save**
6. Repeat for all variables

### Via Vercel CLI:

```bash
# Set single variable
vercel env add DATABASE_URL

# Pull production variables locally
vercel env pull .env.production

# List all variables
vercel env ls
```

---

## ⚡ Quick Setup Commands

### Generate Secure JWT Secret (PowerShell):

```powershell
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes(-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 48 | ForEach-Object {[char]$_})))
```

### Generate Secure JWT Secret (Node.js):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Test Database Connection:

```bash
cd backend
npx prisma db pull
```

---

## ✅ Checklist Before Deployment

- [ ] Updated `DATABASE_URL` with your Neon connection string
- [ ] Generated and set secure `JWT_SECRET` (min 32 characters)
- [ ] Updated `FRONTEND_URL` after frontend deployment
- [ ] Updated `VITE_API_URL` in frontend after backend deployment
- [ ] Updated `ML_API_URL` in backend after ML API deployment
- [ ] Committed ML model files to Git (`git add -f ml/models/*.pkl`)
- [ ] NOT committed any `.env` files to Git
- [ ] Tested all URLs work after deployment

---

## 🎯 Deployment Order

**Recommended deployment sequence:**

1. **ML API** → Get URL → Update backend `.env`
2. **Backend** → Get URL → Update frontend `.env`
3. **Frontend** → Get URL → Update backend CORS origins
4. **Redeploy Backend** with updated CORS

---

## 🔄 Update After Deployment

After deploying, update cross-references:

```bash
# 1. Deploy ML API
cd ml
vercel --prod
# Copy URL: https://cardiomonitor-ml-xxx.vercel.app

# 2. Update backend environment with ML_API_URL
# In Vercel Dashboard: Settings → Environment Variables → ML_API_URL

# 3. Deploy Backend
cd ../backend
vercel --prod
# Copy URL: https://cardiomonitor-backend-xxx.vercel.app

# 4. Update frontend environment with VITE_API_URL and VITE_ML_API_URL
# In Vercel Dashboard: Settings → Environment Variables

# 5. Deploy Frontend
cd ../frontend
vercel --prod
# Copy URL: https://cardiomonitor-xxx.vercel.app

# 6. Update backend CORS with frontend URL
# Edit backend/src/server.ts, commit, and redeploy
```

---

## 🚨 Important Security Notes

1. **NEVER commit `.env` files** to Git
2. **Change default JWT_SECRET** immediately
3. **Use strong passwords** for database
4. **Enable 2FA** on Vercel and GitHub
5. **Rotate secrets** periodically
6. **Use separate databases** for dev/staging/production

---

## 📞 Where to Get Values

| Variable | Source | URL |
|----------|--------|-----|
| `DATABASE_URL` | Neon Console | https://console.neon.tech |
| `JWT_SECRET` | Generate | Use command above |
| `VITE_API_URL` | Vercel Dashboard | After backend deployment |
| `ML_API_URL` | Vercel Dashboard | After ML API deployment |
| `FRONTEND_URL` | Vercel Dashboard | After frontend deployment |

---

**🎉 Ready to deploy! See VERCEL_DEPLOYMENT_GUIDE.md for full instructions.**

---

*Last Updated: February 22, 2026*
