#!/usr/bin/env pwsh
# Interactive Setup Script for Heartbeat Monitor
# This script guides you through the final database setup

$ErrorActionPreference = "Stop"

function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Text)
    Write-Host "✓ $Text" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Text)
    Write-Host "⚠ $Text" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Text)
    Write-Host "✗ $Text" -ForegroundColor Red
}

function Write-Info {
    param([string]$Text)
    Write-Host "ℹ $Text" -ForegroundColor Blue
}

# Start
Clear-Host
Write-Header "🫀 Heartbeat Monitor - Final Setup"

# Step 1: Check Prerequisites
Write-Host "Step 1: Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

$checks = @{
    "Node.js installed" = { (Get-Command node -ErrorAction SilentlyContinue) -ne $null }
    "Backend dependencies" = { Test-Path "backend/node_modules" }
    "Frontend dependencies" = { Test-Path "frontend/node_modules" }
    "Backend .env file" = { Test-Path "backend/.env" }
}

$allPassed = $true
foreach ($check in $checks.GetEnumerator()) {
    if (& $check.Value) {
        Write-Success $check.Key
    } else {
        Write-Error $check.Key
        $allPassed = $false
    }
}

if (-not $allPassed) {
    Write-Host ""
    Write-Error "Some prerequisites are missing. Please run 'npm install' in backend and frontend directories."
    exit 1
}

Write-Host ""

# Step 2: Check DATABASE_URL
Write-Host "Step 2: Checking database configuration..." -ForegroundColor Yellow
Write-Host ""

$envContent = Get-Content "backend/.env" -Raw
if ($envContent -match "placeholder") {
    Write-Warning "DATABASE_URL needs to be configured"
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
    Write-Host "  DATABASE SETUP REQUIRED" -ForegroundColor Magenta
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "To get your FREE Neon PostgreSQL database:" -ForegroundColor White
    Write-Host ""
    Write-Host "1. Open browser: " -NoNewline; Write-Host "https://console.neon.tech" -ForegroundColor Cyan
    Write-Host "2. Sign in with GitHub (instant, free)" -ForegroundColor White
    Write-Host "3. Click 'New Project'" -ForegroundColor White
    Write-Host "4. Name: " -NoNewline; Write-Host "heartbeat-monitor" -ForegroundColor Yellow
    Write-Host "5. Click 'Create Project'" -ForegroundColor White
    Write-Host "6. Copy the connection string (starts with postgresql://)" -ForegroundColor White
    Write-Host ""
    Write-Host "Then:" -ForegroundColor White
    Write-Host "- Open: " -NoNewline; Write-Host "backend\.env" -ForegroundColor Cyan
    Write-Host "- Find: " -NoNewline; Write-Host "DATABASE_URL=" -ForegroundColor Yellow
    Write-Host "- Paste your Neon connection string" -ForegroundColor White
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
    Write-Host ""
    
    $response = Read-Host "Have you updated the DATABASE_URL? (y/n)"
    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host ""
        Write-Info "Setup paused. Run this script again after updating DATABASE_URL."
        Write-Host ""
        Write-Host "Quick steps:" -ForegroundColor Cyan
        Write-Host "  1. Get Neon database → https://console.neon.tech" -ForegroundColor White
        Write-Host "  2. Update backend\.env with your connection string" -ForegroundColor White
        Write-Host "  3. Run this script again: " -NoNewline; Write-Host ".\setup-complete.ps1" -ForegroundColor Yellow
        Write-Host ""
        exit 0
    }
    
    # Re-read .env to check if updated
    $envContent = Get-Content "backend/.env" -Raw
    if ($envContent -match "placeholder") {
        Write-Error "DATABASE_URL still contains 'placeholder'. Please update it first."
        exit 1
    }
}

Write-Success "DATABASE_URL is configured"
Write-Host ""

# Step 3: Prisma Setup
Write-Host "Step 3: Setting up Prisma..." -ForegroundColor Yellow
Write-Host ""

try {
    Set-Location backend
    
    Write-Info "Generating Prisma Client..."
    npx prisma generate | Out-Null
    Write-Success "Prisma Client generated"
    
    Write-Info "Running database migrations..."
    npx prisma migrate dev --name init --skip-seed 2>&1 | Out-Null
    Write-Success "Database migrations complete"
    
    Write-Info "Seeding database with demo data..."
    npm run seed
    Write-Success "Database seeded with demo accounts"
    
    Set-Location ..
} catch {
    Write-Error "Database setup failed: $($_.Exception.Message)"
    Set-Location ..
    exit 1
}

Write-Host ""

# Step 4: Summary
Write-Header "🎉 Setup Complete!"

Write-Host "Your Heartbeat Monitor is ready to run!" -ForegroundColor Green
Write-Host ""

Write-Host "Demo Accounts:" -ForegroundColor Cyan
Write-Host "  Doctor : " -NoNewline; Write-Host "doctor@cardiomonitor.com" -ForegroundColor Yellow -NoNewline; Write-Host " / " -NoNewline; Write-Host "password123" -ForegroundColor Yellow
Write-Host "  Patient: " -NoNewline; Write-Host "john@patient.com" -ForegroundColor Yellow -NoNewline; Write-Host " / " -NoNewline; Write-Host "password123" -ForegroundColor Yellow
Write-Host "  Patient: " -NoNewline; Write-Host "maria@patient.com" -ForegroundColor Yellow -NoNewline; Write-Host " / " -NoNewline; Write-Host "password123" -ForegroundColor Yellow
Write-Host "  Patient: " -NoNewline; Write-Host "david@patient.com" -ForegroundColor Yellow -NoNewline; Write-Host " / " -NoNewline; Write-Host "password123" -ForegroundColor Yellow
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start Backend:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Open Frontend:" -ForegroundColor White
Write-Host "   http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Login:" -ForegroundColor White
Write-Host "   Click " -NoNewline; Write-Host "'Doctor Account'" -ForegroundColor Yellow -NoNewline; Write-Host " button for instant access"
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  Ready to monitor heartbeats! 🫀" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$startNow = Read-Host "Start backend server now? (y/n)"
if ($startNow -eq 'y' -or $startNow -eq 'Y') {
    Write-Host ""
    Write-Info "Starting backend server on port 5000..."
    Write-Host ""
    Set-Location backend
    npm run dev
}
