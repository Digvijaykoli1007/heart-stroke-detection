# Heartbeat Monitoring Backend API

Express.js + TypeScript + Prisma + Socket.io backend for real-time cardiac monitoring.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup

**Get Neon PostgreSQL connection string:**
1. Go to [console.neon.tech](https://console.neon.tech)
2. Create new project: "heartbeat-monitor"
3. Copy connection string

**Configure environment:**
```bash
cp .env.example .env
# Edit .env and paste your DATABASE_URL
```

**Run migrations:**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 3. Seed Database
```bash
npm run seed
```

This creates:
- 1 Doctor: `doctor@cardiomonitor.com` / `password123`
- 3 Patients: `john@patient.com`, `maria@patient.com`, `david@patient.com` / `password123`
- Sample heartbeat data (last 24 hours)

### 4. Start Server
```bash
npm run dev
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password

### Heartbeat Monitoring
- `POST /api/heartbeat` - Record BPM (requires auth)
- `GET /api/heartbeat/history` - Get historical data
- `GET /api/heartbeat/analytics` - Get statistics (24h/7d/30d)

### Alerts
- `GET /api/alerts` - List all alerts
- `PUT /api/alerts/:id/dismiss` - Dismiss alert
- `GET /api/alerts/settings` - Get alert thresholds
- `PUT /api/alerts/settings` - Update alert thresholds

### Patients (Doctor/Admin only)
- `GET /api/patients` - List all patients
- `GET /api/patients/:id` - Get patient details
- `GET /api/patients/:id/dashboard` - Get patient dashboard data

### Health & ML
- `GET /api/health/profile` - Get health profile
- `POST /api/health/profile` - Create/update health profile
- `POST /api/health/assess-risk` - Assess stroke risk with ML

## WebSocket Events

**Client → Server:**
- `join-user-room` - Join personal monitoring room
- `join-doctor-room` - Join doctor's multi-patient room
- `simulate-heartbeat` - Simulate BPM reading (testing)

**Server → Client:**
- `bpm-update` - New heartbeat recorded
- `alert-created` - Alert triggered
- `alert-dismissed` - Alert dismissed
- `heartbeat` - Keepalive ping (every 30s)

## Database Schema

**6 Models:**
- `User` - PATIENT | DOCTOR | ADMIN
- `HeartbeatRecord` - BPM readings with timestamps
- `Alert` - BRADYCARDIA | TACHYCARDIA | CRITICAL
- `AlertSettings` - Customizable thresholds per user
- `HealthProfile` - Age, BMI, conditions for ML
- `PatientAccess` - Doctor-patient relationships

See `prisma/schema.prisma` for full schema.

## Scripts

```bash
npm run dev         # Start development server (tsx watch)
npm run build       # Build for production
npm start           # Run production build
npm run seed        # Seed database with demo data
npx prisma studio   # Open database GUI (localhost:5555)
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret for JWT signing (min 32 chars) | Required |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment (development/production) | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3001 |
| `ML_API_URL` | Python ML API endpoint (optional) | http://localhost:5001 |

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL (Neon serverless)
- **Real-time:** Socket.io
- **Auth:** JWT + bcrypt
- **Validation:** Zod

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma         # Database schema
├── src/
│   ├── config/
│   │   └── database.ts       # Prisma client
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT verification
│   │   └── error.middleware.ts  # Global error handler
│   ├── routes/
│   │   ├── auth.routes.ts       # Register/login
│   │   ├── heartbeat.routes.ts  # BPM recording
│   │   ├── alert.routes.ts      # Alert management
│   │   ├── patient.routes.ts    # Patient data
│   │   └── health.routes.ts     # ML predictions
│   ├── services/
│   │   ├── alert.service.ts     # Alert logic
│   │   └── ml.service.ts        # ML integration
│   ├── socket/
│   │   └── socket.ts            # WebSocket setup
│   ├── utils/
│   │   └── seed.ts              # Database seeding
│   └── server.ts                # Main entry point
├── .env.example
├── package.json
└── tsconfig.json
```

## Development Notes

**Testing WebSocket connections:**
```javascript
const socket = io('http://localhost:5000');
socket.emit('join-user-room', 'user-id-here');
socket.on('bpm-update', (data) => console.log(data));
```

**Manual BPM recording (curl):**
```bash
# Login first
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@patient.com","password":"password123"}' \
  | jq -r '.token')

# Record heartbeat
curl -X POST http://localhost:5000/api/heartbeat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bpm":78,"source":"manual"}'
```

## Deployment

**Render.com (recommended):**
1. Connect GitHub repo
2. Set service type: Web Service
3. Build: `npm install && npx prisma generate`
4. Start: `npm start`
5. Add environment variables from `.env.example`

**Vercel Functions:**
Use serverless-friendly architecture (separate repo recommended).

## License

Part of Heartbeat Monitoring Full-Stack Web App
