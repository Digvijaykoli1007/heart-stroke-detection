"""
CardioMonitor+ Stroke Prediction Model Training Pipeline
Production-Ready ML System with Random Forest Classifier
"""

import pandas as pd
import numpy as np
import pickle
import json
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, roc_curve, confusion_matrix, classification_report
)
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from imblearn.over_sampling import SMOTE
import matplotlib.pyplot as plt
import seaborn as sns

# Configuration
DATA_PATH = Path(__file__).parent.parent / 'assest' / 'train_strokes.csv' / 'train_strokes.csv'
MODEL_DIR = Path(__file__).parent / 'models'
MODEL_DIR.mkdir(exist_ok=True)

print("=" * 60)
print("🫀 CardioMonitor+ Stroke Prediction Training Pipeline")
print("=" * 60)

# Step 1: Load Dataset
print("\n📊 Step 1: Loading Dataset...")
df = pd.read_csv(DATA_PATH)
print(f"✓ Loaded {len(df):,} records")
print(f"✓ Columns: {list(df.columns)}")
print(f"\nDataset Info:")
print(df.info())

# Step 2: Data Cleaning
print("\n🧹 Step 2: Data Cleaning...")

# Remove ID column
if 'id' in df.columns:
    df = df.drop('id', axis=1)
    print("✓ Removed ID column")

# Check duplicates
duplicates = df.duplicated().sum()
if duplicates > 0:
    df = df.drop_duplicates()
    print(f"✓ Removed {duplicates} duplicate rows")

# Handle missing values
print("\nMissing values before cleaning:")
print(df.isnull().sum())

# BMI → Median
if df['bmi'].isnull().sum() > 0:
    median_bmi = df['bmi'].median()
    df['bmi'] = df['bmi'].fillna(median_bmi)
    print(f"✓ Filled BMI with median: {median_bmi:.2f}")

# smoking_status → Mode
if df['smoking_status'].isnull().sum() > 0:
    mode_smoking = df['smoking_status'].mode()[0]
    df['smoking_status'] = df['smoking_status'].fillna(mode_smoking)
    print(f"✓ Filled smoking_status with mode: {mode_smoking}")

print(f"\n✓ Final dataset size: {len(df):,} rows, {len(df.columns)} columns")

# Step 3: Feature Engineering
print("\n⚙️ Step 3: Feature Engineering...")

# Separate features and target
X = df.drop('stroke', axis=1)
y = df['stroke']

print(f"✓ Features shape: {X.shape}")
print(f"✓ Target distribution:")
print(y.value_counts())
print(f"  - No Stroke (0): {(y == 0).sum():,} ({(y == 0).sum() / len(y) * 100:.2f}%)")
print(f"  - Stroke (1): {(y == 1).sum():,} ({(y == 1).sum() / len(y) * 100:.2f}%)")

# Identify categorical and numerical columns
categorical_cols = ['gender', 'ever_married', 'work_type', 'Residence_type', 'smoking_status']
numerical_cols = ['age', 'hypertension', 'heart_disease', 'avg_glucose_level', 'bmi']

print(f"\n✓ Categorical features: {categorical_cols}")
print(f"✓ Numerical features: {numerical_cols}")

# Step 4: Create Preprocessing Pipeline
print("\n🔧 Step 4: Building Preprocessing Pipeline...")

# Create ColumnTransformer
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numerical_cols),
        ('cat', OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore'), categorical_cols)
    ],
    remainder='passthrough'
)

# Fit and transform
X_processed = preprocessor.fit_transform(X)

# Get feature names after one-hot encoding
cat_features = preprocessor.named_transformers_['cat'].get_feature_names_out(categorical_cols)
all_feature_names = numerical_cols + list(cat_features)
print(f"✓ Total features after encoding: {len(all_feature_names)}")

# Save feature names for later use
with open(MODEL_DIR / 'feature_names.pkl', 'wb') as f:
    pickle.dump(all_feature_names, f)
print(f"✓ Saved feature names to {MODEL_DIR / 'feature_names.pkl'}")

# Step 5: Train-Test Split
print("\n✂️ Step 5: Splitting Data...")
X_train, X_test, y_train, y_test = train_test_split(
    X_processed, y, test_size=0.2, random_state=42, stratify=y
)
print(f"✓ Train set: {X_train.shape[0]:,} samples")
print(f"✓ Test set: {X_test.shape[0]:,} samples")

# Step 6: Handle Class Imbalance with SMOTE
print("\n⚖️ Step 6: Handling Class Imbalance...")
print(f"Before SMOTE - Class distribution:")
print(f"  No Stroke: {(y_train == 0).sum():,}")
print(f"  Stroke: {(y_train == 1).sum():,}")

smote = SMOTE(random_state=42)
X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)

print(f"\nAfter SMOTE - Class distribution:")
print(f"  No Stroke: {(y_train_balanced == 0).sum():,}")
print(f"  Stroke: {(y_train_balanced == 1).sum():,}")
print(f"✓ Using SMOTE for balanced training")

# Step 7: Train Random Forest Model
print("\n🌲 Step 7: Training Random Forest Classifier...")
print("Model Parameters:")
print("  - n_estimators: 300")
print("  - max_depth: 12")
print("  - min_samples_split: 5")
print("  - class_weight: balanced")
print("  - random_state: 42")

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=12,
    min_samples_split=5,
    random_state=42,
    class_weight='balanced',
    n_jobs=-1,
    verbose=1
)

