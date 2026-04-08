# 🫀 Heartbeat Monitoring System - Complete Project Analysis

**Generated:** February 21, 2026  
**Analysis of:** Full requirements + CSV dataset + Architecture decisions

---

## 📋 Executive Summary

You're building a **Cardiac Monitoring & Risk Assessment Platform** that combines:
1. **Real-time heartbeat monitoring** (BPM tracking, alerts, dashboards)
2. **AI-powered stroke risk prediction** (using the provided dataset)
3. **Multi-role clinical workflow** (Patient/Doctor/Admin portals)

**Key Decision:** ✅ **Use Neon (PostgreSQL)** instead of MongoDB  
**Key Insight:** 🧠 Your CSV enables **stroke risk scoring**, not real-time BPM anomaly detection

---

## 🎯 Project Requirements Breakdown

### Core Features (MVP - Must Have)

#### 1. Authentication & Authorization
- ✅ JWT-based auth with bcrypt password hashing
- ✅ Three roles: **Patient**, **Doctor**, **Admin**
- ✅ Secure session management
- ✅ Route protection based on roles

#### 2. Heartbeat Data Ingestion
**Data Sources:**
- Manual BPM entry (patient self-reporting)
- Mobile app input (via API)
- Simulated data generator (for testing/demo)
- Future: Smartwatch APIs (Google Fit, Apple Health)

**Required APIs:**
```
POST   /api/heartbeat          - Record new BPM reading
GET    /api/heartbeat/:userId  - Get latest readings
GET    /api/heartbeat/history  - Get historical data
```

#### 3. Real-Time Monitoring Dashboard
- Live BPM display with WebSocket updates
- Status indicators:
  - 🟢 **Normal:** 60-100 BPM (resting adult)
  - 🟡 **Warning:** 50-59 or 101-120 BPM
  - 🔴 **Critical:** <50 or >120 BPM
- Line charts showing trends (Chart.js/Recharts)
- Patient selection dropdown

#### 4. Alert System
**Trigger Logic:**
```javascript
if (bpm < 50) → "Bradycardia Alert" (Low Heart Rate)
if (bpm > 120) → "Tachycardia Alert" (High Heart Rate)
if (bpm > 140) → "Critical Alert" (Immediate attention)
```

**Notification Channels:**
- Browser push notifications (immediate)
- Email alerts (Nodemailer)
- Dashboard warnings (persistent)
- Optional: SMS via Twilio

**Required APIs:**
```
GET    /api/alerts             - Get user alerts
POST   /api/alert-settings     - Configure thresholds
PUT    /api/alerts/:id/dismiss - Dismiss alert
```

#### 5. Analytics & Reports
**Calculations Needed:**
- Average BPM (daily, weekly, monthly)
- Resting heart rate (lowest 5-minute average)
- Peak heart rate
- Heart rate variability (HRV)
- Abnormal pattern count
- Time in zones (normal/warning/critical)

**Reporting:**
- Daily summary cards
- Weekly trend graphs
- Monthly health reports
- Exportable PDFs

#### 6. Admin Panel
- User management (CRUD operations)
- System statistics dashboard
- Alert logs and audit trail
- Patient monitoring overview
- Activity tracking

---

## 📊 CSV Dataset Analysis

### Dataset Overview
- **File:** `train_strokes.csv`
- **Records:** 43,400 patients
- **Type:** Stroke prediction (classification problem)

### Data Distribution
```
Total Patients:        43,400
Stroke Cases:          783 (1.8%)  ← Imbalanced dataset
No Stroke:             42,617 (98.2%)
Average Age:           42.2 years
Heart Disease:         2,062 patients (4.75%)
Hypertension:          4,061 patients (9.36%)
```

