# Vercel Quick Deploy Script
# Automates the deployment process for CardioMonitor+

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CardioMonitor+ Vercel Deployment" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI not found!" -ForegroundColor Red
    Write-Host "Installing Vercel CLI globally...`n" -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host "✅ Vercel CLI ready`n" -ForegroundColor Green

# Deployment options
Write-Host "Choose deployment option:" -ForegroundColor Cyan
Write-Host "  1. Deploy Frontend only" -ForegroundColor White
Write-Host "  2. Deploy Backend only" -ForegroundColor White
Write-Host "  3. Deploy ML API only" -ForegroundColor White
Write-Host "  4. Deploy All (Recommended for first deployment)" -ForegroundColor White
Write-Host "  5. Production deployment (all services)`n" -ForegroundColor White

$choice = Read-Host "Enter choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host "`n🚀 Deploying Frontend..." -ForegroundColor Cyan
        Set-Location "$PSScriptRoot\frontend"
        vercel
    }
    "2" {
        Write-Host "`n🚀 Deploying Backend..." -ForegroundColor Cyan
        Set-Location "$PSScriptRoot\backend"
        vercel
    }
    "3" {
        Write-Host "`n🚀 Deploying ML API..." -ForegroundColor Cyan
        Set-Location "$PSScriptRoot\ml"
        vercel
    }
    "4" {
        Write-Host "`n🚀 Deploying All Services (Development)..." -ForegroundColor Cyan
        
        Write-Host "`n📦 1/3 - Deploying Frontend..." -ForegroundColor Yellow
        Set-Location "$PSScriptRoot\frontend"
        vercel
        $frontendUrl = vercel inspect --wait | Select-String -Pattern "https://" | ForEach-Object { $_.Matches.Value }
        
        Write-Host "`n📦 2/3 - Deploying Backend..." -ForegroundColor Yellow
        Set-Location "$PSScriptRoot\backend"
        vercel
        $backendUrl = vercel inspect --wait | Select-String -Pattern "https://" | ForEach-Object { $_.Matches.Value }
        
        Write-Host "`n📦 3/3 - Deploying ML API..." -ForegroundColor Yellow
        Set-Location "$PSScriptRoot\ml"
        vercel
        $mlUrl = vercel inspect --wait | Select-String -Pattern "https://" | ForEach-Object { $_.Matches.Value }
        
        Write-Host "`n✅ All services deployed!`n" -ForegroundColor Green
        Write-Host "URLs:" -ForegroundColor Cyan
        Write-Host "  Frontend: $frontendUrl" -ForegroundColor White
        Write-Host "  Backend:  $backendUrl" -ForegroundColor White
        Write-Host "  ML API:   $mlUrl`n" -ForegroundColor White
    }
    "5" {
        Write-Host "`n🚀 Production Deployment..." -ForegroundColor Cyan
        
        $confirm = Read-Host "Deploy to PRODUCTION? This will be publicly accessible. (yes/no)"
        if ($confirm -eq "yes") {
            Write-Host "`n📦 1/3 - Deploying Frontend to Production..." -ForegroundColor Yellow
            Set-Location "$PSScriptRoot\frontend"
            vercel --prod
            
            Write-Host "`n📦 2/3 - Deploying Backend to Production..." -ForegroundColor Yellow
            Set-Location "$PSScriptRoot\backend"
            vercel --prod
            
            Write-Host "`n📦 3/3 - Deploying ML API to Production..." -ForegroundColor Yellow
            Set-Location "$PSScriptRoot\ml"
            vercel --prod
            
            Write-Host "`n🎉 Production deployment complete!`n" -ForegroundColor Green
        } else {
            Write-Host "Deployment cancelled." -ForegroundColor Yellow
        }
    }
    default {
        Write-Host "Invalid option. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Next Steps:" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Configure environment variables in Vercel Dashboard" -ForegroundColor White
Write-Host "2. Update CORS origins in backend/src/server.ts" -ForegroundColor White
Write-Host "3. Update API URLs in frontend environment variables" -ForegroundColor White
Write-Host "4. Test your deployment at the URLs above" -ForegroundColor White
Write-Host "`nSee VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions.`n" -ForegroundColor Yellow

Set-Location $PSScriptRoot
