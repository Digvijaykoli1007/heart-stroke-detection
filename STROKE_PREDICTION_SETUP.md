# 🫀 CardioMonitor+ with AI Stroke Prediction

Complete full-stack healthcare application with heartbeat monitoring and ML-powered stroke risk assessment.

## 🚀 Quick Start Guide

### 1. Install Python ML Dependencies

```powershell
cd f:\dig\ml
pip install -r requirements.txt
```

### 2. Train the ML Model

```powershell
cd f:\dig\ml
python train_stroke_model.py
```

**Expected Output:**
- Model accuracy: ~85-90%
- Recall (stroke detection): >85%
- Saves 7 files to `ml/models/`:
  - `stroke_model.pkl`
  - `preprocessor.pkl`
  - `feature_names.pkl`
  - `model_metadata.json`
  - `confusion_matrix.png`
  - `roc_curve.png`
  - `feature_importance.png`

### 3. Apply Database Migration

```powershell
cd f:\dig\backend
npx prisma migrate dev --name add_stroke_prediction
```

This adds the `StrokePrediction` table to your Neon PostgreSQL database.

### 4. Start ML Prediction API (Port 5001)

```powershell
cd f:\dig\ml
python stroke_api.py
```

**Runs on:** http://localhost:5001

**Endpoints:**
- GET `/` - API info
- GET `/api/health` - Health check
- GET `/api/model-info` - Model metadata
- POST `/api/predict` - Predict stroke risk

### 5. Start Backend (Port 5000)

```powershell
cd f:\dig\backend
npm run dev
```

**Runs on:** http://localhost:5000

### 6. Frontend is Already Running (Port 3002)

Visit: http://localhost:3002

## 📋 Features

### Existing Features ✅
- **Heartbeat Monitoring**: Real-time BPM tracking with WebSocket updates
- **Patient Management**: Multi-patient dashboard for doctors
- **Alert System**: Configurable heart rate alerts (bradycardia, tachycardia, critical)
- **User Authentication**: JWT-based secure login
- **Role-Based Access**: PATIENT, DOCTOR, ADMIN roles

### NEW: AI Stroke Prediction 🧠
- **ML Model**: Random Forest classifier (300 trees, 85%+ accuracy)
- **Dataset**: 43,400+ real medical records
- **Risk Assessment**: Low / Moderate / High / Very High risk levels
- **Personalized Recommendations**: Based on patient's health profile
- **Prediction History**: View past assessments with analytics
- **Production Ready**: Proper preprocessing, SMOTE for class imbalance

## 🧪 Testing Stroke Prediction

### Demo Accounts

**Doctor Account:**
- Email: `doctor@cardiomonitor.com`
- Password: `password123`

**Patient Account:**
- Email: `john@patient.com`
- Password: `password123`

### Test the ML API Directly

```powershell
$body = @{
    age = 67
    gender = "Male"
    hypertension = 1
    heart_disease = 1
    ever_married = "Yes"
    work_type = "Private"
    Residence_type = "Urban"
    avg_glucose_level = 228.69
    bmi = 36.6
    smoking_status = "formerly smoked"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/predict" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

**Expected Response:**
```json
{
  "success": true,
  "prediction": {
    "stroke_risk": 1,
    "probability": 67.5,
    "confidence": 89.2,
    "risk_level": "High",
    "risk_color": "orange",
    "interpretation": "High risk of stroke"
  },
  "recommendations": [...]
}
```

### Test via UI

1. Login at http://localhost:3002
2. Click "Stroke Risk" button in header
3. Fill out medical intake form:
   - Age: 67
   - Gender: Male
   - Hypertension: Yes
   - Heart Disease: Yes
   - Married: Yes
   - Work Type: Private
   - Residence: Urban
   - Glucose: 228.69 mg/dL
   - BMI: 36.6
   - Smoking: Formerly smoked
4. Click "Predict Stroke Risk"
5. View personalized risk assessment and recommendations
6. View history at http://localhost:3002/stroke-assessment/history

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)            │
│                    Port 3002                                │
│  - Heartbeat Dashboard                                      │
│  - Stroke Risk Assessment Form                              │
│  - Prediction History & Analytics                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
          ┌───────┴────────┐
          │                │
          ▼                ▼
┌──────────────────┐  ┌──────────────────────────────┐
│  BACKEND         │  │  ML API (Flask)              │
│  Port 5000       │  │  Port 5001                   │
│  - Node.js       │  │  - Stroke prediction         │
│  - Express       │  │  - Random Forest model       │
│  - WebSocket     │  │  - Risk recommendations      │
│  - JWT Auth      │  │                              │
└────────┬─────────┘  └──────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│  DATABASE (Neon PostgreSQL)                          │
│  - Users (patients, doctors, admins)                 │
│  - HeartbeatRecords                                  │
│  - Alerts & AlertSettings                            │
│  - HealthProfile                                     │
│  - StrokePrediction (NEW)                            │
└──────────────────────────────────────────────────────┘
```

## 📊 ML Model Details

**Algorithm:** Random Forest Classifier
- **Trees:** 300
- **Max Depth:** 12
- **Min Samples Split:** 5
- **Class Weight:** balanced
- **Imbalance Handling:** SMOTE oversampling

