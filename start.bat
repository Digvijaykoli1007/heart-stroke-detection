@echo off
REM Quick setup checker and launcher for Heartbeat Monitor
cls
echo.
echo =============================================
echo   Heartbeat Monitor - Quick Setup Check
echo =============================================
echo.

REM Check if DATABASE_URL is configured
cd backend
findstr /C:"placeholder" .env >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [!] DATABASE_URL needs configuration
    echo.
    echo To complete setup:
    echo.
    echo 1. Visit: https://console.neon.tech
    echo 2. Create free account ^(GitHub sign-in^)
    echo 3. Create project: heartbeat-monitor
    echo 4. Copy connection string
    echo 5. Open: backend\.env
    echo 6. Update: DATABASE_URL with your connection string
    echo.
    echo Then run this script again!
    echo.
    echo =============================================
    echo.
    pause
    exit /b 1
)

echo [OK] DATABASE_URL is configured
echo.

REM Check if Prisma client is generated
if not exist "node_modules\.prisma\client" (
    echo [*] Generating Prisma client...
    call npx prisma generate >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Prisma generate failed
        pause
        exit /b 1
    )
    echo [OK] Prisma client generated
)

REM Check if database is migrated
call npx prisma migrate status >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [*] Running database migrations...
    call npx prisma migrate dev --name init --skip-seed
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Database migration failed
        echo.
        echo Make sure your DATABASE_URL is correct and Neon database is active
        pause
        exit /b 1
    )
    echo [OK] Database migrated
    
    echo [*] Seeding database with demo data...
    call npm run seed
    echo [OK] Database seeded
)

cd ..

echo.
echo =============================================
echo   Setup Complete! Starting Backend...
echo =============================================
echo.
echo Demo Accounts:
echo   Doctor : doctor@cardiomonitor.com / password123
echo   Patient: john@patient.com / password123
echo.
echo Frontend: http://localhost:3001
echo Backend : http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.
echo =============================================
echo.

cd backend
npm run dev
