@echo off
setlocal EnableExtensions EnableDelayedExpansion
title ThanhVinh Studio
color 0b
cls

set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"

echo ===================================================
echo     ThanhVinh Studio - Start
echo ===================================================
echo.

echo Checking prerequisites...
set "NEED_INSTALL=0"

where uv >nul 2>nul || set "NEED_INSTALL=1"
where node >nul 2>nul || set "NEED_INSTALL=1"
if not exist "%ROOT%\.venv" set "NEED_INSTALL=1"
if not exist "%ROOT%\frontend\node_modules" set "NEED_INSTALL=1"

if "%NEED_INSTALL%"=="1" (
    echo [!] Some dependencies are missing. Running install.bat now...
    echo.
    call "%ROOT%\install.bat"
    if errorlevel 1 (
        echo.
        echo [ERROR] install.bat failed. Please send install.log to support.
        pause
        exit /b 1
    )
)

echo All prerequisites OK.
echo.

echo [0/4] Cleaning old backend/frontend processes...
call :KillPort 8000
call :KillPort 3000
call :KillPort 3001

if exist "%ROOT%\frontend\.next\dev\lock" (
    echo    Removing stale Next.js lock file.
    del /f /q "%ROOT%\frontend\.next\dev\lock" >nul 2>nul
)

if exist "%ROOT%\frontend\.next\dev" (
    rmdir /s /q "%ROOT%\frontend\.next\dev" >nul 2>nul
)

timeout /t 1 /nobreak >nul

echo [1/4] Starting Backend Server...
start "TV Studio Backend" cmd /k "cd /d "%ROOT%" && uv run --frozen python -m backend.main"

echo [2/4] Waiting for backend...
call :WaitUrl "http://localhost:8000/health" 60
if errorlevel 1 (
    echo.
    echo [ERROR] Backend did not become ready.
    echo Check the "TV Studio Backend" window for the exact error.
    pause
    exit /b 1
)

echo [3/4] Starting Frontend Server...
start "TV Studio Frontend" cmd /k "cd /d "%ROOT%\frontend" && npm run dev -- -p 3000 -H 127.0.0.1"

echo [4/4] Waiting for frontend...
call :WaitUrl "http://localhost:3000" 60
if errorlevel 1 (
    echo.
    echo [ERROR] Frontend did not become ready.
    echo If you see a Next.js lock error, close all old terminal windows and run start.bat again.
    pause
    exit /b 1
)

echo.
echo Opening Browser...
start http://localhost:3000

echo.
echo ===================================================
echo   App is running!
echo   - Frontend: http://localhost:3000
echo   - Backend:  http://localhost:8000
echo.
echo   Close the Backend and Frontend terminal windows to stop.
echo ===================================================
pause
exit /b 0

:KillPort
set "PORT=%~1"
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%PORT%" ^| findstr LISTENING') do (
    echo    Killing process %%a on port %PORT%
    taskkill /F /PID %%a >nul 2>nul
)
exit /b 0

:WaitUrl
set "URL=%~1"
set "MAX_WAIT=%~2"
set "COUNT=0"
:WAIT_LOOP
curl -s "%URL%" >nul 2>nul
if %errorlevel% equ 0 (
    echo    Ready: %URL%
    exit /b 0
)
set /a COUNT+=1
if %COUNT% geq %MAX_WAIT% exit /b 1
echo    Waiting... (%COUNT%/%MAX_WAIT%)
timeout /t 1 /nobreak >nul
goto :WAIT_LOOP