### Features Available
| Feature | Type | Description |
|---------|------|-------------|
| `id` | Integer | Patient ID |
| `gender` | Categorical | Male/Female |
| `age` | Numeric | Patient age |
| `hypertension` | Binary | 0 or 1 |
| `heart_disease` | Binary | 0 or 1 |
| `ever_married` | Categorical | Yes/No |
| `work_type` | Categorical | Private/Self-employed/Govt/children/Never_worked |
| `Residence_type` | Categorical | Urban/Rural |
| `avg_glucose_level` | Numeric | Average glucose mg/dL |
| `bmi` | Numeric | Body Mass Index (has missing values) |
| `smoking_status` | Categorical | formerly smoked/never smoked/smokes/Unknown |
| `stroke` | Binary | **TARGET:** 0=No, 1=Yes |

### Key Insights
1. **Imbalanced Dataset:** Only 1.8% positive cases (typical for medical data)
2. **Missing Data:** BMI and smoking_status have null values
3. **No BPM Data:** This is health profile data, not time-series heartbeat monitoring
4. **Use Case:** Stroke risk prediction, NOT real-time anomaly detection

---

## 🏗️ Architecture Decision: Neon vs MongoDB

### ✅ Recommendation: **Use Neon (PostgreSQL)**

#### Why Neon Wins for This Project

**1. Relational Data Model Fits Better**
```sql
-- Your data has clear relationships
users ─┬─ heartbeat_records (1:many)
       ├─ alerts (1:many)
       ├─ alert_settings (1:1)
       └─ health_profile (1:1) -- for stroke risk data

-- Doctors can access multiple patients
doctors ─── patient_access (many:many) ─── patients
```

**2. Analytics & Reporting Requirements**
```sql
-- Easy aggregations (your requirement #9)
SELECT 
  DATE(timestamp) as date,
  AVG(bpm) as avg_bpm,
  MIN(bpm) as min_bpm,
  MAX(bpm) as max_bpm,
  COUNT(CASE WHEN bpm > 120 THEN 1 END) as high_alerts
FROM heartbeat_records
WHERE user_id = ?
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Multi-patient dashboard for doctors
SELECT 
  u.name,
  COUNT(a.id) as total_alerts,
  MAX(h.bpm) as latest_bpm,
  h.timestamp as last_reading
FROM users u
JOIN heartbeat_records h ON u.id = h.user_id
LEFT JOIN alerts a ON u.id = a.user_id AND a.created_at > NOW() - INTERVAL '7 days'
GROUP BY u.id;
```

**3. ACID Compliance for Medical Data**
- Critical alerts need guaranteed consistency
- No risk of race conditions on alert creation
- Transaction support for complex operations

**4. Neon-Specific Benefits**
- **Serverless:** Auto-scaling, pay-per-use
- **Branching:** Create test environments instantly
- **Fast queries:** Better indexing for time-series data
- **PostgreSQL ecosystem:** Mature tools (Prisma, pgvector for future AI features)

**5. Type Safety with Prisma**
```typescript
// Full TypeScript safety
const readings = await prisma.heartbeatRecord.findMany({
  where: { userId, timestamp: { gte: startDate } },
  include: { user: true },
  orderBy: { timestamp: 'desc' }
});
```

#### When MongoDB Would Be Better
- Extreme schema flexibility needed
- 100+ different wearable device payload formats
- Nested JSON from third-party APIs that varies wildly
- **Your case doesn't need this**

---

## 🧠 AI/ML Integration Strategy

### What Your CSV Can Do
❌ **Cannot:** Detect real-time heartbeat anomalies (no BPM data)  
✅ **Can:** Predict stroke risk based on health profile

### Recommended ML Approach

#### Phase 1: Train Stroke Risk Model (Now)
```python
# Model: Random Forest or XGBoost
# Features: age, hypertension, heart_disease, bmi, glucose, smoking
# Output: Stroke risk probability (0-100%)

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import pandas as pd

# Load dataset
df = pd.read_csv('train_strokes.csv')

# Handle imbalanced data with SMOTE or class weights
# Train model
# Export as joblib/pickle for backend API
```

#### Phase 2: API Integration
```javascript
// Backend endpoint
POST /api/health-risk-assessment
{
  "userId": "123",
  "age": 58,
  "hypertension": true,
  "heartDisease": false,
  "bmi": 28.5,
  "avgGlucose": 110,
  "smokingStatus": "formerly smoked"
}

// Response
{
  "strokeRiskScore": 0.23,  // 23% risk
  "riskLevel": "moderate",
  "recommendation": "Schedule cardiology check-up",
  "factors": ["age > 55", "hypertension present"]
}
```

