# Python ML Training Script for Stroke Risk Prediction
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from imblearn.over_sampling import SMOTE
import joblib
import os

# File paths
DATA_PATH = '../assest/train_strokes.csv/train_strokes.csv'
MODEL_DIR = './models'
os.makedirs(MODEL_DIR, exist_ok=True)

print("🧠 Stroke Risk Prediction Model Training")
print("=" * 50)

# 1. Load Data
print("\n📊 Loading dataset...")
df = pd.read_csv(DATA_PATH)
print(f"✓ Loaded {len(df)} records")
print(f"✓ Stroke rate: {df['stroke'].mean()*100:.2f}%")

# 2. Preprocessing
print("\n🔧 Preprocessing data...")

# Handle missing values
if 'bmi' in df.columns:
    df['bmi'].fillna(df['bmi'].median(), inplace=True)

# Encode categorical variables
label_encoders = {}
categorical_cols = ['gender', 'ever_married', 'work_type', 'Residence_type', 'smoking_status']

for col in categorical_cols:
    if col in df.columns:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le

# Select features (matching HealthProfile schema)
feature_columns = [
    'age',
    'gender',
    'hypertension',
    'heart_disease',
    'avg_glucose_level',
    'bmi',
    'smoking_status'
]

# Ensure all features exist
available_features = [col for col in feature_columns if col in df.columns]
X = df[available_features]
y = df['stroke']

print(f"✓ Features: {', '.join(available_features)}")
print(f"✓ Samples: {len(X)} | Features: {X.shape[1]}")

# 3. Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\n📈 Train set: {len(X_train)} | Test set: {len(X_test)}")

# 4. Handle imbalanced data with SMOTE
print("\n⚖️ Balancing dataset with SMOTE...")
print(f"Before SMOTE - Class 0: {(y_train == 0).sum()} | Class 1: {(y_train == 1).sum()}")

smote = SMOTE(random_state=42)
X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)

print(f"After SMOTE  - Class 0: {(y_train_balanced == 0).sum()} | Class 1: {(y_train_balanced == 1).sum()}")

# 5. Feature Scaling
print("\n📏 Scaling features...")
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train_balanced)
X_test_scaled = scaler.transform(X_test)

# 6. Train Model
print("\n🌲 Training Random Forest model...")
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1
)

model.fit(X_train_scaled, y_train_balanced)
print("✓ Model trained successfully")

# 7. Evaluate Model
print("\n📊 Model Evaluation:")
y_pred = model.predict(X_test_scaled)
y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]

print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['No Stroke', 'Stroke']))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

auc_score = roc_auc_score(y_test, y_pred_proba)
print(f"\nROC-AUC Score: {auc_score:.4f}")

# 8. Feature Importance
print("\n🔍 Feature Importance:")
feature_importance = pd.DataFrame({
    'feature': available_features,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)

for idx, row in feature_importance.iterrows():
    print(f"  {row['feature']:>20s}: {row['importance']:.4f}")

# 9. Save Model & Scaler
print("\n💾 Saving model...")
joblib.dump(model, f'{MODEL_DIR}/stroke_model.pkl')
joblib.dump(scaler, f'{MODEL_DIR}/scaler.pkl')
joblib.dump(label_encoders, f'{MODEL_DIR}/label_encoders.pkl')
joblib.dump(available_features, f'{MODEL_DIR}/features.pkl')

print(f"✓ Model saved to {MODEL_DIR}/")
print("\n✅ Training complete!\n")
