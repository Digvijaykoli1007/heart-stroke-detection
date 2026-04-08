@echo off
echo ========================================
echo  Heartbeat Monitor - Quick Start
echo ========================================
echo.

echo [1/3] Checking if backend is ready...
cd backend
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please create backend/.env with your Neon DATABASE_URL
    echo See INTEGRATION_COMPLETE.md for instructions
    pause
    exit /b 1
)

echo [2/3] Checking if database is setup...
call npx prisma db push --skip-generate >nul 2>&1
if errorlevel 1 (
    echo WARNING: Database not setup. Running migrations...
    call npx prisma generate
    call npx prisma migrate dev --name init
    call npm run seed
)

echo [3/3] Starting backend server...
echo.
echo Backend will run on http://localhost:5000
echo Frontend is already running on http://localhost:3001
echo.
echo Demo Accounts:
echo   Doctor: doctor@cardiomonitor.com / password123
echo   Patient: john@patient.com / password123
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm run dev
