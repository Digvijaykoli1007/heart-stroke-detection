# Quick Start Script for PowerShell
# Run: .\start-backend.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Heartbeat Monitor - Quick Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Checking if backend is ready..." -ForegroundColor Yellow
Set-Location backend

if (-Not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please create backend/.env with your Neon DATABASE_URL" -ForegroundColor Red
    Write-Host "See INTEGRATION_COMPLETE.md for instructions" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "[2/3] Checking if database is setup..." -ForegroundColor Yellow
npx prisma db push --skip-generate 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Database not setup. Running migrations..." -ForegroundColor Yellow
    npx prisma generate
    npx prisma migrate dev --name init
    npm run seed
}

Write-Host "[3/3] Starting backend server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "✓ Backend will run on http://localhost:5000" -ForegroundColor Green
Write-Host "✓ Frontend is already running on http://localhost:3001" -ForegroundColor Green
Write-Host ""
Write-Host "Demo Accounts:" -ForegroundColor Cyan
Write-Host "  Doctor: doctor@cardiomonitor.com / password123" -ForegroundColor White
Write-Host "  Patient: john@patient.com / password123" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npm run dev
