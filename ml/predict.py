"""
Flask ML Inference API for Stroke Risk Prediction
Run: python predict.py
API endpoint: POST http://localhost:5001/predict
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Load model
MODEL_DIR = './models'
try:
    model = joblib.load(f'{MODEL_DIR}/stroke_model.pkl')
    scaler = joblib.load(f'{MODEL_DIR}/scaler.pkl')
    label_encoders = joblib.load(f'{MODEL_DIR}/label_encoders.pkl')
    feature_names = joblib.load(f'{MODEL_DIR}/features.pkl')
    print("✓ Model loaded successfully")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    print("Run train.py first to create the model")
    model = None

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'OK',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.json
        
        # Map input data to feature vector
        smoking_map = {
            'never': 0,
            'formerly': 1,
            'current': 2,
            'unknown': 3
        }
        
        gender_map = {
            'Male': 1,
            'Female': 0,
            'Other': 2
        }
        
        # Build feature vector
        features = []
        feature_values = {
            'age': data.get('age', 50),
            'gender': gender_map.get(data.get('gender', 'Male'), 1),
            'hypertension': int(data.get('hypertension', False)),
            'heart_disease': int(data.get('heartDisease', False)),
            'avg_glucose_level': data.get('avgGlucoseLevel', 100.0),
            'bmi': data.get('bmi', 25.0),
            'smoking_status': smoking_map.get(data.get('smokingStatus', 'never'), 0)
        }
        
        # Build array in correct order
        for feat in feature_names:
            features.append(feature_values[feat])
        
        # Scale features
        features_scaled = scaler.transform([features])
        
        # Predict
        prediction_proba = model.predict_proba(features_scaled)[0]
        risk_score = float(prediction_proba[1])  # Probability of stroke
        
        # Determine risk level
        if risk_score < 0.15:
            risk_level = 'low'
            recommendation = 'Maintain healthy lifestyle habits. Regular check-ups recommended.'
        elif risk_score < 0.35:
            risk_level = 'moderate'
            recommendation = 'Monitor cardiovascular health closely. Consider lifestyle modifications.'
        elif risk_score < 0.60:
            risk_level = 'high'
            recommendation = 'Consult with a cardiologist. Lifestyle changes and medication may be needed.'
        else:
            risk_level = 'very-high'
            recommendation = 'Immediate medical attention recommended. High stroke risk detected.'
        
        # Identify contributing factors
        factors = []
        if data.get('age', 0) > 65:
            factors.append(f"Age over 65 ({data.get('age')} years)")
        if data.get('hypertension'):
            factors.append('Hypertension present')
        if data.get('heartDisease'):
            factors.append('Heart disease present')
        if data.get('bmi', 0) > 30:
            factors.append(f"High BMI ({data.get('bmi')})")
        if data.get('avgGlucoseLevel', 0) > 140:
            factors.append(f"Elevated glucose ({data.get('avgGlucoseLevel')} mg/dL)")
        if data.get('smokingStatus') == 'current':
            factors.append('Current smoker')
        
        if not factors:
            factors.append('No major risk factors detected')
        
        return jsonify({
            'riskScore': round(risk_score, 3),
            'riskLevel': risk_level,
            'recommendation': recommendation,
            'factors': factors
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    print("\n🚀 ML Inference API Server")
    print("=" * 50)
    print("Endpoint: POST http://localhost:5001/predict")
    print("\nExample request:")
    print('''{
  "age": 67,
  "gender": "Male",
  "hypertension": true,
  "heartDisease": false,
  "bmi": 28.5,
  "avgGlucoseLevel": 105,
  "smokingStatus": "formerly"
}''')
    print("\n" + "=" * 50 + "\n")
    app.run(host='0.0.0.0', port=5001, debug=True)