#### Phase 3: Combine with BPM Monitoring
```javascript
// Enhanced dashboard
Dashboard shows:
  ├─ Real-time BPM: 78 🟢 Normal
  ├─ Stroke Risk: 23% 🟡 Moderate
  └─ Combined Insight: "Heart rate stable, but moderate stroke risk.
                        Consider lifestyle modifications."
```

### Future: Real-Time Anomaly Detection
For actual BPM anomaly detection, you'll need:
1. **Time-series BPM data** (collect from your app over weeks/months)
2. **Labeled anomalies** (cardiologist-reviewed abnormal patterns)
3. **LSTM/Transformer model** for sequential patterns
4. **Stream processing** (Apache Kafka + ML inference)

---

## 🗄️ Database Schema (Neon/PostgreSQL)

### Prisma Schema
```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // Neon connection string
}

enum Role {
  PATIENT
  DOCTOR
  ADMIN
}

enum AlertType {
  BRADYCARDIA    // Low heart rate
  TACHYCARDIA    // High heart rate
  CRITICAL       // Dangerous levels
}

model User {
  id                String              @id @default(cuid())
  email             String              @unique
  name              String
  password          String              // bcrypt hashed
  role              Role                @default(PATIENT)
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  
  // Relations
  heartbeatRecords  HeartbeatRecord[]
  alerts            Alert[]
  alertSettings     AlertSettings?
  healthProfile     HealthProfile?
  
  // Doctor-patient relationships
  patientsAccess    PatientAccess[]     @relation("DoctorAccess")
  doctorsAccess     PatientAccess[]     @relation("PatientAccess")
}

model HeartbeatRecord {
  id            String      @id @default(cuid())
  userId        String
  bpm           Int
  timestamp     DateTime    @default(now())
  source        String      @default("manual") // manual, mobile, wearable, simulated
  
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, timestamp(sort: Desc)])
  @@index([timestamp])
}

model Alert {
  id            String      @id @default(cuid())
  userId        String
  bpmValue      Int
  alertType     AlertType
  message       String
  dismissed     Boolean     @default(false)
  dismissedAt   DateTime?
  createdAt     DateTime    @default(now())
  
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, createdAt(sort: Desc)])
  @@index([dismissed])
}

model AlertSettings {
  id                String   @id @default(cuid())
  userId            String   @unique
  minBpm            Int      @default(50)
  maxBpm            Int      @default(120)
  criticalMinBpm    Int      @default(40)
  criticalMaxBpm    Int      @default(140)
  emailEnabled      Boolean  @default(true)
  smsEnabled        Boolean  @default(false)
  pushEnabled       Boolean  @default(true)
  
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model HealthProfile {
  id                String   @id @default(cuid())
  userId            String   @unique
  age               Int
  gender            String
  hypertension      Boolean  @default(false)
  heartDisease      Boolean  @default(false)
  bmi               Float?
  avgGlucoseLevel   Float?
  smokingStatus     String?  // "never", "formerly", "current", "unknown"
  strokeRiskScore   Float?   // ML model output (0-1)
  lastAssessment    DateTime?
  
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([strokeRiskScore])
}

model PatientAccess {
  id          String   @id @default(cuid())
  doctorId    String
  patientId   String
  grantedAt   DateTime @default(now())
  
  doctor      User     @relation("DoctorAccess", fields: [doctorId], references: [id], onDelete: Cascade)
  patient     User     @relation("PatientAccess", fields: [patientId], references: [id], onDelete: Cascade)
  
  @@unique([doctorId, patientId])
  @@index([doctorId])
  @@index([patientId])
}
```

### Why This Schema?
1. **Time-series optimized:** Indexed timestamp columns for fast queries
2. **Role-based access:** Doctor-patient many-to-many relationship
3. **Configurable alerts:** Per-user threshold settings
4. **ML integration ready:** HealthProfile stores stroke risk scores
5. **Audit trail:** All timestamps tracked for compliance

