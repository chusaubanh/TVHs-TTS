"""Download endpoints: base model, LoRA, OmniVoice."""

import threading

from fastapi import APIRouter, HTTPException

from backend.config import LOCAL_GGUF_DIR, LOCAL_OMNIVOICE_DIR, REMOTE_GGUF_REPO, REMOTE_OMNIVOICE_REPO, KNOWN_LORAS
from backend.state import state
from backend.helpers import is_base_model_downloaded, is_omnivoice_downloaded, download_with_progress
from backend.models import DownloadLoraRequest

router = APIRouter()


@router.post("/v1/download/base")
async def download_base_model():
    """Download the base GGUF model."""
    if is_base_model_downloaded():
        return {"status": "already_downloaded", "message": "Model already exists locally."}

    if state.download_progress["base"]["status"] == "downloading":
        return {"status": "in_progress", "message": "Download already in progress."}

    LOCAL_GGUF_DIR.mkdir(parents=True, exist_ok=True)
    base_patterns = ["*.gguf", "voices.json"]

    thread = threading.Thread(
        target=download_with_progress,
        args=(REMOTE_GGUF_REPO, str(LOCAL_GGUF_DIR), "base", base_patterns),
        daemon=True,
    )
    thread.start()

    return {"status": "started", "message": "Download started."}


@router.post("/v1/download/lora")
async def download_lora(body: DownloadLoraRequest):
    """Download a LoRA adapter."""
    lora_name = body.name
    from backend.config import LOCAL_LORA_DIR

    lora_path = LOCAL_LORA_DIR / lora_name
    if lora_path.exists() and any(lora_path.iterdir()):
        return {"status": "already_downloaded", "message": f"LoRA '{lora_name}' already exists."}

    if state.download_progress["lora"]["status"] == "downloading":
        return {"status": "in_progress", "message": "Download already in progress."}

    known = KNOWN_LORAS.get(lora_name)
    if not known:
        raise HTTPException(status_code=404, detail=f"Unknown LoRA: {lora_name}")

    lora_path.mkdir(parents=True, exist_ok=True)

    adapter_patterns = [
        "adapter_config.json",
        "adapter_model.safetensors",
        "adapter_model.bin",
    ]

    thread = threading.Thread(
        target=download_with_progress,
        args=(known["repo"], str(lora_path), "lora", adapter_patterns),
        daemon=True,
    )
    thread.start()

    return {"status": "started", "message": f"Downloading LoRA: {lora_name}"}


@router.get("/v1/download/progress")
async def get_download_progress():
    """Get current download progress."""
    return state.download_progress


@router.post("/v1/download/omnivoice")
async def download_omnivoice():
    """Download the OmniVoice model."""
    if is_omnivoice_downloaded():
        return {"status": "already_downloaded", "message": "OmniVoice model already exists locally."}

    if state.download_progress["omnivoice"]["status"] == "downloading":
        return {"status": "in_progress", "message": "Download already in progress."}

    LOCAL_OMNIVOICE_DIR.mkdir(parents=True, exist_ok=True)

    thread = threading.Thread(
        target=download_with_progress,
        args=(REMOTE_OMNIVOICE_REPO, str(LOCAL_OMNIVOICE_DIR), "omnivoice"),
        daemon=True,
    )
    thread.start()

    return {"status": "started", "message": "Downloading OmniVoice model..."}


@router.get("/v1/omnivoice/download-status")
async def omnivoice_download_status():
    """Check if OmniVoice model is downloaded."""
    return {
        "downloaded": is_omnivoice_downloaded(),
        "local_path": str(LOCAL_OMNIVOICE_DIR),
        "download": state.download_progress.get("omnivoice", {}),
    }
