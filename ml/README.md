# Stroke Risk Prediction ML Module

Train and deploy machine learning model for stroke risk assessment.

## Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Train the model:**
   ```bash
   python train.py
   ```
   This will:
   - Load the stroke dataset (43,400 records)
   - Handle imbalanced data with SMOTE
   - Train Random Forest classifier
   - Save model to `models/` directory

3. **Start ML API server:**
   ```bash
   python predict.py
   ```
   API will run on `http://localhost:5001`

## API Usage

**Endpoint:** `POST http://localhost:5001/predict`

**Request Body:**
```json
{
  "age": 67,
  "gender": "Male",
  "hypertension": true,
  "heartDisease": false,
  "bmi": 28.5,
  "avgGlucoseLevel": 105,
  "smokingStatus": "formerly"
}
```

**Response:**
```json
{
  "riskScore": 0.342,
  "riskLevel": "moderate",
  "recommendation": "Monitor cardiovascular health closely...",
  "factors": [
    "Age over 65 (67 years)",
    "Hypertension present"
  ]
}
```

## Model Details

- **Algorithm:** Random Forest (200 trees)
- **Features:** age, gender, hypertension, heart_disease, bmi, avg_glucose_level, smoking_status
- **Balancing:** SMOTE oversampling
- **Evaluation:** ROC-AUC score, classification report

## Integration

Backend (`backend/src/services/ml.service.ts`) calls this API. Set environment variable:

```
ML_API_URL=http://localhost:5001
```

Falls back to rule-based prediction if ML API is unavailable.