---

## 🛠️ Technology Stack (Final Recommendation)

### Backend
```yaml
Runtime:        Node.js 20+
Framework:      Express.js
Database:       Neon (PostgreSQL)
ORM:            Prisma
Auth:           JWT (jsonwebtoken) + bcrypt
Real-time:      Socket.io
Email:          Nodemailer
Validation:     Zod
Testing:        Jest + Supertest
```

### Frontend
```yaml
Framework:      React 18 + TypeScript
Build Tool:     Vite
Styling:        Tailwind CSS
Charts:         Recharts or Chart.js
State:          Zustand or React Context
HTTP Client:    Axios
Real-time:      Socket.io-client
UI Components:  shadcn/ui (already have frontend-design skill)
Design:         Custom (using frontend-design skill for unique aesthetics)
```

### ML/AI
```yaml
Model Training:   Python (scikit-learn/XGBoost)
Model Serving:    Node.js + onnxruntime-node OR separate Python API
Data Processing:  pandas, numpy
Class Balance:    SMOTE (imbalanced-learn)
```

### DevOps
```yaml
Frontend Host:    Vercel (auto-deploy from Git)
Backend Host:     Render or Railway
Database:         Neon (serverless Postgres)
Storage:          Cloudinary (profile images, reports)
Monitoring:       Sentry (error tracking)
```

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
**Goal:** Working auth + basic BPM recording

- [ ] Project setup (frontend + backend monorepo)
- [ ] Neon database setup + Prisma schema
- [ ] User registration/login (JWT auth)
- [ ] Role-based route protection
- [ ] Basic dashboard layout
- [ ] Manual BPM entry form
- [ ] Database: Store heartbeat records

**Deliverable:** Can register, login, and log BPM manually

---

### Phase 2: Real-Time Monitoring (Week 3-4)
**Goal:** Live dashboard with alerts

- [ ] Socket.io integration (backend + frontend)
- [ ] Real-time BPM display
- [ ] Alert detection logic (threshold checking)
- [ ] Alert notification system (browser + email)
- [ ] Chart integration (line chart for trends)
- [ ] Status indicators (🟢🟡🔴)

**Deliverable:** Live monitoring dashboard with working alerts

---

### Phase 3: Analytics & History (Week 5)
**Goal:** Historical data visualization

- [ ] Daily/weekly/monthly aggregations API
- [ ] Analytics dashboard page
- [ ] Multi-timeframe charts
- [ ] Statistics cards (avg BPM, peak, resting rate)
- [ ] Export to PDF (jsPDF or Puppeteer)

**Deliverable:** Complete analytics and reporting system

---

### Phase 4: ML Integration (Week 6-7)
**Goal:** Stroke risk prediction

- [ ] Train stroke risk model (Python)
  - [ ] Data preprocessing (handle missing BMI values)
  - [ ] Feature engineering
  - [ ] Handle class imbalance (SMOTE)
  - [ ] Model selection (Random Forest vs XGBoost)
  - [ ] Hyperparameter tuning
  - [ ] Export model
- [ ] Health profile management UI
- [ ] Risk assessment API endpoint
- [ ] Integrate ONNX model in Node.js OR Python microservice
- [ ] Display risk score on dashboard
- [ ] Recommendations engine

**Deliverable:** AI-powered stroke risk assessment

---

### Phase 5: Multi-Role Features (Week 8-9)
**Goal:** Doctor and admin portals

- [ ] Doctor portal
  - [ ] Patient list with access control
  - [ ] Multi-patient monitoring dashboard
  - [ ] Patient detail view (full history)
  - [ ] Grant/revoke access
- [ ] Admin panel
  - [ ] User management (CRUD)
  - [ ] System statistics
  - [ ] Alert logs viewer
  - [ ] Activity audit trail

**Deliverable:** Full role-based application

---

### Phase 6: Advanced Features (Week 10+)
**Goal:** Production-ready polish

- [ ] Data ingestion from external APIs
  - [ ] Google Fit integration
  - [ ] Apple Health integration
