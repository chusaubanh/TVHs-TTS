@echo off
title Download Models - ThanhVinhStudio
color 0b
cls

echo ===================================================
echo     ThanhVinhStudio - Model Downloader
echo ===================================================
echo.
echo This will download:
echo   1. Base model: VieNeu-TTS-0.3B (GGUF Q4)
echo   2. LoRA adapter: Ngoc Huyen voice
echo.
echo Total size: ~500MB-1GB (depending on model)
echo.
pause

call uv run --frozen python models/download_models.py

echo.
pause
