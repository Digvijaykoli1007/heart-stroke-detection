from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

model = joblib.load("model.pkl")

class PatientData(BaseModel):
    heartRate: float
    spo2: float
    gender: str          # "Male" or "Female"
    age: int
    hypertension: int    # 0 or 1
    heart_disease: int   # 0 or 1
    weight: float        # kg
    height: float        # cm

@app.post("/predict")
def predict(data: PatientData):
    try:
        # Convert "Male/Female" to 1/0 for the model
        gender_val = 1 if data.gender == "Male" else 0

        # Create a DataFrame with the EXACT names and order used in training
        features_df = pd.DataFrame([{
            "gender": gender_val,
            "age": float(data.age),
            "hypertension": data.hypertension,
            "heart_disease": data.heart_disease,
            "spo2": data.spo2,
            "heart_rate": data.heartRate,
            "weight": data.weight,
            "height": data.height
        }])

        prediction = model.predict_proba(features_df)[0][1]
        return {"stroke_risk": round(prediction * 100, 2)}

    except Exception as e:
        return {"error": str(e)}