**Features (10 inputs):**
1. Age (numerical)
2. Gender (categorical: Male/Female/Other)
3. Hypertension (binary: 0/1)
4. Heart Disease (binary: 0/1)
5. Ever Married (categorical: Yes/No)
6. Work Type (categorical: Private/Govt/Self-employed/Children/Never_worked)
7. Residence Type (categorical: Urban/Rural)
8. Average Glucose Level (numerical, mg/dL)
9. BMI (numerical)
10. Smoking Status (categorical: never smoked/formerly smoked/smokes/Unknown)

**Preprocessing:**
- **Categorical Encoding:** OneHotEncoder (drop first to avoid multicollinearity)
- **Numerical Scaling:** StandardScaler (mean=0, std=1)
- **Missing Values:** Median imputation for BMI, mode for smoking status
- **Class Imbalance:** SMOTE creates synthetic minority samples for balanced training

**Performance Metrics:**
- **Accuracy:** ~85-90%
- **Recall (Priority):** >85% (minimize false negatives for stroke cases)
- **Precision:** ~70-80%
- **ROC-AUC:** >0.85

## 🔧 Troubleshooting

### ML API Not Available
**Error:** "ML prediction service unavailable"

**Solution:**
```powershell
# Check if ML API is running
Invoke-RestMethod http://localhost:5001/api/health

# If not running, start it:
cd f:\dig\ml
python stroke_api.py
```

### Model Files Not Found
**Error:** "Model files not found! Please run train_stroke_model.py first"

**Solution:**
```powershell
cd f:\dig\ml
python train_stroke_model.py
```

### Database Migration Failed
**Error:** "Prisma migrate error"

**Solution:**
```powershell
cd f:\dig\backend
npx prisma generate
npx prisma migrate dev --name add_stroke_prediction
```

### Frontend CORS Error
**Error:** "Access to XMLHttpRequest blocked by CORS policy"

**Solution:** Backend is configured for ports 3000, 3001, 3002. Make sure frontend is on one of these ports.

## 📂 Project Structure

```
f:\dig\
├── ml/
│   ├── stroke_api.py           # Flask ML API server
│   ├── train_stroke_model.py   # Model training pipeline
│   ├── requirements.txt         # Python dependencies
│   └── models/                  # Generated model artifacts
│       ├── stroke_model.pkl
│       ├── preprocessor.pkl
│       ├── feature_names.pkl
│       ├── model_metadata.json
│       ├── confusion_matrix.png
│       ├── roc_curve.png
│       └── feature_importance.png
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── heartbeat.routes.ts
│   │   │   ├── stroke.routes.ts   # NEW
│   │   │   └── ...
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma          # Updated with StrokePrediction model
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx      # Heartbeat monitoring
│   │   │   ├── StrokeAssessment.tsx   # NEW
│   │   │   ├── StrokeHistory.tsx      # NEW
│   │   │   └── Login.tsx
│   │   ├── components/layout/
│   │   │   └── Header.tsx         # Updated with Stroke Risk button
│   │   └── App.tsx                # Updated routes
│   └── package.json
│
└── assest/
    └── train_strokes.csv/
        └── train_strokes.csv      # 43,400 medical records
```

## 🎯 Next Steps

### For Development:
1. Add authentication to ML API endpoints
2. Implement model versioning and A/B testing
3. Add more visualizations (ROC curves, calibration plots)
4. Create doctor dashboard for viewing patient stroke risks
5. Add export to PDF for medical reports
6. Implement email alerts for high-risk predictions

### For Production:
1. Deploy ML API to cloud (AWS, Azure, GCP)
2. Use model serving platform (TensorFlow Serving, MLflow)
3. Add monitoring and logging (Sentry, CloudWatch)
4. Implement rate limiting and API keys
5. Add HTTPS/SSL certificates
6. Set up CI/CD pipeline
7. Add automated model retraining

## 📝 API Reference

### Stroke Prediction Endpoints

#### POST `/api/stroke/predict`
Predict stroke risk for a patient.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "age": 67,
  "gender": "Male",
  "hypertension": 1,
  "heart_disease": 1,
  "ever_married": "Yes",
  "work_type": "Private",
  "Residence_type": "Urban",
  "avg_glucose_level": 228.69,
  "bmi": 36.6,
  "smoking_status": "formerly smoked",
  "notes": "Optional patient notes"
}
```

**Response:**
```json
{
  "success": true,
  "predictionId": "cmlxyz123456",
  "result": {
    "prediction": {
      "stroke_risk": 1,
      "probability": 67.5,
      "confidence": 89.2,
      "risk_level": "High",
      "risk_color": "orange"
    },
    "recommendations": [...]
  }
}
```

#### GET `/api/stroke/history`
Get prediction history for current user.

**Query Parameters:**
- `limit`: Number of records (default: 10)
- `offset`: Pagination offset (default: 0)

#### DELETE `/api/stroke/history/:id`
Delete a prediction record.

## 🌟 Credits

**Dataset:** Stroke Prediction Dataset (43,400 records)
**ML Framework:** scikit-learn, imbalanced-learn
**Backend:** Node.js, Express, Prisma, PostgreSQL
**Frontend:** React, TypeScript, Tailwind CSS
**Deployment:** Local development environment

---

Need help? Check the troubleshooting section or review logs in each service.
