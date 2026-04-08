"""
CardioMonitor+ Stroke Prediction API
Flask REST API for Real-Time Stroke Risk Assessment
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
import json
from datetime import datetime

app = Flask(__name__)

# CORS Configuration - Allow frontend origins
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Paths
MODEL_DIR = Path(__file__).parent / 'models'
MODEL_PATH = MODEL_DIR / 'stroke_model.pkl'
PREPROCESSOR_PATH = MODEL_DIR / 'preprocessor.pkl'
FEATURE_NAMES_PATH = MODEL_DIR / 'feature_names.pkl'
METADATA_PATH = MODEL_DIR / 'model_metadata.json'

# Global variables for loaded models
model = None
preprocessor = None
feature_names = None
metadata = None

def load_models():
    """Load ML model and preprocessing pipeline"""
    global model, preprocessor, feature_names, metadata
    
    try:
        print("=" * 60)
        print("🫀 Loading CardioMonitor+ Stroke Prediction Model...")
        print("=" * 60)
        
        # Load model
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        print(f"✓ Model loaded: {MODEL_PATH}")
        
        # Load preprocessor
        with open(PREPROCESSOR_PATH, 'rb') as f:
            preprocessor = pickle.load(f)
        print(f"✓ Preprocessor loaded: {PREPROCESSOR_PATH}")
        
        # Load feature names
        with open(FEATURE_NAMES_PATH, 'rb') as f:
            feature_names = pickle.load(f)
        print(f"✓ Feature names loaded: {len(feature_names)} features")
        
        # Load metadata
        with open(METADATA_PATH, 'r') as f:
            metadata = json.load(f)
        print(f"✓ Metadata loaded")
        print(f"  - Model: {metadata['model_type']}")
        print(f"  - Accuracy: {metadata['accuracy']:.4f}")
        print(f"  - Recall: {metadata['recall']:.4f}")
        print(f"  - ROC-AUC: {metadata['roc_auc']:.4f}")
        print(f"  - Trained: {metadata['trained_at']}")
        print("=" * 60)
        print("✅ Model loading complete!")
        print("=" * 60)
        
    except FileNotFoundError as e:
        print(f"\n❌ ERROR: Model files not found!")
        print(f"Please run 'python ml/train_stroke_model.py' first to train the model.")
        print(f"Missing file: {e.filename}")
        raise
    except Exception as e:
        print(f"\n❌ ERROR loading models: {e}")
        raise

def get_risk_level(probability):
    """Convert probability to risk level"""
    if probability < 0.3:
        return "Low", "green"
    elif probability < 0.5:
        return "Moderate", "yellow"
    elif probability < 0.7:
        return "High", "orange"
    else:
        return "Very High", "red"

def get_recommendations(prediction, probability, input_data):
    """Generate personalized health recommendations"""
    recommendations = []
    
    if prediction == 1 or probability > 0.3:
        recommendations.append({
            "priority": "high",
            "icon": "🏥",
            "title": "Consult Healthcare Provider",
            "description": "Schedule an appointment with your doctor for comprehensive stroke risk assessment."
        })
    
    # Age-based
    if input_data.get('age', 0) > 55:
        recommendations.append({
            "priority": "medium",
            "icon": "🩺",
            "title": "Regular Health Screenings",
            "description": "Annual cardiovascular check-ups recommended for adults over 55."
        })
    
    # Hypertension
    if input_data.get('hypertension', 0) == 1:
        recommendations.append({
            "priority": "high",
            "icon": "💊",
            "title": "Blood Pressure Management",
            "description": "Monitor blood pressure daily. Take medications as prescribed. Reduce sodium intake."
        })
    
    # Heart disease
    if input_data.get('heart_disease', 0) == 1:
        recommendations.append({
            "priority": "high",
            "icon": "❤️",
            "title": "Cardiac Care",
            "description": "Follow cardiologist recommendations. Consider cardiac rehabilitation programs."
        })
    
    # High glucose
    if input_data.get('avg_glucose_level', 0) > 125:
        recommendations.append({
            "priority": "high",
            "icon": "🍎",
            "title": "Glucose Management",
            "description": "Monitor blood sugar levels. Consult with endocrinologist. Maintain healthy diet."
        })
    
    # BMI
    bmi = input_data.get('bmi', 0)
    if bmi > 30:
        recommendations.append({
            "priority": "medium",
            "icon": "🏃",
            "title": "Weight Management",
            "description": "Aim for gradual weight loss through balanced diet and regular exercise."
        })
    elif bmi < 18.5:
        recommendations.append({
            "priority": "medium",
            "icon": "🥗",
            "title": "Nutrition Support",
            "description": "Consult nutritionist for healthy weight gain strategies."
        })
    
    # Smoking
    if input_data.get('smoking_status') in ['smokes', 'formerly smoked']:
        recommendations.append({
            "priority": "high",
            "icon": "🚭",
            "title": "Smoking Cessation",
            "description": "Join smoking cessation programs. Consider nicotine replacement therapy."
        })
    
    # General lifestyle
    recommendations.append({
        "priority": "low",
        "icon": "🧘",
        "title": "Lifestyle Modifications",
        "description": "30 min exercise daily, Mediterranean diet, stress management, adequate sleep (7-9 hrs)."
    })
    
    return recommendations

# API Routes

@app.route('/')
def home():
    """API Home"""
    return jsonify({
        "service": "CardioMonitor+ Stroke Prediction API",
        "version": "1.0.0",
        "status": "active",
        "model_loaded": model is not None,
        "endpoints": {
            "/api/health": "Health check",
            "/api/model-info": "Model metadata",
            "/api/predict": "Stroke risk prediction (POST)"
        }
    })

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": model is not None,
        "preprocessor_loaded": preprocessor is not None
    })

@app.route('/api/model-info')
def model_info():
    """Get model metadata"""
    if metadata is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    return jsonify({
        "metadata": metadata,
        "feature_count": len(feature_names) if feature_names else 0,
        "status": "ready"
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict stroke risk"""
    try:
        # Check if model is loaded
        if model is None or preprocessor is None:
            return jsonify({
                "error": "Model not loaded. Please train the model first."
            }), 500
        
        # Get input data
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No input data provided"}), 400
        
        # Required fields
        required_fields = [
            'gender', 'age', 'hypertension', 'heart_disease', 
            'ever_married', 'work_type', 'Residence_type', 
            'avg_glucose_level', 'bmi', 'smoking_status'
        ]
        
        # Validate required fields
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400
        
        # Create DataFrame with exact column order
        input_df = pd.DataFrame([{
            'gender': data['gender'],
            'age': float(data['age']),
            'hypertension': int(data['hypertension']),
            'heart_disease': int(data['heart_disease']),
            'ever_married': data['ever_married'],
            'work_type': data['work_type'],
            'Residence_type': data['Residence_type'],
            'avg_glucose_level': float(data['avg_glucose_level']),
            'bmi': float(data['bmi']),
            'smoking_status': data['smoking_status']
        }])
        
        # Preprocess input
        X_processed = preprocessor.transform(input_df)
        
        # Make prediction
        prediction = int(model.predict(X_processed)[0])
        probabilities = model.predict_proba(X_processed)[0]
        probability = float(probabilities[1])  # Probability of stroke
        confidence = float(max(probabilities))
        
        # Get risk level
        risk_level, risk_color = get_risk_level(probability)
        
        # Generate recommendations
        recommendations = get_recommendations(prediction, probability, data)
        
        # Prepare response
        response = {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "input": data,
            "prediction": {
                "stroke_risk": prediction,
                "probability": round(probability * 100, 2),
                "confidence": round(confidence * 100, 2),
                "risk_level": risk_level,
                "risk_color": risk_color,
                "interpretation": "High risk of stroke" if prediction == 1 else "Low risk of stroke"
            },
            "recommendations": recommendations,
            "model_info": {
                "accuracy": round(metadata['accuracy'] * 100, 2),
                "recall": round(metadata['recall'] * 100, 2),
                "roc_auc": round(metadata['roc_auc'], 3)
            }
        }
        
        return jsonify(response)
        
    except ValueError as e:
        return jsonify({
            "error": f"Invalid input data: {str(e)}"
        }), 400
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return jsonify({
            "error": f"Prediction failed: {str(e)}"
        }), 500

