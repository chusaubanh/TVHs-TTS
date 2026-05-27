@echo off
setlocal EnableExtensions
title ThanhVinh Studio - Repair
color 0e
cls

set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"
set "UV_LINK_MODE=copy"

echo ===================================================
echo     ThanhVinh Studio - Repair
echo ===================================================
echo.
echo This repairs common local issues:
echo   - stale Next.js lock files
echo   - ports 8000, 3000, 3001 being occupied
echo   - broken Python dependency sea-g2p
echo   - missing/corrupt node_modules
echo.

call :KillPort 8000
call :KillPort 3000
call :KillPort 3001

if exist "%ROOT%\frontend\.next\dev\lock" (
    echo Removing stale frontend lock...
    del /f /q "%ROOT%\frontend\.next\dev\lock" >nul 2>nul
)

if exist "%ROOT%\frontend\.next\dev" (
    echo Removing stale frontend dev cache...
    rmdir /s /q "%ROOT%\frontend\.next\dev" >nul 2>nul
)

where uv >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] uv not found. Run install.bat first.
    pause
    exit /b 1
)

echo.
echo Repairing Python dependencies...
call uv sync --frozen
if %errorlevel% neq 0 (
    echo [ERROR] uv sync failed.
    pause
    exit /b 1
)

call uv pip install --force-reinstall vieneu==2.7.0 sea-g2p==0.7.5
if %errorlevel% neq 0 (
    echo [ERROR] vieneu/sea-g2p repair failed.
    pause
    exit /b 1
)

call uv run --frozen python -c "from sea_g2p import Normalizer; from vieneu import Vieneu; print('Python dependencies OK')"
if %errorlevel% neq 0 (
    echo [ERROR] Python verification failed.
    pause
    exit /b 1
)

echo.
echo Repairing frontend dependencies...
cd /d "%ROOT%\frontend"
call npm ci --no-audit --no-fund
if %errorlevel% neq 0 (
    cd /d "%ROOT%"
    echo [ERROR] npm ci failed.
    pause
    exit /b 1
)
cd /d "%ROOT%"

echo.
echo ===================================================
echo     Repair complete. Run start.bat now.
echo ===================================================
pause
exit /b 0

:KillPort
set "PORT=%~1"
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%PORT%" ^| findstr LISTENING') do (
    echo Killing process %%a on port %PORT%
    taskkill /F /PID %%a >nul 2>nul
)
exit /b 0
