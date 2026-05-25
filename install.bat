@echo off
title ThanhVinh Studio - Installation
color 0f
cls

echo ===================================================
echo     ThanhVinh Studio - Installation
echo ===================================================
echo.

:: ============================================================
:: 1. Check / Install uv (Astral)
:: ============================================================
echo [1/5] Checking uv...
where uv >nul 2>nul
if %errorlevel% neq 0 (
    echo    uv not found. Installing...
    powershell -ExecutionPolicy Bypass -c "irm https://astral.sh/uv/install.ps1 | iex"
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install uv.
        echo Please install manually: powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
        pause
        exit /b 1
    )
    :: Refresh PATH
    set "PATH=%USERPROFILE%\.local\bin;%USERPROFILE%\.cargo\bin;%PATH%"
    echo    uv installed successfully.
) else (
    echo    uv found.
)

:: ============================================================
:: 2. Check / Install Node.js
:: ============================================================
echo.
echo [2/5] Checking Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo    Node.js not found.
    echo    Downloading Node.js LTS installer...

    :: Download Node.js LTS installer
    powershell -ExecutionPolicy Bypass -c ^
        "$url = 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi'; " ^
        "$out = '$env:TEMP\node-install.msi'; " ^
        "Write-Host '   Downloading Node.js v20.18.0...'; " ^
        "Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing; " ^
        "Write-Host '   Installing Node.js (may need admin)...'; " ^
        "Start-Process msiexec.exe -ArgumentList '/i',$out,'/qn','/norestart' -Wait; " ^
        "Write-Host '   Node.js installed.'"

    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install Node.js automatically.
        echo Please install manually from https://nodejs.org/
        pause
        exit /b 1
    )
    :: Refresh PATH
    set "PATH=%ProgramFiles%\nodejs;%APPDATA%\npm;%PATH%"
) else (
    echo    Node.js found:
    node --version
)

:: ============================================================
:: 3. Check / Install eSpeak NG
:: ============================================================
echo.
echo [3/5] Checking eSpeak NG...
where espeak-ng >nul 2>nul
if %errorlevel% neq 0 (
    :: Also check common install path
    if exist "%ProgramFiles%\eSpeak NG\espeak-ng.exe" (
        echo    eSpeak NG found at Program Files.
        set "PATH=%ProgramFiles%\eSpeak NG;%PATH%"
    ) else (
        echo    eSpeak NG not found. Downloading installer...

        powershell -ExecutionPolicy Bypass -c ^
            "$releases = Invoke-RestMethod 'https://api.github.com/repos/espeak-ng/espeak-ng/releases/latest'; " ^
            "$asset = $releases.assets | Where-Object { $_.name -like '*.msi' } | Select-Object -First 1; " ^
            "if ($asset) { " ^
            "  Write-Host '   Downloading' $asset.name '...'; " ^
            "  Invoke-WebRequest -Uri $asset.browser_download_url -OutFile '$env:TEMP\espeak-ng.msi' -UseBasicParsing; " ^
            "  Write-Host '   Installing eSpeak NG...'; " ^
            "  Start-Process msiexec.exe -ArgumentList '/i','$env:TEMP\espeak-ng.msi','/qn','/norestart' -Wait; " ^
            "  Write-Host '   eSpeak NG installed.' " ^
            "} else { " ^
            "  Write-Host '   Could not find installer. Please install manually.' " ^
            "  exit 1 " ^
            "}"

        if %errorlevel% neq 0 (
            echo [WARNING] Could not auto-install eSpeak NG.
            echo Please install manually from: https://github.com/espeak-ng/espeak-ng/releases
            echo The app will not work without eSpeak NG for Vietnamese phonemization.
            echo.
            pause
        ) else (
            set "PATH=%ProgramFiles%\eSpeak NG;%PATH%"
        )
    )
) else (
    echo    eSpeak NG found.
)

:: ============================================================
:: 4. Setup Python Environment (Backend)
:: ============================================================
echo.
echo [4/5] Setting up Python Environment (Backend)...
echo -------------------------------------------

:: Create venv if not exists
if not exist ".venv" (
    echo    Creating virtual environment...
    call uv venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create venv.
        pause
        exit /b 1
    )
) else (
    echo    Virtual environment already exists.
)

:: Install Python dependencies
echo    Installing Python dependencies (this may take a few minutes)...
call uv sync
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Python dependencies.
    pause
    exit /b 1
)
echo    Python dependencies installed.

:: ============================================================
:: 5. Setup Node.js Environment (Frontend)
:: ============================================================
echo.
echo [5/5] Setting up Node.js Environment (Frontend)...
echo -------------------------------------------
cd frontend

if exist "node_modules" (
    echo    node_modules found, skipping npm install.
    echo    (Delete node_modules and run again if you have issues)
) else (
    echo    Installing Node.js dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install Node dependencies.
        pause
        exit /b 1
    )
    echo    Node.js dependencies installed.
)
cd ..

:: ============================================================
:: Done
:: ============================================================
echo.
echo ===================================================
echo     Installation Complete!
echo.
echo     Run "start.bat" to launch the application.
echo.
echo     Prerequisites installed:
echo       - uv (Python package manager)
echo       - Node.js + npm
echo       - eSpeak NG (phonemization)
echo       - Python dependencies
echo       - Node.js dependencies
echo ===================================================
pause