@app.route('/api/batch-predict', methods=['POST'])
def batch_predict():
    """Predict stroke risk for multiple patients"""
    try:
        # Check if model is loaded
        if model is None or preprocessor is None:
            return jsonify({
                "error": "Model not loaded. Please train the model first."
            }), 500
        
        # Get input data
        data = request.get_json()
        
        if not data or 'patients' not in data:
            return jsonify({"error": "No patient data provided"}), 400
        
        patients = data['patients']
        results = []
        
        for idx, patient_data in enumerate(patients):
            try:
                # Create DataFrame
                input_df = pd.DataFrame([patient_data])
                
                # Preprocess and predict
                X_processed = preprocessor.transform(input_df)
                prediction = int(model.predict(X_processed)[0])
                probability = float(model.predict_proba(X_processed)[0][1])
                risk_level, risk_color = get_risk_level(probability)
                
                results.append({
                    "patient_id": patient_data.get('id', idx),
                    "prediction": prediction,
                    "probability": round(probability * 100, 2),
                    "risk_level": risk_level,
                    "risk_color": risk_color
                })
                
            except Exception as e:
                results.append({
                    "patient_id": patient_data.get('id', idx),
                    "error": str(e)
                })
        
        return jsonify({
            "success": True,
            "total": len(patients),
            "results": results
        })
        
    except Exception as e:
        print(f"❌ Batch prediction error: {e}")
        return jsonify({
            "error": f"Batch prediction failed: {str(e)}"
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Load models on startup
    load_models()
    
    # Start Flask server
    PORT = 5001
    print(f"\n🚀 Starting Stroke Prediction API on port {PORT}...")
    print(f"📊 API Endpoints:")
    print(f"   - http://localhost:{PORT}/")
    print(f"   - http://localhost:{PORT}/api/health")
    print(f"   - http://localhost:{PORT}/api/model-info")
    print(f"   - http://localhost:{PORT}/api/predict (POST)")
    print(f"   - http://localhost:{PORT}/api/batch-predict (POST)")
    print("\n✅ Ready to serve predictions!\n")
    
    app.run(host='0.0.0.0', port=PORT, debug=False)
