@echo off
setlocal

echo.
echo ========================================
echo AIM3 - Cloud Run Deployment Automator
echo ========================================
echo.

REM --- CONFIGURATION ---
set PROJECT_ID=aim3-vue-adm
set SERVICE_NAME=aim3-portal
set REGION=us-central1
set IMAGE_NAME=gcr.io/%PROJECT_ID%/%SERVICE_NAME%

echo [1/4] Configuring Google Cloud...
call gcloud config set project %PROJECT_ID%
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

echo [2/4] Building Container Image with Cloud Build...
echo (This is faster than local Docker build)
call gcloud builds submit --tag %IMAGE_NAME% .
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

echo [3/4] Deploying to Cloud Run...
call gcloud run deploy %SERVICE_NAME% ^
  --image %IMAGE_NAME% ^
  --platform managed ^
  --region %REGION% ^
  --allow-unauthenticated ^
  --memory 512Mi ^
  --cpu 1 ^
  --port 8080

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ DEPLOYMENT SUCCESSFUL!
    echo ========================================
    echo.
    echo Service URL:
    gcloud run services describe %SERVICE_NAME% --region %REGION% --format="value(status.url)"
    echo.
) else (
    echo.
    echo ❌ DEPLOYMENT FAILED
    pause
    exit /b 1
)

pause
