# 🚀 Complete Setup Guide

Step-by-step guide to run the Heartbeat Monitoring Web App locally.

## Prerequisites

Before starting, ensure you have:
- ✅ Node.js 18+ ([download](https://nodejs.org))
- ✅ Python 3.9+ ([download](https://python.org))
- ✅ Git
- ✅ Code editor (VS Code recommended)
- ✅ Neon account (free) - [console.neon.tech](https://console.neon.tech)

## Phase 1: Database Setup (5 minutes)

### 1.1 Create Neon Database

1. Go to https://console.neon.tech
2. Sign in with GitHub
3. Click **"New Project"**
4. Name: `heartbeat-monitor`
5. Region: Choose closest to you
6. Click **"Create Project"**

### 1.2 Get Connection String

1. In project dashboard, click **"Connection Details"**
2. Copy the **"Connection string"** (looks like):
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/heartbeat_db?sslmode=require
   ```

## Phase 2: Backend Setup (10 minutes)

### 2.1 Install Dependencies

```bash
cd f:\dig\backend
npm install
```

Wait for ~257 packages to install (~2 minutes).

### 2.2 Configure Environment

```bash
# Create .env file
cp .env.example .env
```

**Edit `.env`** and add your Neon connection string:

```env
DATABASE_URL="postgresql://YOUR_NEON_CONNECTION_STRING_HERE"
JWT_SECRET="change-this-to-random-32-character-string-for-production"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3001"
ML_API_URL="http://localhost:5001"
```

### 2.3 Setup Database Schema

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations (creates tables)
npx prisma migrate dev --name init
```

You should see:
```
✔ Generated Prisma Client
✔ Your database is now in sync with your schema
```

### 2.4 Seed Demo Data

```bash
npm run seed
```

Creates:
- 1 Doctor account
- 3 Patient accounts  
- Sample heartbeat records (last 24 hours)
- Default alert settings

**Login credentials:**
```
Doctor:
  Email: doctor@cardiomonitor.com
  Password: password123

Patients:
  Email: john@patient.com / password123
  Email: maria@patient.com / password123
  Email: david@patient.com / password123
```

### 2.5 Start Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000
✓ Connected to database
✓ WebSocket server ready
```

**Keep this terminal open!**

## Phase 3: Frontend Setup (5 minutes)

Open **new terminal window**.

### 3.1 Install Dependencies

```bash
cd f:\dig\frontend
npm install
```

Wait for ~257 packages to install.

### 3.2 Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.0.12  ready in 500 ms

  ➜  Local:   http://localhost:3001/
  ➜  Network: use --host to expose
```

### 3.3 Open Dashboard

Open browser: **http://localhost:3001**

You should see:
- CardioMonitor+ header
- 4 patient cards (John, Maria, David, Emily)
- Real-time BPM values updating every 3 seconds
- Heart rate charts

**Demo Mode:** Frontend is running with mock data (not connected to backend yet).

## Phase 4: ML Model Training (Optional - 15 minutes)

Open **third terminal window**.

### 4.1 Install Python Dependencies

```bash
cd f:\dig\ml
pip install -r requirements.txt
```

Installs: scikit-learn, pandas, Flask, imbalanced-learn, etc.

### 4.2 Train Model

```bash
python train.py
```

This will:
1. Load 43,400 stroke records
2. Handle imbalanced data with SMOTE
3. Train Random Forest classifier
4. Save model to `models/` directory

Takes ~2-3 minutes. You'll see:
```
✓ Loaded 43400 records
✓ Model trained successfully
✓ Model saved to ./models/
```

### 4.3 Start ML API Server

```bash
python predict.py
```

You should see:
```
🚀 ML Inference API Server
Endpoint: POST http://localhost:5001/predict
```

**Keep this terminal open!**

## Phase 5: Integration (Coming Next)

Currently:
- ✅ Backend API running (port 5000)
- ✅ Frontend dashboard running (port 3001) - **mock data**
- ✅ ML API running (port 5001) - optional
- ⏳ Frontend → Backend connection (next step)

To connect frontend to backend:
1. Update `frontend/src/services/api.ts`
2. Replace mock data with real API calls
3. Add Socket.io client for real-time updates
4. Implement login page

## Verification Checklist

**Backend (http://localhost:5000):**
```bash
# Test health endpoint
curl http://localhost:5000/health

# Expected: {"status":"OK","timestamp":"2024-..."}
```

**Frontend (http://localhost:3001):**
- [ ] Dashboard loads without errors
- [ ] 4 patient cards visible
- [ ] BPM values update every 3 seconds
- [ ] Chart shows 24-hour trend

**Database:**
```bash
cd backend
npx prisma studio
```
Opens GUI at http://localhost:5555
- [ ] Check User table (4 users)
- [ ] Check HeartbeatRecord table (72+ records)

**ML API (http://localhost:5001):**
```bash
curl http://localhost:5001/health

# Expected: {"status":"OK","model_loaded":true}
```

## Common Issues

### Issue: "Port 5000 already in use"
**Solution:** Kill existing process or change port in `.env`

### Issue: "DATABASE_URL environment variable not found"
**Solution:** Ensure you created `.env` file in `backend/` directory

### Issue: Prisma migrate fails
**Solution:** Check if Neon database connection string is correct

### Issue: Frontend shows blank page
**Solution:** Check browser console for errors. Ensure Vite dev server is running.

### Issue: ML model not found
**Solution:** Run `python train.py` first to create the model

## Terminal Summary

You should have **3 terminals running:**

1. **Backend:** `cd backend && npm run dev` → port 5000
2. **Frontend:** `cd frontend && npm run dev` → port 3001
3. **ML API (optional):** `cd ml && python predict.py` → port 5001

## Next Steps

After setup:
1. Explore dashboard UI
2. Test API endpoints with Postman/curl
3. Check WebSocket connections in browser DevTools
4. Review database with Prisma Studio
5. Start frontend-backend integration

For detailed architecture, see [PROJECT_ANALYSIS.md](PROJECT_ANALYSIS.md).

For design guidelines, see [DESIGN_PHILOSOPHY.md](DESIGN_PHILOSOPHY.md).

---

**Questions?** Check the README files in each directory:
- [backend/README.md](backend/README.md)
- [ml/README.md](ml/README.md)

**Ready to code!** 🎉
