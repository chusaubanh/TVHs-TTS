@echo off
title ThanhVinh Studio
color 0b
cls

echo ===================================================
echo     ThanhVinh Studio - v2.0
echo ===================================================
echo.

:: Quick prerequisite check
echo Checking prerequisites...
set MISSING=0

where uv >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] uv not found. Run install.bat first.
    set MISSING=1
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Node.js not found. Run install.bat first.
    set MISSING=1
)

if not exist ".venv" (
    echo [!] Virtual environment not found. Run install.bat first.
    set MISSING=1
)

if not exist "frontend\node_modules" (
    echo [!] Frontend dependencies not found. Run install.bat first.
    set MISSING=1
)

if %MISSING% equ 1 (
    echo.
    echo Please run install.bat first to set up all dependencies.
    pause
    exit /b 1
)

echo All prerequisites OK.
echo.

:: 0. Kill existing processes on port 8000
echo [0/3] Cleaning up old processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo    Killing process %%a on port 8000
    taskkill /F /PID %%a >nul 2>nul
)
timeout /t 1 /nobreak >nul

:: 1. Backend
echo [1/3] Starting Backend Server...
start "TV Studio Backend" cmd /k "cd /d "%~dp0" && uv run --frozen python backend/api.py"

:: 2. Wait for backend to be ready
echo [2/3] Waiting for backend to start...
set MAX_WAIT=30
set COUNT=0

:WAIT_LOOP
timeout /t 1 /nobreak >nul
set /a COUNT+=1

:: Check if backend is responding
curl -s http://localhost:8000/health >nul 2>nul
if %errorlevel% equ 0 (
    echo    Backend is ready!
    goto :BACKEND_OK
)

if %COUNT% geq %MAX_WAIT% (
    echo.
    echo [WARNING] Backend did not respond after %MAX_WAIT% seconds.
    echo Check the "TV Studio Backend" window for errors.
    echo.
    echo Common issues:
    echo   - Missing Python dependencies: run install.bat first
    echo   - Port 8000 already in use
    echo   - eSpeak NG not installed
    echo.
    pause
    goto :START_FRONTEND
)

echo    Waiting... (%COUNT%/%MAX_WAIT%)
goto :WAIT_LOOP

:BACKEND_OK

:: 3. Frontend
:START_FRONTEND
echo [3/3] Starting Frontend Server...
cd frontend
start "TV Studio Frontend" cmd /k "npm run dev"
cd ..

:: 4. Wait & Launch
echo.
echo Opening Browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo ===================================================
echo   App is running!
echo   - Frontend: http://localhost:3000
echo   - Backend:  http://localhost:8000
echo.
echo   Close the terminal windows to stop.
echo ===================================================
