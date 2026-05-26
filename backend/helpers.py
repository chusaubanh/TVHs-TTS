"""Utility functions for audio, downloads, hardware detection, and model paths."""

import io
import os
import re
import socket
import tempfile
import shutil
import threading
from datetime import datetime
from pathlib import Path

import numpy as np
import soundfile as sf
from fastapi.responses import StreamingResponse

from backend.config import (
    LOCAL_GGUF_DIR, LOCAL_LORA_DIR, LOCAL_OMNIVOICE_DIR,
    OUTPUTS_DIR, REMOTE_GGUF_REPO, KNOWN_LORAS,
)
from backend.state import state


# ============================================================================
# Model availability checks
# ============================================================================

def is_base_model_downloaded() -> bool:
    """Check if base model is available locally."""
    if LOCAL_GGUF_DIR.exists():
        gguf_files = list(LOCAL_GGUF_DIR.glob("*.gguf"))
        return len(gguf_files) > 0
    return False


def is_omnivoice_downloaded() -> bool:
    """Check if OmniVoice model is downloaded locally."""
    return LOCAL_OMNIVOICE_DIR.exists() and any(LOCAL_OMNIVOICE_DIR.iterdir())


# ============================================================================
# Model path resolution
# ============================================================================

def list_local_loras() -> list[str]:
    """List locally available LoRA adapters."""
    loras = []
    if LOCAL_LORA_DIR.exists():
        for item in sorted(LOCAL_LORA_DIR.iterdir()):
            if item.is_dir() and any(item.iterdir()):
                loras.append(item.name)
    return loras


def find_model_path() -> str:
    """Find the best available model path."""
    if is_base_model_downloaded():
        print(f"Using local model: {LOCAL_GGUF_DIR}")
        return str(LOCAL_GGUF_DIR)
    print(f"Local model not found. Using remote: {REMOTE_GGUF_REPO}")
    return REMOTE_GGUF_REPO


def find_lora_path(lora_name: str) -> str:
    """Find LoRA adapter path."""
    local_path = LOCAL_LORA_DIR / lora_name
    if local_path.exists():
        if (local_path / "adapter_config.json").exists():
            return str(local_path)
        checkpoints = sorted(
            [d for d in local_path.iterdir() if d.is_dir() and d.name.startswith("checkpoint-")],
            key=lambda d: int(d.name.split("-")[-1]),
            reverse=True,
        )
        for ckpt in checkpoints:
            if (ckpt / "adapter_config.json").exists():
                return str(ckpt)
    if "/" in lora_name:
        return lora_name
    known = KNOWN_LORAS.get(lora_name)
    if known:
        return known["repo"]
    return lora_name


def build_lora_list() -> list[dict]:
    """Build the combined local + remote LoRA list."""
    local_loras = list_local_loras()
    data = []
    for name in local_loras:
        info = KNOWN_LORAS.get(name, {})
        data.append({
            "id": name,
            "name": info.get("name", name.replace("-", " ").title()),
            "source": "local",
            "downloaded": True,
        })
    for name, info in KNOWN_LORAS.items():
        if name not in local_loras:
            data.append({
                "id": name,
                "name": info["name"],
                "source": "remote",
                "downloaded": False,
            })
    return data


# ============================================================================
# Audio helpers
# ============================================================================

