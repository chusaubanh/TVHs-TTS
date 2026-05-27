@echo off
title ThanhVinh Studio - Installation
color 0f
cls
setlocal EnableExtensions
set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"
set "UV_LINK_MODE=copy"

echo ===================================================
echo     ThanhVinh Studio - Installation
echo ===================================================
echo.
echo Log tip: if installation fails, copy the full terminal output and send it to support.
echo.

:: ============================================================
:: 1. Check / Install uv (Astral)
:: ============================================================
echo [1/7] Checking uv...
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
echo [2/7] Checking Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo    Node.js not found.
    echo    Downloading Node.js LTS installer...

    :: Write PowerShell script to temp file
    set "PS_SCRIPT=%TEMP%\install_node.ps1"
    (
        echo $ProgressPreference = 'SilentlyContinue'
        echo $url = 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi'
        echo $out = Join-Path $env:TEMP 'node-install.msi'
        echo Write-Host "   Downloading Node.js v20.18.0..."
        echo Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing
        echo Write-Host "   Installing Node.js..."
        echo Start-Process msiexec.exe -ArgumentList "/i",$out,"/qn","/norestart" -Wait
        echo Write-Host "   Node.js installed."
    ) > "%PS_SCRIPT%"

    powershell -ExecutionPolicy Bypass -File "%PS_SCRIPT%"
    del "%PS_SCRIPT%" >nul 2>nul

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
echo [3/7] Checking eSpeak NG...
where espeak-ng >nul 2>nul
if %errorlevel% neq 0 (
    :: Also check common install path
    if exist "%ProgramFiles%\eSpeak NG\espeak-ng.exe" (
        echo    eSpeak NG found at Program Files.
        set "PATH=%ProgramFiles%\eSpeak NG;%PATH%"
    ) else (
        echo    eSpeak NG not found. Downloading installer...

        :: Write PowerShell script to temp file to avoid escaping issues
        set "PS_SCRIPT=%TEMP%\install_espeak.ps1"
        (
            echo $ProgressPreference = 'SilentlyContinue'
            echo $releases = Invoke-RestMethod 'https://api.github.com/repos/espeak-ng/espeak-ng/releases/latest'
            echo $asset = $releases.assets ^| Where-Object { $_.name -like '*.msi' } ^| Select-Object -First 1
            echo if ($asset) {
            echo   Write-Host "   Downloading $($asset.name)..."
            echo   $out = Join-Path $env:TEMP 'espeak-ng.msi'
            echo   Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $out -UseBasicParsing
            echo   Write-Host "   Installing eSpeak NG..."
            echo   Start-Process msiexec.exe -ArgumentList "/i",$out,"/qn","/norestart" -Wait
            echo   Write-Host "   eSpeak NG installed."
            echo } else {
            echo   Write-Host "   Could not find installer."
            echo   exit 1
            echo }
        ) > "%PS_SCRIPT%"

        powershell -ExecutionPolicy Bypass -File "%PS_SCRIPT%"
        del "%PS_SCRIPT%" >nul 2>nul

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
echo [4/7] Setting up Python Environment (Backend)...
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
echo    Installing Python dependencies from uv.lock (this may take a few minutes)...
call uv sync --frozen
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Python dependencies.
    pause
    exit /b 1
)
echo    Python dependencies installed.

echo    Repairing known fragile dependency: sea-g2p...
call uv pip install --force-reinstall sea-g2p==0.7.5
if %errorlevel% neq 0 (
    echo [ERROR] Failed to repair sea-g2p.
    pause
    exit /b 1
)

echo    Verifying Python imports...
call uv run --frozen python -c "from sea_g2p import Normalizer; from vieneu import Vieneu; print('Python dependencies OK')"
if %errorlevel% neq 0 (
    echo [ERROR] Python dependency verification failed.
    pause
    exit /b 1
)

:: ============================================================
:: 5. Setup Node.js Environment (Frontend)
:: ============================================================
echo.
echo [5/7] Setting up Node.js Environment (Frontend)...
echo -------------------------------------------
cd frontend

if exist ".next\dev\lock" (
    echo    Removing stale Next.js lock file.
    del /f /q ".next\dev\lock" >nul 2>nul
)

echo    Installing Node.js dependencies from package-lock.json...
call npm ci --no-audit --no-fund
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Node dependencies.
    cd ..
    pause
    exit /b 1
)

echo    Verifying frontend build...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed.
    cd ..
    pause
    exit /b 1
)
echo    Node.js dependencies installed and verified.
cd ..

:: ============================================================
:: 6. Download OmniVoice Model
:: ============================================================
echo.
echo [6/7] Downloading OmniVoice Model...
echo -------------------------------------------
echo    This will download the OmniVoice TTS model (~1.5GB).
echo    You can skip this and download later from the app.
echo.

if exist "models\omnivoice" (
    echo    OmniVoice model already exists, skipping.
) else (
    echo    Downloading OmniVoice from HuggingFace...
    call uv run python -c "from huggingface_hub import snapshot_download; snapshot_download('k2-fsa/OmniVoice', local_dir='models/omnivoice', ignore_patterns=['*.md','*.txt'])"
    if %errorlevel% neq 0 (
        echo [WARNING] Failed to download OmniVoice model.
        echo You can download it later from the app (OmniVoice tab).
    ) else (
        echo    OmniVoice model downloaded.
    )
)

:: ============================================================
:: 7. Final verification
:: ============================================================
echo.
echo [7/7] Final verification...
call uv run --frozen python -m compileall backend
if %errorlevel% neq 0 (
    echo [ERROR] Backend compile verification failed.
    pause
    exit /b 1
)

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
echo       - OmniVoice model (optional)
echo.
echo     NOTE: After installation, the app runs fully offline.
echo     Internet is only needed for the initial model download.
echo ===================================================
pause
