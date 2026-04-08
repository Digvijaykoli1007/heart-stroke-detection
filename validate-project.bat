@echo off
echo.
echo =============================================
echo   Heartbeat Monitor - Project Status Check
echo =============================================
echo.

set SCORE=0
set TOTAL=0

echo Backend Components:
set /a TOTAL+=1
if exist "backend\package.json" (echo [OK] package.json exists && set /a SCORE+=1) else echo [FAIL] package.json exists
set /a TOTAL+=1
if exist "backend\node_modules" (echo [OK] Dependencies installed && set /a SCORE+=1) else echo [FAIL] Dependencies installed
set /a TOTAL+=1
if exist "backend\.env" (echo [OK] .env file exists && set /a SCORE+=1) else echo [FAIL] .env file exists
set /a TOTAL+=1
if exist "backend\prisma\schema.prisma" (echo [OK] Prisma schema exists && set /a SCORE+=1) else echo [FAIL] Prisma schema exists
set /a TOTAL+=1
if exist "backend\src\server.ts" (echo [OK] Server file exists && set /a SCORE+=1) else echo [FAIL] Server file exists
set /a TOTAL+=1
if exist "backend\src\routes\auth.routes.ts" (echo [OK] Auth routes exist && set /a SCORE+=1) else echo [FAIL] Auth routes exist
set /a TOTAL+=1
if exist "backend\src\routes\heartbeat.routes.ts" (echo [OK] Heartbeat routes exist && set /a SCORE+=1) else echo [FAIL] Heartbeat routes exist
set /a TOTAL+=1
if exist "backend\src\routes\alert.routes.ts" (echo [OK] Alert routes exist && set /a SCORE+=1) else echo [FAIL] Alert routes exist
set /a TOTAL+=1
if exist "backend\src\routes\patient.routes.ts" (echo [OK] Patient routes exist && set /a SCORE+=1) else echo [FAIL] Patient routes exist
set /a TOTAL+=1
if exist "backend\src\routes\health.routes.ts" (echo [OK] Health routes exist && set /a SCORE+=1) else echo [FAIL] Health routes exist
set /a TOTAL+=1
if exist "backend\src\services\alert.service.ts" (echo [OK] Alert service exists && set /a SCORE+=1) else echo [FAIL] Alert service exists
set /a TOTAL+=1
if exist "backend\src\services\ml.service.ts" (echo [OK] ML service exists && set /a SCORE+=1) else echo [FAIL] ML service exists
set /a TOTAL+=1
if exist "backend\src\socket\socket.ts" (echo [OK] Socket setup exists && set /a SCORE+=1) else echo [FAIL] Socket setup exists
set /a TOTAL+=1
if exist "backend\src\utils\seed.ts" (echo [OK] Seed script exists && set /a SCORE+=1) else echo [FAIL] Seed script exists

echo.
echo Frontend Components:
set /a TOTAL+=1
if exist "frontend\package.json" (echo [OK] package.json exists && set /a SCORE+=1) else echo [FAIL] package.json exists
set /a TOTAL+=1
if exist "frontend\node_modules" (echo [OK] Dependencies installed && set /a SCORE+=1) else echo [FAIL] Dependencies installed
set /a TOTAL+=1
if exist "frontend\src\App.tsx" (echo [OK] App.tsx exists && set /a SCORE+=1) else echo [FAIL] App.tsx exists
set /a TOTAL+=1
if exist "frontend\src\pages\Dashboard.tsx" (echo [OK] Dashboard page exists && set /a SCORE+=1) else echo [FAIL] Dashboard page exists
set /a TOTAL+=1
if exist "frontend\src\pages\Login.tsx" (echo [OK] Login page exists && set /a SCORE+=1) else echo [FAIL] Login page exists
set /a TOTAL+=1
if exist "frontend\src\services\api.ts" (echo [OK] API service exists && set /a SCORE+=1) else echo [FAIL] API service exists
set /a TOTAL+=1
if exist "frontend\src\services\socket.ts" (echo [OK] Socket service exists && set /a SCORE+=1) else echo [FAIL] Socket service exists
set /a TOTAL+=1
if exist "frontend\src\context\AuthContext.tsx" (echo [OK] Auth context exists && set /a SCORE+=1) else echo [FAIL] Auth context exists
set /a TOTAL+=1
if exist "frontend\src\components\ui" (echo [OK] UI components exist && set /a SCORE+=1) else echo [FAIL] UI components exist
set /a TOTAL+=1
if exist "frontend\src\components\medical" (echo [OK] Medical components exist && set /a SCORE+=1) else echo [FAIL] Medical components exist

echo.
echo Machine Learning:
set /a TOTAL+=1
if exist "ml\train.py" (echo [OK] Training script exists && set /a SCORE+=1) else echo [FAIL] Training script exists
set /a TOTAL+=1
if exist "ml\predict.py" (echo [OK] Prediction API exists && set /a SCORE+=1) else echo [FAIL] Prediction API exists
set /a TOTAL+=1
if exist "ml\requirements.txt" (echo [OK] Requirements file exists && set /a SCORE+=1) else echo [FAIL] Requirements file exists
set /a TOTAL+=1
if exist "assest\train_strokes.csv\train_strokes.csv" (echo [OK] Dataset exists && set /a SCORE+=1) else echo [FAIL] Dataset exists

echo.
echo Documentation:
set /a TOTAL+=1
if exist "README.md" (echo [OK] README.md exists && set /a SCORE+=1) else echo [FAIL] README.md exists
set /a TOTAL+=1
if exist "START_HERE.md" (echo [OK] START_HERE.md exists && set /a SCORE+=1) else echo [FAIL] START_HERE.md exists
set /a TOTAL+=1
if exist "SETUP_GUIDE.md" (echo [OK] SETUP_GUIDE.md exists && set /a SCORE+=1) else echo [FAIL] SETUP_GUIDE.md exists
set /a TOTAL+=1
if exist "QUICKSTART.md" (echo [OK] QUICKSTART.md exists && set /a SCORE+=1) else echo [FAIL] QUICKSTART.md exists
set /a TOTAL+=1
if exist "INTEGRATION_COMPLETE.md" (echo [OK] INTEGRATION_COMPLETE.md exists && set /a SCORE+=1) else echo [FAIL] INTEGRATION_COMPLETE.md exists
set /a TOTAL+=1
if exist "COMPLETION_SUMMARY.md" (echo [OK] COMPLETION_SUMMARY.md exists && set /a SCORE+=1) else echo [FAIL] COMPLETION_SUMMARY.md exists

echo.
echo =============================================
echo.
echo Overall Completion: %SCORE%/%TOTAL%
echo.
if %SCORE%==%TOTAL% (
    echo All components present!
    echo.
    echo Next step: Run setup-complete.ps1 to complete database setup
) else (
    echo Some components are missing. Please check the installation.
)
echo.
echo =============================================
echo.
pause
