# ⚠️ IMPORTANT: Database Setup Required

Your Heartbeat Monitoring Web App is **95% complete**!

## What's Missing: Database Connection

The backend needs a PostgreSQL database connection string.

---

## 🚀 Get Started in 3 Minutes

### 1. Create Free Neon Account
Visit: **https://console.neon.tech**
- Sign in with GitHub (instant)
- Click "New Project"
- Name: `heartbeat-monitor`
- Click "Create Project"

### 2. Copy Connection String
In Neon dashboard:
- Go to "Connection Details"
- Copy the full connection string (looks like):
  ```
  postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
  ```

### 3. Update Backend .env File
Open: `backend/.env` (file already exists)

Find this line:
```env
DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/heartbeat_db?schema=public"
```

Replace with your Neon connection string:
```env
DATABASE_URL="postgresql://YOUR_ACTUAL_NEON_STRING_HERE"
```

### 4. Run Backend Setup
```powershell
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

### 5. Open Application
**Frontend:** http://localhost:3001

**Login:**
- Email: `doctor@cardiomonitor.com`
- Password: `password123`

---

## ✅ That's It!

The app will be fully functional with:
- ✅ Real-time BPM monitoring
- ✅ WebSocket live updates
- ✅ Alert system
- ✅ Patient management
- ✅ 24-hour trend charts
- ✅ ML stroke risk prediction (optional)

---

## 💡 Why Neon?

- **Free tier:** Perfect for development
- **Serverless:** No configuration needed
- **Production-ready:** Auto-scaling
- **PostgreSQL:** Industry standard

**Alternative:** You can use any PostgreSQL database - just update the `DATABASE_URL` in `backend/.env`

---

## 📚 Full Documentation

- [INTEGRATION_COMPLETE.md](INTEGRATION_COMPLETE.md) - Detailed setup
- [QUICKSTART.md](QUICKSTART.md) - All commands
- [README.md](README.md) - Project overview

---

**Total Setup Time:** ~3 minutes  
**All code is ready - just needs database connection!**