def save_audio_to_disk(audio_data: np.ndarray, sample_rate: int, voice: str = "unknown", text: str = "") -> str:
    """Save generated audio to outputs/ directory. Returns filename."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_text = re.sub(r'[^\w\s]', '', text[:30]).strip().replace(' ', '_')
    if not safe_text:
        safe_text = "audio"
    filename = f"{timestamp}_{voice}_{safe_text}.wav"
    filepath = OUTPUTS_DIR / filename
    sf.write(str(filepath), audio_data, sample_rate, format='WAV')
    print(f"   [SAVE] Audio saved: {filename}")
    return filename


def audio_to_response(audio_data: np.ndarray, sample_rate: int) -> StreamingResponse:
    """Convert audio array to WAV StreamingResponse."""
    buffer = io.BytesIO()
    sf.write(buffer, audio_data, sample_rate, format='WAV')
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="audio/wav")


def normalize_audio(audio_data: np.ndarray) -> np.ndarray:
    """Normalize audio to float32 with peak <= 1.0."""
    if audio_data.dtype != np.float32:
        audio_data = audio_data.astype(np.float32)
    if np.abs(audio_data).max() > 1.0:
        audio_data = audio_data / np.abs(audio_data).max()
    return audio_data


def unpack_audio_result(result, default_engine) -> tuple[np.ndarray, int]:
    """Unpack OmniVoice result (may be tuple or array)."""
    if isinstance(result, tuple):
        return result[0], result[1]
    return result, getattr(default_engine, 'sample_rate', 24000)


def save_upload_to_tempfile(upload) -> str:
    """Save UploadFile to a temporary file. Returns the temp file path."""
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    shutil.copyfileobj(upload.file, tmp)
    tmp.close()
    return tmp.name


# ============================================================================
# Hardware detection
# ============================================================================

def has_cuda() -> bool:
    """Check if CUDA is available."""
    try:
        import torch
        return torch.cuda.is_available()
    except Exception:
        return False


# ============================================================================
# TTS generation
# ============================================================================

def generate_audio_with_pause(tts_engine, text: str, voice=None, silence_p: float = 0.15, emotion_tag: str = None) -> np.ndarray:
    """Generate audio with [pause:XXX] marker support."""
    parts = re.split(r'\[pause:(\d+(?:\.\d+)?)(s|ms)?\]', text)

    if len(parts) == 1:
        return tts_engine.infer(text, voice=voice, silence_p=silence_p, emotion_tag=emotion_tag)

    audio_segments = []
    i = 0
    while i < len(parts):
        segment = parts[i].strip()
        if segment:
            print(f"   [PAUSE] Generating segment: '{segment[:50]}...'")
            audio = tts_engine.infer(segment, voice=voice, silence_p=silence_p, emotion_tag=emotion_tag)
            audio_segments.append(audio)

        if i + 1 < len(parts):
            duration = float(parts[i + 1])
            unit = parts[i + 2] if i + 2 < len(parts) else "ms"
            pause_seconds = duration if unit == "s" else duration / 1000.0
            silence = np.zeros(int(pause_seconds * tts_engine.sample_rate), dtype=np.float32)
            audio_segments.append(silence)
            print(f"   [PAUSE] Inserted {pause_seconds}s silence")
            i += 3
        else:
            i += 1

    return np.concatenate(audio_segments)


# ============================================================================
# Downloads
# ============================================================================

def download_with_progress(repo_id: str, local_dir: str, key: str, allow_patterns: list = None):
    """Download a repo with progress tracking (runs in background thread)."""
    try:
        state.download_progress[key]["status"] = "downloading"
        state.download_progress[key]["message"] = f"Dang tai {repo_id}..."
        state.download_progress[key]["progress"] = 10

        from huggingface_hub import snapshot_download

        kwargs = {
            "repo_id": repo_id,
            "local_dir": local_dir,
            "ignore_patterns": ["*.md", "*.txt", "*.pt", "*.pth", "optimizer*", "scheduler*", "rng_state*", "trainer_state*", "training_args*"],
        }
        if allow_patterns:
            kwargs["allow_patterns"] = allow_patterns

        snapshot_download(**kwargs)

        state.download_progress[key]["status"] = "done"
        state.download_progress[key]["progress"] = 100
        state.download_progress[key]["message"] = "Tai xong!"
    except Exception as e:
        state.download_progress[key]["status"] = "error"
        state.download_progress[key]["message"] = str(e)


# ============================================================================
# Network
# ============================================================================

def find_available_port(start_port: int = 8000, max_tries: int = 10) -> int:
    """Find an available port, starting from start_port."""
    for port in range(start_port, start_port + max_tries):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            sock.bind(('127.0.0.1', port))
            sock.close()
            return port
        except OSError:
            continue
    return start_port
