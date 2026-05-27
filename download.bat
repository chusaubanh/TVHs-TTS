@echo off
setlocal EnableExtensions
title Download Models - ThanhVinhStudio
color 0b
cls

set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"
set "UV_LINK_MODE=copy"

echo ===================================================
echo     ThanhVinhStudio - Model Downloader
echo ===================================================
echo.
echo This downloads model files directly from Hugging Face.
echo It no longer depends on files inside the ignored models/ folder.
echo.

where uv >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] uv not found. Run install.bat first.
    pause
    exit /b 1
)

if not exist "%ROOT%\.venv" (
    echo [!] Python environment not found. Running install.bat first...
    call "%ROOT%\install.bat"
    if errorlevel 1 exit /b 1
)

echo.
echo [1/3] Downloading base VieNeu-TTS model...
call uv run --frozen python -c "from huggingface_hub import snapshot_download; snapshot_download('pnnbao-ump/VieNeu-TTS-v2', local_dir='models/base/VieNeu-TTS-v2-gguf', allow_patterns=['*.gguf','voices.json'])"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to download base model.
    pause
    exit /b 1
)

echo.
echo [2/3] Downloading Ngoc Huyen LoRA adapter...
call uv run --frozen python -c "from huggingface_hub import snapshot_download; snapshot_download('luukien/VieNeu-TTS-0.3B-v2', local_dir='models/lora/ngoc-huyen', allow_patterns=['adapter_config.json','adapter_model.safetensors','adapter_model.bin'])"
if %errorlevel% neq 0 (
    echo [WARNING] Failed to download LoRA adapter. You can retry later from the app.
)

echo.
choice /C YN /N /M "Download OmniVoice model too? It is large, about 1.5GB. [Y/N]: "
if errorlevel 2 goto :DONE

echo.
echo [3/3] Downloading OmniVoice model...
call uv run --frozen python -c "from huggingface_hub import snapshot_download; snapshot_download('k2-fsa/OmniVoice', local_dir='models/omnivoice', ignore_patterns=['*.md','*.txt'])"
if %errorlevel% neq 0 (
    echo [WARNING] Failed to download OmniVoice. You can retry later from the app.
)

:DONE
echo.
echo ===================================================
echo     Download complete.
echo     Run start.bat to launch the app.
echo ===================================================
pause
