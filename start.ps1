#!/usr/bin/env pwsh
# Quick-start script for Heartbeat Monitor
# Checks configuration and starts the application

$ErrorActionPreference = "Stop"

Clear-Host
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Heartbeat Monitor - Quick Start" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check DATABASE_URL configuration
Set-Location backend

$envContent = Get-Content .env -Raw
if ($envContent -match "placeholder") {
    Write-Host "[!] DATABASE_URL needs configuration" -ForegroundColor Red
    Write-Host ""
    Write-Host "To complete setup:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Visit: " -NoNewline
    Write-Host "https://console.neon.tech" -ForegroundColor Cyan
    Write-Host "2. Create free account (GitHub sign-in)" -ForegroundColor White
    Write-Host "3. Create project: " -NoNewline
    Write-Host "heartbeat-monitor" -ForegroundColor Yellow
    Write-Host "4. Copy connection string" -ForegroundColor White
    Write-Host "5. Open: " -NoNewline
    Write-Host "backend\.env" -ForegroundColor Cyan
    Write-Host "6. Update: " -NoNewline
    Write-Host "DATABASE_URL" -ForegroundColor Yellow -NoNewline
    Write-Host " with your connection string" -ForegroundColor White
    Write-Host ""
    Write-Host "Then run this script again!" -ForegroundColor Green
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host ""
    Set-Location ..
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[OK] DATABASE_URL is configured" -ForegroundColor Green
Write-Host ""

# Check if Prisma client is generated
if (-not (Test-Path "node_modules\.prisma\client")) {
    Write-Host "[*] Generating Prisma client..." -ForegroundColor Yellow
    npx prisma generate | Out-Null
    Write-Host "[OK] Prisma client generated" -ForegroundColor Green
}

# Check if database needs migration
$migrateStatus = npx prisma migrate status 2>&1
if ($LASTEXITCODE -ne 0 -or $migrateStatus -match "not in sync" -or $migrateStatus -match "No migration found") {
    Write-Host "[*] Running database migrations..." -ForegroundColor Yellow
    npx prisma migrate dev --name init --skip-seed 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Database migration failed" -ForegroundColor Red
        Write-Host ""
        Write-Host "Make sure your DATABASE_URL is correct and Neon database is active" -ForegroundColor Yellow
        Set-Location ..
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "[OK] Database migrated" -ForegroundColor Green
    
    Write-Host "[*] Seeding database with demo data..." -ForegroundColor Yellow
    npm run seed | Out-Null
    Write-Host "[OK] Database seeded" -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Setup Complete! Starting Backend..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo Accounts:" -ForegroundColor Yellow
Write-Host "  Doctor : " -NoNewline
Write-Host "doctor@cardiomonitor.com / password123" -ForegroundColor Green
Write-Host "  Patient: " -NoNewline
Write-Host "john@patient.com / password123" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: " -NoNewline
Write-Host "http://localhost:3001" -ForegroundColor Cyan
Write-Host "Backend : " -NoNewline
Write-Host "http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

Set-Location backend
npm run dev
