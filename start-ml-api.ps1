# Start ML Prediction API Server
# This runs the Flask API on port 5001

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host "🧠 Starting Stroke Prediction ML API" -ForegroundColor Cyan
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host ""

Set-Location "f:\dig\ml"

# Check if model exists
if (-not (Test-Path "models/stroke_model.pkl")) {
    Write-Host "❌ Model not found! Please run training first:" -ForegroundColor Red
    Write-Host "   python train_stroke_model.py" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "✅ Model files found" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting Flask server on port 5001..." -ForegroundColor Yellow
Write-Host ""

python stroke_api.py
