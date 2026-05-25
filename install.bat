@echo off
title Install ThanhVinhStudio
color 0f
cls

echo ===================================================
echo     ThanhVinhStudio - Installation
echo ===================================================
echo.

:: 1. Check Prerequisites
where uv >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] 'uv' (Astral UV) is not found.
    echo Please install it: powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
    pause
    exit /b
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found.
    echo Please install Node.js (LTS version) from nodejs.org
    pause
    exit /b
)

:: 2. Setup Python Environment
echo.
echo [1/2] Setting up Python Environment (Backend)...
echo -------------------------------------------
call uv venv
if %errorlevel% neq 0 ( 
    echo Failed to create venv. 
    pause 
    exit /b 
)
call uv pip install -e .
if %errorlevel% neq 0 (
    echo Failed to install Python dependencies.
    pause
    exit /b
)

:: 3. Setup Node Environment
echo.
echo [2/2] Setting up Node.js Environment (Frontend)...
echo -------------------------------------------
cd frontend
if exist node_modules (
    echo node_modules found, skipping fresh install...
    echo (If you have issues, delete node_modules and run this again)
) else (
    call npm install
    if %errorlevel% neq 0 (
        echo Failed to install Node dependencies.
        pause
        exit /b
    )
)
cd ..

echo.
echo ===================================================
echo     Installation Complete!
echo     Run "start.bat" to launch.
echo ===================================================
pause
