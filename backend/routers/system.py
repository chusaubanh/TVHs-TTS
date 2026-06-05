"""System endpoints: health, hardware detection, model listing, status."""

import shutil
import platform
from pathlib import Path

from fastapi import APIRouter
from pydantic import BaseModel
from backend.config import (
    LOCAL_GGUF_DIR,
    LOCAL_OMNIVOICE_DIR,
    REMOTE_GGUF_REPO,
    KNOWN_LORAS,
    ESPEAK_WIN_PATH,
    get_outputs_dir,
    set_outputs_dir,
)
from backend.state import state
from backend.helpers import is_base_model_downloaded, is_omnivoice_downloaded, list_local_loras, has_cuda, build_lora_list

router = APIRouter()


class OutputFolderRequest(BaseModel):
    path: str


def _check_espeak() -> dict:
    """Check if eSpeak NG is installed and accessible."""
    espeak_path = shutil.which("espeak-ng")
    if espeak_path:
        return {"ok": True, "path": espeak_path}
    # Check common Windows install path
    win_path = Path(ESPEAK_WIN_PATH)
    if win_path.exists():
        return {"ok": True, "path": str(win_path)}
    return {"ok": False, "path": None, "error": "eSpeak NG not found. Install from https://github.com/espeak-ng/espeak-ng/releases"}


def _check_cuda() -> dict:
    """Check CUDA availability and GPU info."""
    if not has_cuda():
        return {"ok": False, "available": False, "gpu_name": None, "vram_gb": 0}
    try:
        import torch
        return {
            "ok": True,
            "available": True,
            "gpu_name": torch.cuda.get_device_name(0),
            "vram_gb": round(torch.cuda.get_device_properties(0).total_memory / (1024**3), 1),
            "cuda_version": torch.version.cuda,
        }
    except Exception:
        return {"ok": True, "available": True, "gpu_name": "Unknown", "vram_gb": 0}


def _check_output_folder() -> dict:
    """Check if output directory exists and is writable."""
    outputs_dir = get_outputs_dir()
    try:
        outputs_dir.mkdir(parents=True, exist_ok=True)
        # Test write
        test_file = outputs_dir / ".write_test"
        test_file.write_text("ok")
        test_file.unlink()
        wav_count = len(list(outputs_dir.glob("*.wav")))
        return {"ok": True, "path": str(outputs_dir), "wav_count": wav_count}
    except Exception as e:
        return {"ok": False, "path": str(outputs_dir), "error": str(e)}


@router.get("/health")
async def health_check():
    """Comprehensive health check: model, CUDA, eSpeak, output folder."""
    model_ok = state.tts is not None
    base_downloaded = is_base_model_downloaded()
    espeak = _check_espeak()
    cuda = _check_cuda()
    output = _check_output_folder()

    all_ok = model_ok and base_downloaded and espeak["ok"] and output["ok"]

    return {
        "status": "ok" if all_ok else "degraded",
        "checks": {
            "model": {
                "loaded": model_ok,
                "base_downloaded": base_downloaded,
                "type": state.current_model_type,
                "lora": state.current_lora,
            },
            "cuda": cuda,
            "espeak": espeak,
            "output_folder": output,
            "omnivoice": {
                "downloaded": is_omnivoice_downloaded(),
                "loaded": state.omnivoice_loaded,
            },
        },
    }


