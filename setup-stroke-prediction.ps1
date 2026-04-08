# CardioMonitor+ Stroke Prediction Setup Script
# Run this script to set up and deploy the ML system

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host "🫀 CardioMonitor+ Stroke Prediction Setup" -ForegroundColor Cyan
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host ""

# Step 1: Install Python dependencies
Write-Host "📦 Step 1: Installing Python ML dependencies..." -ForegroundColor Yellow
Set-Location "f:\dig\ml"
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Python dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Python dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Train ML Model
Write-Host "🧠 Step 2: Training Random Forest model..." -ForegroundColor Yellow
Write-Host "   This may take 2-5 minutes..." -ForegroundColor Gray
python train_stroke_model.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Model training failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Model training complete" -ForegroundColor Green
Write-Host ""

# Step 3: Apply database migration
Write-Host "🗄️  Step 3: Applying database migration..." -ForegroundColor Yellow
Set-Location "f:\dig\backend"
npx prisma generate
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Migration may have already been applied" -ForegroundColor Yellow
}
Write-Host "✅ Database migration applied" -ForegroundColor Green
Write-Host ""

# Step 4: Summary
Write-Host "=" -NoNewline -ForegroundColor Green
Write-Host ("=" * 59) -ForegroundColor Green
Write-Host "✅ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "=" -NoNewline -ForegroundColor Green
Write-Host ("=" * 59) -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start ML API (in new terminal):" -ForegroundColor White
Write-Host "   cd f:\dig\ml" -ForegroundColor Gray
Write-Host "   python stroke_api.py" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start Backend (if not running):" -ForegroundColor White
Write-Host "   cd f:\dig\backend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Access App:" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3002" -ForegroundColor Gray
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor Gray
Write-Host "   ML API:   http://localhost:5001" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Demo Login:" -ForegroundColor White
Write-Host "   Doctor: doctor@cardiomonitor.com / password123" -ForegroundColor Gray
Write-Host "   Patient: john@patient.com / password123" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Test Stroke Prediction:" -ForegroundColor White
Write-Host "   Click 'Stroke Risk' button in header" -ForegroundColor Gray
Write-Host ""
Write-Host "=" -NoNewline -ForegroundColor Green
Write-Host ("=" * 59) -ForegroundColor Green
