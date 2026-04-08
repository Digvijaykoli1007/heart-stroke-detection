@echo off
REM Database configuration checker
cls
echo.
echo =============================================
echo   DATABASE CONFIGURATION CHECK
echo =============================================
echo.

cd backend

REM Extract DATABASE_URL value
for /f "tokens=2 delims==" %%a in ('findstr "DATABASE_URL" .env') do set DB_URL=%%a

REM Remove quotes
set DB_URL=%DB_URL:"=%

REM Check if it contains placeholder
echo %DB_URL% | findstr /C:"placeholder" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Status: NOT CONFIGURED
    echo.
    echo DATABASE_URL contains placeholder
    echo.
    echo =============================================
    echo   HOW TO GET YOUR DATABASE
    echo =============================================
    echo.
    echo 1. Open browser: https://console.neon.tech
    echo.
    echo 2. Sign in with GitHub ^(free, instant^)
    echo.
    echo 3. Click "New Project"
    echo    - Name: heartbeat-monitor
    echo    - Region: Choose closest to you
    echo    - Click "Create Project"
    echo.
    echo 4. You'll see a connection string like:
    echo    postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require
    echo.
    echo 5. Copy that entire connection string
    echo.
    echo 6. Open: backend\.env
    echo.
    echo 7. Find the line:
    echo    DATABASE_URL="postgresql://placeholder..."
    echo.
    echo 8. Replace with your connection string:
    echo    DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require"
    echo.
    echo 9. Save the file
    echo.
    echo 10. Run: .\start.bat
    echo.
    echo =============================================
    echo.
) else (
    echo Status: CONFIGURED
    echo.
    echo DATABASE_URL: %DB_URL:~0,50%...
    echo.
    echo [OK] Your database is configured!
    echo.
    echo Next step: Run .\start.bat to launch the app
    echo.
    echo =============================================
    echo.
)

cd ..
pause
