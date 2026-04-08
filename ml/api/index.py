"""
CardioMonitor+ Stroke Prediction API - Vercel Serverless Function
Optimized for Vercel Python Runtime
"""

from flask import Flask, request, jsonify
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
import json
from datetime import datetime
import os

app = Flask(__name__)

# Paths - Vercel compatible
BASE_DIR = Path(__file__).parent.parent
MODEL_DIR = BASE_DIR / 'models'
MODEL_PATH = MODEL_DIR / 'stroke_model.pkl'
PREPROCESSOR_PATH = MODEL_DIR / 'preprocessor.pkl'
FEATURE_NAMES_PATH = MODEL_DIR / 'feature_names.pkl'

# Load models (cached at cold start)
try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    with open(PREPROCESSOR_PATH, 'rb') as f:
        preprocessor = pickle.load(f)
    with open(FEATURE_NAMES_PATH, 'rb') as f:
        feature_names = pickle.load(f)
    MODEL_LOADED = True
except Exception as e:
    print(f"Warning: Could not load ML model: {e}")
    MODEL_LOADED = False
    model = None
    preprocessor = None
    feature_names = None

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'CardioMonitor+ ML API',
        'model_loaded': MODEL_LOADED,
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/predict', methods=['POST'])
def predict_stroke_risk():
    """Predict stroke risk from patient data"""
    try:
        if not MODEL_LOADED:
            return jsonify({
                'success': False,
                'error': 'ML model not loaded'
            }), 500

        data = request.get_json()
        
        # Extract and validate features
        required_fields = ['age', 'hypertension', 'heart_disease', 'avg_glucose_level', 'bmi']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Prepare input data
        input_data = pd.DataFrame([{
            'age': float(data['age']),
            'hypertension': int(data['hypertension']),
            'heart_disease': int(data['heart_disease']),
            'avg_glucose_level': float(data['avg_glucose_level']),
            'bmi': float(data['bmi']),
            'gender': data.get('gender', 'Other'),
            'ever_married': data.get('ever_married', 'No'),
            'work_type': data.get('work_type', 'Private'),
            'Residence_type': data.get('Residence_type', 'Urban'),
            'smoking_status': data.get('smoking_status', 'Unknown')
        }])
        
        # Preprocess and predict
        X_processed = preprocessor.transform(input_data)
        prediction = model.predict(X_processed)[0]
        probability = model.predict_proba(X_processed)[0]
        
        # Calculate risk level
        risk_score = float(probability[1] * 100)
        if risk_score < 20:
            risk_level = 'low'
        elif risk_score < 50:
            risk_level = 'moderate'
        else:
            risk_level = 'high'
        
        return jsonify({
            'success': True,
            'prediction': int(prediction),
            'risk_score': round(risk_score, 2),
            'risk_level': risk_level,
            'confidence': round(float(max(probability)), 4),
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Vercel serverless handler
def handler(request):
    """Vercel serverless function handler"""
    with app.app_context():
        return app.full_dispatch_request()

# For local testing
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