@router.get("/v1/hardware/detect")
async def detect_hardware():
    """Detect hardware and recommend best model."""
    info = {
        "cpu": platform.processor() or "Unknown",
        "ram_gb": 0,
        "os": platform.system(),
    }

    try:
        import psutil
        mem = psutil.virtual_memory()
        info["ram_gb"] = round(mem.total / (1024**3), 1)
        info["ram_available_gb"] = round(mem.available / (1024**3), 1)
    except ImportError:
        pass

    _has_cuda = has_cuda()
    info["cuda"] = _has_cuda
    info["gpu_name"] = "None"
    info["vram_gb"] = 0

    if _has_cuda:
        try:
            import torch
            if torch.cuda.is_available():
                info["gpu_name"] = torch.cuda.get_device_name(0)
                info["vram_gb"] = round(torch.cuda.get_device_properties(0).total_memory / (1024**3), 1)
                info["cuda_version"] = torch.version.cuda
        except Exception:
            pass

    if _has_cuda and info.get("vram_gb", 0) >= 4:
        recommendation = "pytorch"
        reason = f"GPU {info['gpu_name']} ({info['vram_gb']}GB VRAM) - PyTorch cho chat luong tot nhat + ho tro LoRA"
    elif info.get("ram_gb", 0) >= 8:
        recommendation = "gguf"
        reason = f"RAM {info['ram_gb']}GB, khong co GPU manh - GGUF Q4 chay CPU, nhe va on dinh"
    else:
        recommendation = "turbo"
        reason = f"RAM {info['ram_gb']}GB - Turbo nhe nhat, phu hop may yeu"

    info["recommendation"] = recommendation
    info["reason"] = reason

    return info


@router.get("/v1/models/available")
async def list_available_models():
    """List available model backends."""
    return {
        "models": [
            {
                "id": "gguf",
                "name": "GGUF Q4 (CPU)",
                "description": "Nhe, chay CPU, chat luong tot",
                "supports_lora": False,
                "requires_gpu": False,
            },
            {
                "id": "pytorch",
                "name": "PyTorch (GPU)",
                "description": "Chat luong cao, ho tro LoRA, can GPU",
                "supports_lora": True,
                "requires_gpu": True,
            },
            {
                "id": "turbo",
                "name": "Turbo (CPU/GPU)",
                "description": "Model nhe 0.1B, nhanh nhat",
                "supports_lora": False,
                "requires_gpu": False,
            },
        ],
        "current": state.current_model_type,
    }


@router.get("/v1/status")
async def get_status():
    """Get system status: what's downloaded, what's loaded."""
    available_loras = build_lora_list()
    outputs_dir = get_outputs_dir()

    return {
        "base_model": {
            "downloaded": is_base_model_downloaded(),
            "loaded": state.tts is not None,
            "local_path": str(LOCAL_GGUF_DIR),
            "remote_repo": REMOTE_GGUF_REPO,
        },
        "current_model": {
            "type": state.current_model_type,
            "supports_lora": state.current_model_type == "pytorch",
        },
        "lora": {
            "active": state.current_lora,
            "available": available_loras,
        },
        "download_progress": state.download_progress,
        "outputs_dir": str(outputs_dir),
        "saved_audio_count": len(list(outputs_dir.glob("*.wav"))),
    }


@router.get("/v1/settings")
async def get_settings():
    """Return user-configurable desktop settings."""
    outputs_dir = get_outputs_dir()
    return {"output_dir": str(outputs_dir)}


@router.post("/v1/settings/output-folder")
async def update_output_folder(body: OutputFolderRequest):
    """Set the audio output folder."""
    output_dir = set_outputs_dir(body.path)
    return {"status": "ok", "output_dir": str(output_dir)}


@router.post("/v1/settings/choose-output-folder")
async def choose_output_folder():
    """Open a native folder picker on the local machine and persist the selection."""
    try:
        import tkinter as tk
        from tkinter import filedialog

        root = tk.Tk()
        root.withdraw()
        root.attributes("-topmost", True)
        selected = filedialog.askdirectory(
            title="Chọn thư mục lưu audio",
            initialdir=str(get_outputs_dir()),
        )
        root.destroy()
    except Exception as e:
        return {"status": "error", "error": str(e), "output_dir": str(get_outputs_dir())}

    if not selected:
        return {"status": "cancelled", "output_dir": str(get_outputs_dir())}

    output_dir = set_outputs_dir(selected)
    return {"status": "ok", "output_dir": str(output_dir)}