- [ ] Simulated data generator (for demos)
- [ ] SMS alerts (Twilio)
- [ ] Dark/light theme toggle
- [ ] Mobile responsive design
- [ ] Performance optimization
- [ ] Security audit
- [ ] Load testing
- [ ] Documentation

**Deliverable:** Production-ready application

---

## 📁 Project Structure

```
heartbeat-monitor/
├── packages/
│   ├── api/                          # Backend (Express + Prisma)
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── database.ts       # Prisma client
│   │   │   │   ├── jwt.ts
│   │   │   │   └── socket.ts         # Socket.io config
│   │   │   ├── controllers/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── heartbeat.controller.ts
│   │   │   │   ├── alert.controller.ts
│   │   │   │   └── analytics.controller.ts
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   └── role.middleware.ts
│   │   │   ├── services/
│   │   │   │   ├── alert.service.ts  # Alert detection logic
│   │   │   │   ├── email.service.ts
│   │   │   │   └── ml.service.ts     # Stroke risk prediction
│   │   │   ├── utils/
│   │   │   └── server.ts             # Entry point
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   │
│   ├── web/                          # Frontend (React + Vite)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── auth/
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── LiveMonitor.tsx
│   │   │   │   │   ├── BPMChart.tsx
│   │   │   │   │   └── AlertList.tsx
│   │   │   │   ├── analytics/
│   │   │   │   └── admin/
│   │   │   ├── pages/
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Analytics.tsx
│   │   │   │   └── Profile.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useSocket.ts
│   │   │   ├── services/
│   │   │   │   ├── api.ts
│   │   │   │   └── socket.ts
│   │   │   ├── lib/
│   │   │   └── main.tsx
│   │   └── package.json
│   │
│   └── ml/                           # ML Model (Python)
│       ├── notebooks/
│       │   └── stroke_model_training.ipynb
│       ├── models/
│       │   └── stroke_risk_model.pkl
│       ├── train.py
│       ├── evaluate.py
│       └── requirements.txt
│
├── data/
│   └── train_strokes.csv            # Your provided dataset
│
├── docs/
│   ├── API.md
│   └── DEPLOYMENT.md
│
└── package.json                      # Root (turborepo/nx)
```

---

## 🔒 Security Considerations

### Must Implement
1. **HTTPS Only:** Force secure connections
2. **Rate Limiting:** Prevent brute-force attacks
3. **Input Validation:** Sanitize all inputs (Zod schemas)
4. **SQL Injection Protection:** Prisma parameterized queries (automatic)
5. **XSS Protection:** React escapes by default, but validate user content
6. **CORS Configuration:** Whitelist frontend domain only
7. **Environment Variables:** Never commit secrets (.env files)
8. **Password Policy:** Min 8 chars, complexity requirements
9. **Session Management:** JWT expiry (15min access, 7d refresh)
10. **Data Encryption:** Encrypt sensitive health data at rest

### Compliance (If Required)
- **HIPAA:** If handling real patient data in US
- **GDPR:** If serving EU users (data deletion, consent)
- **Audit Logging:** Track all data access for compliance

---

## 💰 Cost Estimates (Monthly)

### Development/Testing
```
Neon (Free Tier):         $0     (3 GB storage, sufficient for MVP)
Render (Free):            $0     (will sleep after inactivity)
Vercel (Free):            $0     (hobby tier)
Total:                    $0/month
```

### Production (Small Scale)
```
Neon Pro:                 $19/month  (Always-on, 7 GB storage)
Render Starter:           $7/month   (Always-on backend)
Vercel Pro:               $20/month  (Better performance)
Nodemailer (SendGrid):    $15/month  (10k emails)
Cloudinary:               $0         (Free tier: 25 GB)
Total:                    $61/month
```

### Production (Medium Scale - 1000 users)
```
Neon Scale:               $69/month  (More connections, storage)
Render Standard:          $25/month  (Better performance)
Vercel Pro:               $20/month
SendGrid:                 $15/month
Twilio (SMS):             $50/month  (optional)
Total:                    $129-179/month
```