model.fit(X_train_balanced, y_train_balanced)
print("✓ Model training complete!")

# Step 8: Model Evaluation
print("\n📈 Step 8: Model Evaluation...")

# Predictions
y_pred = model.predict(X_test)
y_pred_proba = model.predict_proba(X_test)[:, 1]

# Calculate metrics
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, zero_division=0)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_pred_proba)

print("\n" + "=" * 60)
print("📊 MODEL PERFORMANCE METRICS")
print("=" * 60)
print(f"Accuracy:  {accuracy:.4f} ({accuracy * 100:.2f}%)")
print(f"Precision: {precision:.4f} ({precision * 100:.2f}%)")
print(f"Recall:    {recall:.4f} ({recall * 100:.2f}%) ⭐ PRIORITY")
print(f"F1 Score:  {f1:.4f}")
print(f"ROC-AUC:   {roc_auc:.4f}")
print("=" * 60)

# Classification Report
print("\n📋 Detailed Classification Report:")
print(classification_report(y_test, y_pred, target_names=['No Stroke', 'Stroke']))

# Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
print("\n🔢 Confusion Matrix:")
print(cm)
print(f"  True Negatives:  {cm[0, 0]:,}")
print(f"  False Positives: {cm[0, 1]:,}")
print(f"  False Negatives: {cm[1, 0]:,}")
print(f"  True Positives:  {cm[1, 1]:,}")

# Feature Importance
print("\n⭐ Top 10 Most Important Features:")
feature_importance = pd.DataFrame({
    'feature': all_feature_names,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False).head(10)
print(feature_importance.to_string(index=False))

# Step 9: Save Model Artifacts
print("\n💾 Step 9: Saving Model Artifacts...")

# Save preprocessor
with open(MODEL_DIR / 'preprocessor.pkl', 'wb') as f:
    pickle.dump(preprocessor, f)
print(f"✓ Saved preprocessor to {MODEL_DIR / 'preprocessor.pkl'}")

# Save model
with open(MODEL_DIR / 'stroke_model.pkl', 'wb') as f:
    pickle.dump(model, f)
print(f"✓ Saved model to {MODEL_DIR / 'stroke_model.pkl'}")

# Save metadata
metadata = {
    'model_type': 'RandomForestClassifier',
    'n_estimators': 300,
    'max_depth': 12,
    'training_samples': len(X_train_balanced),
    'test_samples': len(X_test),
    'accuracy': float(accuracy),
    'precision': float(precision),
    'recall': float(recall),
    'f1_score': float(f1),
    'roc_auc': float(roc_auc),
    'feature_count': len(all_feature_names),
    'categorical_features': categorical_cols,
    'numerical_features': numerical_cols,
    'class_balance_method': 'SMOTE',
    'trained_at': pd.Timestamp.now().isoformat()
}

with open(MODEL_DIR / 'model_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)
print(f"✓ Saved metadata to {MODEL_DIR / 'model_metadata.json'}")

# Visualizations
print("\n📊 Step 10: Generating Visualizations...")

# 1. Confusion Matrix Heatmap
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=['No Stroke', 'Stroke'],
            yticklabels=['No Stroke', 'Stroke'])
plt.title('Confusion Matrix')
plt.ylabel('Actual')
plt.xlabel('Predicted')
plt.tight_layout()
plt.savefig(MODEL_DIR / 'confusion_matrix.png', dpi=150)
print(f"✓ Saved confusion matrix plot")

# 2. ROC Curve
fpr, tpr, _ = roc_curve(y_test, y_pred_proba)
plt.figure(figsize=(8, 6))
plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (AUC = {roc_auc:.3f})')
plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('Receiver Operating Characteristic (ROC) Curve')
plt.legend(loc="lower right")
plt.grid(alpha=0.3)
plt.tight_layout()
plt.savefig(MODEL_DIR / 'roc_curve.png', dpi=150)
print(f"✓ Saved ROC curve plot")

# 3. Feature Importance
plt.figure(figsize=(10, 8))
top_20_features = pd.DataFrame({
    'feature': all_feature_names,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False).head(20)
plt.barh(range(len(top_20_features)), top_20_features['importance'].values)
plt.yticks(range(len(top_20_features)), top_20_features['feature'].values)
plt.xlabel('Importance')
plt.title('Top 20 Feature Importance')
plt.tight_layout()
plt.savefig(MODEL_DIR / 'feature_importance.png', dpi=150)
print(f"✓ Saved feature importance plot")

plt.close('all')

print("\n" + "=" * 60)
print("✅ TRAINING PIPELINE COMPLETE!")
print("=" * 60)
print(f"\n📁 Model artifacts saved to: {MODEL_DIR.absolute()}")
print("\nFiles created:")
print("  ✓ stroke_model.pkl")
print("  ✓ preprocessor.pkl")
print("  ✓ feature_names.pkl")
print("  ✓ model_metadata.json")
print("  ✓ confusion_matrix.png")
print("  ✓ roc_curve.png")
print("  ✓ feature_importance.png")
print("\n🚀 Model is ready for deployment!")
print("=" * 60)
