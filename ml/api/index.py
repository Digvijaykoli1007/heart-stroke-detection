import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path

app = Flask(__name__)
# Enable CORS for frontend deployment
CORS(app)

# Load the 8-feature vitals model
BASE_DIR = Path(__file__).parent.parent
MODEL_PATH = BASE_DIR / "model.pkl"

model = None
try:
    model = joblib.load(MODEL_PATH)
    print(f"Model loaded from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model: {e}")

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "online",
        "service": "CardioMonitor+ ML Prediction API",
        "model_loaded": model is not None
    })

@app.route("/predict", methods=["POST"])
@app.route("/api/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded on server"}), 500
        
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Convert "Male/Female" to 1/0 for the model
        gender_val = 1 if data.get("gender") == "Male" else 0

        # Create a DataFrame with the EXACT names and order used in training
        # This matches the structure in ml/ml_api.py which was verified to work
        features_df = pd.DataFrame([{
            "gender": gender_val,
            "age": float(data.get("age", 0)),
            "hypertension": int(data.get("hypertension", 0)),
            "heart_disease": int(data.get("heart_disease", 0)),
            "spo2": float(data.get("spo2", 0)),
            "heart_rate": float(data.get("heartRate", 0)), # Mapping heartRate to heart_rate
            "weight": float(data.get("weight", 0)),
            "height": float(data.get("height", 0))
        }])

        prediction_proba = model.predict_proba(features_df)[0][1]
        risk_percentage = round(float(prediction_proba) * 100, 2)

        return jsonify({
            "stroke_risk": risk_percentage,
            "status": "success"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Vercel Serverless Handler
def handler(request):
    with app.app_context():
        return app.full_dispatch_request()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
