# 🚀 Quick Start Commands

Essential commands to run the complete Heartbeat Monitoring Web App locally.

---

## Prerequisites

✅ Node.js 18+ installed  
✅ Python 3.9+ installed  
✅ Neon account created ([console.neon.tech](https://console.neon.tech))  
✅ Dependencies installed (if not, see below)

---

## First-Time Setup

### 1. Install Backend Dependencies
```powershell
cd f:\dig\backend
npm install
```

### 2. Install Frontend Dependencies
```powershell
cd f:\dig\frontend
npm install
```

### 3. Install ML Dependencies
```powershell
cd f:\dig\ml
pip install -r requirements.txt
```

### 4. Configure Database

**a) Create `.env` file in `backend/`:**
```powershell
cd f:\dig\backend
cp .env.example .env
```

**b) Edit `.env`** with your Neon connection string:
```env
DATABASE_URL="postgresql://YOUR_NEON_CONNECTION_STRING"
JWT_SECRET="your-random-secret-min-32-characters"
```

**c) Run migrations:**
```powershell
npx prisma generate
npx prisma migrate dev --name init
```

**d) Seed demo data:**
```powershell
npm run seed
```

### 5. Train ML Model (Optional)
```powershell
cd f:\dig\ml
python train.py
```
Takes ~3 minutes. Creates `models/` directory with trained Random Forest model.

---

## Daily Development

### Start All Services (3 Terminals)

**Terminal 1: Backend API**
```powershell
cd f:\dig\backend
npm run dev
```
✅ Starts on http://localhost:5000  
✅ WebSocket server ready

**Terminal 2: Frontend**
```powershell
cd f:\dig\frontend
npm run dev
```
✅ Starts on http://localhost:3001  
✅ Opens browser automatically

**Terminal 3: ML API (Optional)**
```powershell
cd f:\dig\ml
python predict.py
```
✅ Starts on http://localhost:5001  
✅ Falls back to rule-based if not running

---

## Quick Commands Reference

### Backend
```powershell
cd f:\dig\backend

# Development server (auto-reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Database commands
npx prisma studio              # Open database GUI (port 5555)
npx prisma migrate dev         # Run new migrations
npx prisma generate            # Regenerate Prisma client
npm run seed                   # Seed demo data

# View logs
# (logs appear in terminal where npm run dev is running)
```

### Frontend
```powershell
cd f:\dig\frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### ML
```powershell
cd f:\dig\ml

# Train model
python train.py

# Start inference API
python predict.py

# Test prediction (in PowerShell)
Invoke-RestMethod -Method Post -Uri "http://localhost:5001/predict" `
  -ContentType "application/json" `
  -Body '{"age":67,"gender":"Male","hypertension":true,"heartDisease":false,"bmi":28.5,"avgGlucoseLevel":105,"smokingStatus":"formerly"}'
```

---

## Test Commands

### Backend API Testing

**Health check:**
```powershell
curl http://localhost:5000/health
```

**Register user:**
```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Test User\"}'
```

**Login:**
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"john@patient.com\",\"password\":\"password123\"}'
```

**Record heartbeat (requires token):**
```powershell
# First, get token from login response, then:
$token = "YOUR_JWT_TOKEN_HERE"
curl -X POST http://localhost:5000/api/heartbeat `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{\"bpm\":78,\"source\":\"manual\"}'
```

### Frontend Testing
1. Open http://localhost:3001
2. Check browser console for errors (F12)
3. Should see 4 patient cards
4. BPM values update every 3 seconds

### ML API Testing
```powershell
# Test prediction
curl -X POST http://localhost:5001/predict `
  -H "Content-Type: application/json" `
  -d '{\"age\":67,\"gender\":\"Male\",\"hypertension\":true,\"heartDisease\":false,\"bpm\":28.5,\"avgGlucoseLevel\":105,\"smokingStatus\":\"formerly\"}'
```

---

## Troubleshooting

### Port Already in Use

**Backend (port 5000):**
```powershell
# Kill process on port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

**Frontend (port 3001):**
```powershell
# Kill process on port 3001
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
```

### Database Connection Error
- Check if DATABASE_URL is set in `backend/.env`
- Verify Neon connection string is correct
- Test connection: `npx prisma studio`

### Prisma Client Not Generated
```powershell
cd f:\dig\backend
npx prisma generate
```

### Frontend Blank Page
- Check browser console (F12)
- Ensure `npm run dev` is running
- Clear browser cache

### ML Model Not Found
```powershell
cd f:\dig\ml
python train.py
```
Wait for training to complete (~3 minutes).

---

## Stop All Services

**Windows:**
- Press `Ctrl+C` in each terminal

**If stuck:**
```powershell
# Kill all Node processes
Get-Process node | Stop-Process -Force

# Kill all Python processes
Get-Process python | Stop-Process -Force
```

---

## Database GUI

**Open Prisma Studio:**
```powershell
cd f:\dig\backend
npx prisma studio
```
Opens at http://localhost:5555

View/edit database records directly.

---

## Demo Accounts (after seeding)

**Doctor:**
- Email: `doctor@cardiomonitor.com`
- Password: `password123`

**Patients:**
- Email: `john@patient.com` / `password123`
- Email: `maria@patient.com` / `password123`
- Email: `david@patient.com` / `password123`

---

## URLs Reference

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3001 | React dashboard |
| Backend API | http://localhost:5000/api | REST endpoints |
| Backend Health | http://localhost:5000/health | Health check |
| WebSocket | ws://localhost:5000 | Socket.io server |
| ML API | http://localhost:5001/predict | Stroke prediction |
| ML Health | http://localhost:5001/health | ML API health |
| Prisma Studio | http://localhost:5555 | Database GUI |

---

## Environment Files

**Backend `.env`** (required):
```env
DATABASE_URL="postgresql://user:pass@neon.tech/db?sslmode=require"
JWT_SECRET="random-secret-32-chars-minimum"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3001"
ML_API_URL="http://localhost:5001"
```

**Frontend `.env`** (optional for dev):
```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
```

---

## Git Workflow

```powershell
# Initialize repo (if not done)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo
gh repo create heartbeat-monitor --private

# Push
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/heartbeat-monitor.git
git push -u origin main
```

---

**Quick Start Complete!** 🎉

For detailed guides:
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Full setup walkthrough
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Production deployment
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - Current project state
- [README.md](README.md) - Project overview

Ready to code! 💻