---

## 📊 Success Metrics

### Technical Metrics
- API response time: <200ms (p95)
- WebSocket latency: <100ms
- Database query time: <50ms
- Frontend load time: <2s
- Uptime: >99.5%

### Business Metrics
- User registrations
- Daily active users
- BPM readings logged per day
- Alerts triggered (by severity)
- Doctor portal adoption
- Stroke risk assessments completed

---

## 🎓 Project Grading Advantages

### For Academic Projects
This implementation includes:

**✅ Modern Tech Stack:** React, TypeScript, Node.js, PostgreSQL  
**✅ Machine Learning:** Real stroke prediction model (not fake)  
**✅ Real-Time Features:** WebSocket implementation  
**✅ Database Design:** Proper normalization, indexing, relationships  
**✅ Security:** JWT, bcrypt, role-based access  
**✅ API Design:** RESTful + real-time hybrid  
**✅ Testing:** Unit + integration tests  
**✅ Documentation:** Comprehensive API docs  
**✅ Deployment:** Production-ready on cloud  
**✅ Scalability:** Designed for growth

**Advanced Features (Bonus Points):**
- AI/ML integration with real dataset
- Multi-role architecture (Patient/Doctor/Admin)
- Real-time monitoring dashboard
- Data analytics and visualization
- PDF report generation
- Email notification system

---

## ⚠️ Critical Limitations to Address

### 1. CSV Dataset Mismatch
**Problem:** Your CSV has stroke risk factors but NO heartbeat/BPM data  
**Solution:** Treat these as **separate but complementary features**
- Main app: Real-time BPM monitoring
- ML addition: Stroke risk assessment based on health profile
- Combined insight: "Your heart rate is stable (70 BPM), but your health profile shows moderate stroke risk (18%)"

### 2. Imbalanced Dataset
**Problem:** Only 1.8% stroke cases (783 out of 43,400)  
**Solutions:**
- Use SMOTE (Synthetic Minority Over-sampling)
- Apply class weights in model training
- Use precision-recall metrics instead of accuracy
- Consider ensemble methods (Random Forest, XGBoost)

### 3. Missing Data
**Problem:** BMI has null values, smoking_status has unknowns  
**Solutions:**
- Impute BMI using median/mean for age group
- Create "Unknown" category for smoking
- Use models that handle missing data (XGBoost)

### 4. No Real-Time Anomaly Detection
**Problem:** Can't detect abnormal heartbeat patterns (no training data)  
**Workaround:**
- Use simple threshold-based rules (< 50 or > 120 BPM)
- Collect real BPM data over time for future ML model
- Document this as "future enhancement"

---

## 🎯 Next Steps

### Immediate Actions (Today)
1. **Confirm architecture:** Neon + Prisma + Express + React
2. **Set up Neon account:** Get connection string
3. **Initialize project:** Create monorepo structure
4. **Design frontend mockups:** Use frontend-design skill for unique UI

### This Week
1. **Build MVP authentication:** Registration + login
2. **Database setup:** Prisma schema + migrations
3. **Basic BPM recording:** Manual entry form
4. **Start ML model training:** Stroke risk prediction

### Recommended First Implementation
Start with **Phase 1 (Foundation)** - I can build:
1. Complete project structure (monorepo)
2. Prisma schema + Neon setup
3. Express API with auth endpoints
4. React frontend with beautiful login/dashboard (using frontend-design skill)
5. Basic BPM recording functionality

**Ready to start building?** Say "yes" and I'll scaffold the entire project structure with production-ready code.

---

## 📚 Additional Resources

### Documentation to Create
- API reference (OpenAPI/Swagger)
- User manual (Patient/Doctor/Admin guides)
- Deployment guide
- Database migration guide
- ML model documentation

### Learning Resources
- Prisma docs: https://www.prisma.io/docs
- Neon docs: https://neon.tech/docs
- Socket.io guide: https://socket.io/docs/v4/
- React + TypeScript: https://react-typescript-cheatsheet.netlify.app/

---

**Analysis Complete.** Ready to build when you are. 🚀
