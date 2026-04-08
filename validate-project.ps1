#!/usr/bin/env pwsh
# Quick validation script to check project status

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Heartbeat Monitor - Project Status Check" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

function Test-Component {
    param(
        [string]$Name,
        [scriptblock]$Test
    )
    
    try {
        $result = & $Test
        if ($result) {
            Write-Host "✓ " -ForegroundColor Green -NoNewline
            Write-Host $Name -ForegroundColor White
            return $true
        } else {
            Write-Host "✗ " -ForegroundColor Red -NoNewline
            Write-Host $Name -ForegroundColor White
            return $false
        }
    } catch {
        Write-Host "✗ " -ForegroundColor Red -NoNewline
        Write-Host "$Name (Error: $($_.Exception.Message))" -ForegroundColor Red
        return $false
    }
}

$score = 0
$total = 0

# Backend Checks
Write-Host "Backend Components:" -ForegroundColor Yellow
$total++; if (Test-Component "package.json exists" { Test-Path "backend/package.json" }) { $score++ }
$total++; if (Test-Component "Dependencies installed" { Test-Path "backend/node_modules" }) { $score++ }
$total++; if (Test-Component ".env file exists" { Test-Path "backend/.env" }) { $score++ }
$total++; if (Test-Component "Prisma schema exists" { Test-Path "backend/prisma/schema.prisma" }) { $score++ }
$total++; if (Test-Component "Server file exists" { Test-Path "backend/src/server.ts" }) { $score++ }
$total++; if (Test-Component "Auth routes exist" { Test-Path "backend/src/routes/auth.routes.ts" }) { $score++ }
$total++; if (Test-Component "Heartbeat routes exist" { Test-Path "backend/src/routes/heartbeat.routes.ts" }) { $score++ }
$total++; if (Test-Component "Alert routes exist" { Test-Path "backend/src/routes/alert.routes.ts" }) { $score++ }
$total++; if (Test-Component "Patient routes exist" { Test-Path "backend/src/routes/patient.routes.ts" }) { $score++ }
$total++; if (Test-Component "Health routes exist" { Test-Path "backend/src/routes/health.routes.ts" }) { $score++ }
$total++; if (Test-Component "Alert service exists" { Test-Path "backend/src/services/alert.service.ts" }) { $score++ }
$total++; if (Test-Component "ML service exists" { Test-Path "backend/src/services/ml.service.ts" }) { $score++ }
$total++; if (Test-Component "Socket setup exists" { Test-Path "backend/src/socket/socket.ts" }) { $score++ }
$total++; if (Test-Component "Seed script exists" { Test-Path "backend/src/utils/seed.ts" }) { $score++ }

Write-Host ""

# Frontend Checks
Write-Host "Frontend Components:" -ForegroundColor Yellow
$total++; if (Test-Component "package.json exists" { Test-Path "frontend/package.json" }) { $score++ }
$total++; if (Test-Component "Dependencies installed" { Test-Path "frontend/node_modules" }) { $score++ }
$total++; if (Test-Component "App.tsx exists" { Test-Path "frontend/src/App.tsx" }) { $score++ }
$total++; if (Test-Component "Dashboard page exists" { Test-Path "frontend/src/pages/Dashboard.tsx" }) { $score++ }
$total++; if (Test-Component "Login page exists" { Test-Path "frontend/src/pages/Login.tsx" }) { $score++ }
$total++; if (Test-Component "API service exists" { Test-Path "frontend/src/services/api.ts" }) { $score++ }
$total++; if (Test-Component "Socket service exists" { Test-Path "frontend/src/services/socket.ts" }) { $score++ }
$total++; if (Test-Component "Auth context exists" { Test-Path "frontend/src/context/AuthContext.tsx" }) { $score++ }
$total++; if (Test-Component "UI components exist" { Test-Path "frontend/src/components/ui" }) { $score++ }
$total++; if (Test-Component "Medical components exist" { Test-Path "frontend/src/components/medical" }) { $score++ }

Write-Host ""

# ML Checks
Write-Host "Machine Learning:" -ForegroundColor Yellow
$total++; if (Test-Component "Training script exists" { Test-Path "ml/train.py" }) { $score++ }
$total++; if (Test-Component "Prediction API exists" { Test-Path "ml/predict.py" }) { $score++ }
$total++; if (Test-Component "Requirements file exists" { Test-Path "ml/requirements.txt" }) { $score++ }
$total++; if (Test-Component "Dataset exists" { Test-Path "assest/train_strokes.csv/train_strokes.csv" }) { $score++ }

Write-Host ""

# Documentation Checks
Write-Host "Documentation:" -ForegroundColor Yellow
$total++; if (Test-Component "README.md exists" { Test-Path "README.md" }) { $score++ }
$total++; if (Test-Component "START_HERE.md exists" { Test-Path "START_HERE.md" }) { $score++ }
$total++; if (Test-Component "SETUP_GUIDE.md exists" { Test-Path "SETUP_GUIDE.md" }) { $score++ }
$total++; if (Test-Component "QUICKSTART.md exists" { Test-Path "QUICKSTART.md" }) { $score++ }
$total++; if (Test-Component "INTEGRATION_COMPLETE.md exists" { Test-Path "INTEGRATION_COMPLETE.md" }) { $score++ }
$total++; if (Test-Component "COMPLETION_SUMMARY.md exists" { Test-Path "COMPLETION_SUMMARY.md" }) { $score++ }

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan

$percentage = [math]::Round(($score / $total) * 100)
Write-Host ""
Write-Host "Overall Completion: " -NoNewline
Write-Host "$score/$total " -ForegroundColor Cyan -NoNewline
$color = if ($percentage -eq 100) { "Green" } elseif ($percentage -ge 90) { "Yellow" } else { "Red" }
Write-Host "($percentage%)" -ForegroundColor $color
Write-Host ""

if ($percentage -eq 100) {
    Write-Host "All components present!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next step: Run setup-complete.ps1 to complete database setup" -ForegroundColor Yellow
} else {
    Write-Host "Some components are missing. Please check the installation." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
