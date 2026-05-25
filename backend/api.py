import os
import sys
import io
import re
import socket
import threading
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import soundfile as sf
import uvicorn
import numpy as np
import tempfile
import shutil
from pathlib import Path

# Import the Vieneu TTS engine
try:
    from vieneu import Vieneu
except ImportError:
    print("Error: 'vieneu' package not found. Please ensure it is installed.")
    Vieneu = None

# Global state with thread safety
tts = None
_tts_lock = threading.Lock()
current_lora = None
current_model_type = "gguf"  # "gguf", "pytorch", "turbo"

# OmniVoice separate state
omnivoice_tts = None
_omnivoice_lock = threading.Lock()
omnivoice_loaded = False

# Download progress tracking
download_progress = {
    "base": {"status": "idle", "progress": 0, "message": ""},
    "lora": {"status": "idle", "progress": 0, "message": ""},
}


# ============================================================================
# Pydantic Request Models
# ============================================================================

class SwitchModelRequest(BaseModel):
    type: str = Field(..., pattern="^(gguf|pytorch|turbo)$")


class DownloadLoraRequest(BaseModel):
    name: str = Field(..., min_length=1)


class LoadLoraRequest(BaseModel):
    name: str = Field(..., min_length=1)


class DialogueLine(BaseModel):
    text: str
    voice: str
    pause_after: float = 0.5
    emotion: str = "natural"


class DialogueRequest(BaseModel):
    lines: List[DialogueLine]


class SpeechRequest(BaseModel):
    text: str
    voice: Optional[str] = None
    stream: bool = False
    speed: float = 1.0
    silence_p: float = 0.15
    emotion: str = "natural"


# ============================================================================
# App Lifespan
# ============================================================================

@asynccontextmanager
async def lifespan(app):
    global tts
    print("=" * 50)
    print("Starting ThanhVinhStudio v4.0 (VieNeu-TTS-v2)...")
    print("=" * 50)

    if not Vieneu:
        print("[WARNING] Vieneu package missing. Running in mock mode.")
        yield
        return

    if is_base_model_downloaded():
        try:
            with _tts_lock:
                tts = Vieneu(
                    mode="standard",
                    backbone_repo=str(LOCAL_GGUF_DIR),
                    gguf_filename=GGUF_FILENAME,
                    backbone_device="cpu",
                    codec_device="cpu",
                    emotion="natural",
                )
            print("[OK] VieNeu-TTS-v2 model loaded from local files.")
            print(f"[OK] Outputs directory: {OUTPUTS_DIR}")
        except Exception as e:
            print(f"[ERROR] Failed to load local model: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("[WARNING] No local model found. Use the UI to download.")

    yield


app = FastAPI(title="ThanhVinhStudio API", version="4.0.1", lifespan=lifespan)

# Enable CORS — restrict to local dev ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "tauri://localhost",
        "https://tauri.localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base directory: supports both dev mode and PyInstaller frozen mode
if getattr(sys, 'frozen', False):
    BUNDLE_DIR = Path(sys._MEIPASS)
else:
    BUNDLE_DIR = Path(__file__).resolve().parent.parent

# Model paths (bundled with app)
MODELS_DIR = BUNDLE_DIR / "models"
LOCAL_GGUF_DIR = MODELS_DIR / "base" / "VieNeu-TTS-v2-gguf"
LOCAL_LORA_DIR = MODELS_DIR / "lora"

# V2 model config
GGUF_FILENAME = "VieNeu-TTS-v2-Q4-K-M.gguf"

# Output directory: use app data in packaged mode, local in dev mode
if getattr(sys, 'frozen', False):
    if sys.platform == "win32":
        APP_DATA = Path(os.environ.get("LOCALAPPDATA", Path.home())) / "ThanhVinhStudio"
    else:
        APP_DATA = Path.home() / "Library" / "Application Support" / "ThanhVinhStudio"
    OUTPUTS_DIR = APP_DATA / "outputs"
else:
    OUTPUTS_DIR = BUNDLE_DIR / "outputs"
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

# Remote repos
REMOTE_GGUF_REPO = "pnnbao-ump/VieNeu-TTS-v2"
REMOTE_PYTORCH_REPO = "pnnbao-ump/VieNeu-TTS-v2"

KNOWN_LORAS = {
    "ngoc-huyen": {
        "repo": "luukien/VieNeu-TTS-0.3B-v2",
        "name": "Ngoc Huyen (Vbee)",
    }
}


# ============================================================================
# Helpers
# ============================================================================

def is_base_model_downloaded():
    """Check if base model is available locally."""
    if LOCAL_GGUF_DIR.exists():
        gguf_files = list(LOCAL_GGUF_DIR.glob("*.gguf"))
        return len(gguf_files) > 0
    return False


def list_local_loras():
    """List locally available LoRA adapters."""
    loras = []
    if LOCAL_LORA_DIR.exists():
        for item in sorted(LOCAL_LORA_DIR.iterdir()):
            if item.is_dir() and any(item.iterdir()):
                loras.append(item.name)
    return loras


def find_model_path():
    """Find the best available model path."""
    if is_base_model_downloaded():
        print(f"Using local model: {LOCAL_GGUF_DIR}")
        return str(LOCAL_GGUF_DIR)
    print(f"Local model not found. Using remote: {REMOTE_GGUF_REPO}")
    return REMOTE_GGUF_REPO


def find_lora_path(lora_name: str):
    """Find LoRA adapter path."""
    local_path = LOCAL_LORA_DIR / lora_name
    if local_path.exists():
        # Check if adapter files are directly here
        if (local_path / "adapter_config.json").exists():
            return str(local_path)
        # Check checkpoint subdirectories (pick latest)
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


def save_audio_to_disk(audio_data: np.ndarray, sample_rate: int, voice: str = "unknown", text: str = "") -> str:
    """Save generated audio to outputs/ directory. Returns filename."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    # Sanitize text for filename
    safe_text = re.sub(r'[^\w\s]', '', text[:30]).strip().replace(' ', '_')
    if not safe_text:
        safe_text = "audio"
    filename = f"{timestamp}_{voice}_{safe_text}.wav"
    filepath = OUTPUTS_DIR / filename
    sf.write(str(filepath), audio_data, sample_rate, format='WAV')
    print(f"   [SAVE] Audio saved: {filename}")
    return filename


def _download_with_progress(repo_id: str, local_dir: str, key: str, allow_patterns: list = None):
    """Download a repo with progress tracking (runs in background thread)."""
    try:
        download_progress[key]["status"] = "downloading"
        download_progress[key]["message"] = f"Dang tai {repo_id}..."
        download_progress[key]["progress"] = 10

        from huggingface_hub import snapshot_download

        kwargs = {
            "repo_id": repo_id,
            "local_dir": local_dir,
            "ignore_patterns": ["*.md", "*.txt", "*.pt", "*.pth", "optimizer*", "scheduler*", "rng_state*", "trainer_state*", "training_args*"],
        }
        if allow_patterns:
            kwargs["allow_patterns"] = allow_patterns

        snapshot_download(**kwargs)

        download_progress[key]["status"] = "done"
        download_progress[key]["progress"] = 100
        download_progress[key]["message"] = "Tai xong!"
    except Exception as e:
        download_progress[key]["status"] = "error"
        download_progress[key]["message"] = str(e)


def _generate_audio_with_pause(text: str, voice=None, silence_p: float = 0.15, emotion_tag: str = None) -> np.ndarray:
    """Generate audio with [pause:XXX] marker support."""
    # Split by pause markers: [pause:500] or [pause:1.5s]
    parts = re.split(r'\[pause:(\d+(?:\.\d+)?)(s|ms)?\]', text)

    if len(parts) == 1:
        # No pause markers, generate normally
        return tts.infer(text, voice=voice, silence_p=silence_p, emotion_tag=emotion_tag)

    # Process segments with pause markers
    audio_segments = []
    i = 0
    while i < len(parts):
        segment = parts[i].strip()
        if segment:
            print(f"   [PAUSE] Generating segment: '{segment[:50]}...'")
            audio = tts.infer(segment, voice=voice, silence_p=silence_p, emotion_tag=emotion_tag)
            audio_segments.append(audio)

        # Check if next part is a pause duration
        if i + 1 < len(parts):
            duration = float(parts[i + 1])
            unit = parts[i + 2] if i + 2 < len(parts) else "ms"
            if unit == "s":
                pause_seconds = duration
            else:
                pause_seconds = duration / 1000.0

            silence = np.zeros(int(pause_seconds * tts.sample_rate), dtype=np.float32)
            audio_segments.append(silence)
            print(f"   [PAUSE] Inserted {pause_seconds}s silence")
            i += 3  # skip duration and unit
        else:
            i += 1

    return np.concatenate(audio_segments)


# ============================================================================
# System Endpoints
# ============================================================================

@app.get("/health")
async def health_check():
    """Simple health check to verify backend is running."""
    return {"status": "ok", "model_loaded": tts is not None}


@app.get("/v1/hardware/detect")
async def detect_hardware():
    """Detect hardware and recommend best model."""
    import platform
    info = {
        "cpu": platform.processor() or "Unknown",
        "ram_gb": 0,
        "os": platform.system(),
    }

    # Check RAM
    try:
        import psutil
        mem = psutil.virtual_memory()
        info["ram_gb"] = round(mem.total / (1024**3), 1)
        info["ram_available_gb"] = round(mem.available / (1024**3), 1)
    except ImportError:
        pass

    # Check CUDA
    has_cuda = _has_cuda()
    info["cuda"] = has_cuda
    info["gpu_name"] = "None"
    info["vram_gb"] = 0

    if has_cuda:
        try:
            import torch
            if torch.cuda.is_available():
                info["gpu_name"] = torch.cuda.get_device_name(0)
                info["vram_gb"] = round(torch.cuda.get_device_properties(0).total_memory / (1024**3), 1)
                info["cuda_version"] = torch.version.cuda
        except Exception:
            pass

    # Recommendation
    if has_cuda and info.get("vram_gb", 0) >= 4:
        recommendation = "pytorch"
        reason = f"GPU {info['gpu_name']} ({info['vram_gb']}GB VRAM) - PyTorch cho chất lượng tốt nhất + hỗ trợ LoRA"
    elif info.get("ram_gb", 0) >= 8:
        recommendation = "gguf"
        reason = f"RAM {info['ram_gb']}GB, không có GPU mạnh - GGUF Q4 chạy CPU, nhẹ và ổn định"
    else:
        recommendation = "turbo"
        reason = f"RAM {info['ram_gb']}GB - Turbo nhẹ nhất, phù hợp máy yếu"

    info["recommendation"] = recommendation
    info["reason"] = reason

    return info


@app.get("/v1/models/available")
async def list_available_models():
    """List available model backends."""
    return {
        "models": [
            {
                "id": "gguf",
                "name": "GGUF Q4 (CPU)",
                "description": "Nhẹ, chạy CPU, chất lượng tốt",
                "supports_lora": False,
                "requires_gpu": False,
            },
            {
                "id": "pytorch",
                "name": "PyTorch (GPU)",
                "description": "Chất lượng cao, hỗ trợ LoRA, cần GPU",
                "supports_lora": True,
                "requires_gpu": True,
            },
            {
                "id": "turbo",
                "name": "Turbo (CPU/GPU)",
                "description": "Model nhẹ 0.1B, nhanh nhất",
                "supports_lora": False,
                "requires_gpu": False,
            },
        ],
        "current": current_model_type,
    }


@app.post("/v1/models/switch")
async def switch_model(body: SwitchModelRequest):
    """Switch between model backends."""
    global tts, current_model_type, current_lora

    model_type = body.type

    if model_type == current_model_type and tts is not None:
        return {"status": "already_loaded", "model": model_type}

    with _tts_lock:
        # Close current model
        if tts and hasattr(tts, 'close'):
            try:
                tts.close()
            except Exception:
                pass
        tts = None
        current_lora = None

        try:
            if model_type == "gguf":
                tts = Vieneu(
                    mode="standard",
                    backbone_repo=str(LOCAL_GGUF_DIR),
                    gguf_filename=GGUF_FILENAME,
                    backbone_device="cpu",
                    codec_device="cpu",
                    emotion="natural",
                )
            elif model_type == "pytorch":
                tts = Vieneu(
                    mode="standard",
                    backbone_repo="pnnbao-ump/VieNeu-TTS-v2",
                    gguf_filename=None,
                    backbone_device="cuda" if _has_cuda() else "cpu",
                    codec_device="cpu",
                    emotion="natural",
                )
            elif model_type == "turbo":
                tts = Vieneu(
                    mode="turbo",
                    backbone_device="cpu",
                    codec_device="cpu",
                )

            current_model_type = model_type
            return {"status": "ok", "model": model_type}

        except Exception as e:
            # Fallback to GGUF
            try:
                tts = Vieneu(
                    mode="standard",
                    backbone_repo=str(LOCAL_GGUF_DIR),
                    gguf_filename=GGUF_FILENAME,
                    backbone_device="cpu",
                    codec_device="cpu",
                    emotion="natural",
                )
                current_model_type = "gguf"
            except Exception:
                pass
            raise HTTPException(status_code=500, detail=f"Failed to load model: {str(e)}")


def _has_cuda():
    """Check if CUDA is available."""
    try:
        import torch
        return torch.cuda.is_available()
    except:
        return False


@app.get("/v1/status")
async def get_status():
    """Get system status: what's downloaded, what's loaded."""
    local_loras = list_local_loras()

    available_loras = []
    for name in local_loras:
        info = KNOWN_LORAS.get(name, {})
        available_loras.append({
            "id": name,
            "name": info.get("name", name.replace("-", " ").title()),
            "source": "local",
            "downloaded": True,
        })
    for name, info in KNOWN_LORAS.items():
        if name not in local_loras:
            available_loras.append({
                "id": name,
                "name": info["name"],
                "source": "remote",
                "downloaded": False,
            })

    return {
        "base_model": {
            "downloaded": is_base_model_downloaded(),
            "loaded": tts is not None,
            "local_path": str(LOCAL_GGUF_DIR),
            "remote_repo": REMOTE_GGUF_REPO,
        },
        "current_model": {
            "type": current_model_type,
            "supports_lora": current_model_type == "pytorch",
        },
        "lora": {
            "active": current_lora,
            "available": available_loras,
        },
        "download_progress": download_progress,
        "outputs_dir": str(OUTPUTS_DIR),
        "saved_audio_count": len(list(OUTPUTS_DIR.glob("*.wav"))),
    }


# ============================================================================
# Download Endpoints
# ============================================================================

@app.post("/v1/download/base")
async def download_base_model():
    """Download the base GGUF model."""
    if is_base_model_downloaded():
        return {"status": "already_downloaded", "message": "Model already exists locally."}

    if download_progress["base"]["status"] == "downloading":
        return {"status": "in_progress", "message": "Download already in progress."}

    LOCAL_GGUF_DIR.mkdir(parents=True, exist_ok=True)
    base_patterns = ["*.gguf", "voices.json"]

    thread = threading.Thread(
        target=_download_with_progress,
        args=(REMOTE_GGUF_REPO, str(LOCAL_GGUF_DIR), "base", base_patterns),
        daemon=True,
    )
    thread.start()

    return {"status": "started", "message": "Download started."}


@app.post("/v1/download/lora")
async def download_lora(body: DownloadLoraRequest):
    """Download a LoRA adapter."""
    lora_name = body.name

    lora_path = LOCAL_LORA_DIR / lora_name
    if lora_path.exists() and any(lora_path.iterdir()):
        return {"status": "already_downloaded", "message": f"LoRA '{lora_name}' already exists."}

    if download_progress["lora"]["status"] == "downloading":
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
        target=_download_with_progress,
        args=(known["repo"], str(lora_path), "lora", adapter_patterns),
        daemon=True,
    )
    thread.start()

    return {"status": "started", "message": f"Downloading LoRA: {lora_name}"}


@app.get("/v1/download/progress")
async def get_download_progress():
    """Get current download progress."""
    return download_progress


# ============================================================================
# Model & Voice Endpoints
# ============================================================================

@app.post("/v1/models/reload")
async def reload_model():
    """Reload the TTS model (after download completes)."""
    global tts

    if not Vieneu:
        return JSONResponse(status_code=500, content={"error": "vieneu package not installed"})

    if not is_base_model_downloaded():
        return JSONResponse(status_code=400, content={"error": "Base model not downloaded yet."})

    try:
        with _tts_lock:
            if tts and hasattr(tts, 'close'):
                tts.close()
            tts = Vieneu(
                backbone_repo=str(LOCAL_GGUF_DIR),
                codec_device="cpu",
            )
        return {"status": "ok", "message": "Model reloaded successfully."}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/v1/models")
async def list_models():
    """List available voices."""
    if not tts:
        return JSONResponse(status_code=503, content={"error": "TTS engine not initialized"})

    try:
        voices = tts.list_preset_voices()
        data = [{"id": voice_id, "name": description} for description, voice_id in voices]
        return {"data": data}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/v1/lora")
async def list_loras():
    """List available LoRA adapters."""
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
            data.append({"id": name, "name": info["name"], "source": "remote", "downloaded": False})

    return {"data": data, "active": current_lora}


@app.post("/v1/lora/load")
async def load_lora(body: LoadLoraRequest):
    """Load a LoRA adapter."""
    global tts, current_lora, current_model_type

    lora_name = body.name

    if not tts:
        return JSONResponse(status_code=503, content={"error": "TTS engine not initialized"})

    with _tts_lock:
        is_quantized = getattr(tts, '_is_quantized_model', False)
        if is_quantized:
            print("Switching to PyTorch backend for LoRA...")
            try:
                if hasattr(tts, 'close'):
                    tts.close()
                tts = Vieneu(backbone_repo=REMOTE_PYTORCH_REPO, gguf_filename=None)
                current_model_type = "pytorch"
            except Exception as e:
                return JSONResponse(status_code=500, content={"error": f"Cannot load PyTorch model: {e}"})

        lora_path = find_lora_path(lora_name)
        try:
            tts.load_lora_adapter(lora_path)
            current_lora = lora_name

            # Reload voices from original model after LoRA load
            try:
                if current_model_type == "gguf":
                    tts._load_voices(str(LOCAL_GGUF_DIR), clear_existing=False)
                else:
                    tts._load_voices(REMOTE_PYTORCH_REPO, clear_existing=False)
                print(f"   [LORA] Voices reloaded after LoRA load")
            except Exception as voice_err:
                print(f"   [LORA] Warning: Could not reload voices: {voice_err}")

            return {"status": "ok", "lora": lora_name}
        except Exception as e:
            return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/v1/lora/unload")
async def unload_lora():
    """Unload current LoRA."""
    global current_lora
    if not tts:
        return JSONResponse(status_code=503, content={"error": "TTS engine not initialized"})
    with _tts_lock:
        try:
            tts.unload_lora_adapter()
            current_lora = None
            return {"status": "ok"}
        except Exception as e:
            return JSONResponse(status_code=500, content={"error": str(e)})


# ============================================================================
# Audio Endpoints
# ============================================================================

@app.get("/v1/audio/samples/{voice_id}")
async def get_voice_sample(voice_id: str):
    """Return preview audio for a preset voice."""
    if not tts:
        return JSONResponse(status_code=503, content={"error": "TTS engine not initialized"})

    try:
        voice_data = tts.get_preset_voice(voice_id)
    except ValueError:
        return JSONResponse(status_code=404, content={"error": f"Voice '{voice_id}' not found"})

    assets_dir = Path(__file__).resolve().parent.parent / "vieneu" / "assets" / "samples"
    if assets_dir.exists():
        for file in assets_dir.iterdir():
            if file.suffix == ".wav" and voice_id.lower() in file.stem.lower():
                return FileResponse(file, media_type="audio/wav")

    try:
        audio_data = tts.infer(text="Xin chao, toi la giong noi tieng Viet.", voice=voice_data)
        buffer = io.BytesIO()
        sf.write(buffer, audio_data, tts.sample_rate, format='WAV')
        buffer.seek(0)
        return StreamingResponse(buffer, media_type="audio/wav")
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/v1/audio/speech")
async def generate_speech(request: SpeechRequest):
    """Generate audio from text with [pause:XXX] marker support."""
    if not tts and Vieneu:
        raise HTTPException(status_code=503, detail="TTS engine not ready")

    text = request.text
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    if not Vieneu:
        sample_rate = 24000
        audio_data = np.zeros(sample_rate * 2, dtype=np.float32)
        buffer = io.BytesIO()
        sf.write(buffer, audio_data, sample_rate, format='WAV')
        buffer.seek(0)
        return StreamingResponse(buffer, media_type="audio/wav")

    try:
        voice = None
        if request.voice:
            try:
                with _tts_lock:
                    voice = tts.get_preset_voice(request.voice)
            except ValueError:
                pass

        # Map emotion string to tag
        emotion_tag = "<|emotion_0|>" if request.emotion == "natural" else None

        if request.stream:
            def audio_stream_generator():
                with _tts_lock:
                    for chunk in tts.infer_stream(text, voice=voice, temperature=0.3, emotion_tag=emotion_tag):
                        if chunk is not None and len(chunk) > 0:
                            yield (chunk * 32767).astype(np.int16).tobytes()
            return StreamingResponse(audio_stream_generator(), media_type="application/octet-stream")
        else:
            with _tts_lock:
                audio_data = _generate_audio_with_pause(text, voice=voice, silence_p=request.silence_p, emotion_tag=emotion_tag)

            # Save to disk
            voice_name = request.voice or "default"
            save_audio_to_disk(audio_data, tts.sample_rate, voice_name, text)

            buffer = io.BytesIO()
            sf.write(buffer, audio_data, tts.sample_rate, format='WAV')
            buffer.seek(0)
            return StreamingResponse(buffer, media_type="audio/wav")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/audio/clone")
async def clone_speech(
    text: str = Form(...),
    reference_text: str = Form(...),
    reference_audio: UploadFile = File(...)
):
    """Zero-shot Voice Cloning."""
    if not tts and Vieneu:
        raise HTTPException(status_code=503, detail="TTS engine not ready")

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            shutil.copyfileobj(reference_audio.file, tmp)
            tmp_path = tmp.name

        with _tts_lock:
            ref_codes = tts.encode_reference(tmp_path)
            os.remove(tmp_path)
            audio_data = tts.infer(text, ref_codes=ref_codes, ref_text=reference_text)

        # Save to disk
        save_audio_to_disk(audio_data, tts.sample_rate, "clone", text)

        buffer = io.BytesIO()
        sf.write(buffer, audio_data, tts.sample_rate, format='WAV')
        buffer.seek(0)
        return StreamingResponse(buffer, media_type="audio/wav")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Dialogue Endpoints
# ============================================================================

@app.post("/v1/audio/dialogue")
async def generate_dialogue(request: DialogueRequest):
    """Generate dialogue/conversation audio with multiple speakers."""
    if not tts:
        raise HTTPException(status_code=503, detail="TTS engine not ready")

    if not request.lines:
        raise HTTPException(status_code=400, detail="At least one dialogue line is required")

    try:
        audio_segments = []

        with _tts_lock:
            for i, line in enumerate(request.lines):
                print(f"   [DIALOGUE] Line {i+1}/{len(request.lines)}: voice={line.voice}, text='{line.text[:50]}...'")

                voice = None
                try:
                    voice = tts.get_preset_voice(line.voice)
                except ValueError:
                    pass

                emotion_tag = "<|emotion_0|>" if line.emotion == "natural" else None
                audio = _generate_audio_with_pause(line.text, voice=voice, silence_p=0.1, emotion_tag=emotion_tag)
                audio_segments.append(audio)

                if line.pause_after > 0 and i < len(request.lines) - 1:
                    silence = np.zeros(int(line.pause_after * tts.sample_rate), dtype=np.float32)
                    audio_segments.append(silence)

        full_audio = np.concatenate(audio_segments)

        voice_names = "_".join(set(l.voice for l in request.lines))
        first_text = request.lines[0].text[:20]
        save_audio_to_disk(full_audio, tts.sample_rate, f"dialogue_{voice_names}", first_text)

        buffer = io.BytesIO()
        sf.write(buffer, full_audio, tts.sample_rate, format='WAV')
        buffer.seek(0)
        return StreamingResponse(buffer, media_type="audio/wav")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Audio History Endpoints
# ============================================================================

@app.get("/v1/audio/history")
async def list_audio_history():
    """List all saved audio files."""
    files = []
    for f in sorted(OUTPUTS_DIR.glob("*.wav"), key=lambda x: x.stat().st_mtime, reverse=True):
        stat = f.stat()
        files.append({
            "filename": f.name,
            "size_kb": round(stat.st_size / 1024, 1),
            "created": datetime.fromtimestamp(stat.st_mtime).isoformat(),
        })
    return {"files": files, "total": len(files)}


@app.get("/v1/audio/file/{filename}")
async def get_audio_file(filename: str):
    """Serve a saved audio file."""
    filepath = (OUTPUTS_DIR / filename).resolve()
    try:
        filepath.relative_to(OUTPUTS_DIR.resolve())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid path")
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath, media_type="audio/wav", filename=filename)


@app.delete("/v1/audio/file/{filename}")
async def delete_audio_file(filename: str):
    """Delete a saved audio file."""
    filepath = (OUTPUTS_DIR / filename).resolve()
    try:
        filepath.relative_to(OUTPUTS_DIR.resolve())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid path")
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    filepath.unlink()
    return {"status": "ok", "message": f"Deleted {filename}"}


# ============================================================================
# OmniVoice — Separate TTS Engine
# ============================================================================

class OmniVoiceTTSRequest(BaseModel):
    text: str = Field(..., min_length=1)
    language: str = Field(default="vie", description="Language code (ISO 639-3)")
    speed: float = Field(default=1.0, ge=0.5, le=2.0)


class OmniVoiceCloneRequest(BaseModel):
    text: str = Field(..., min_length=1)
    language: str = Field(default="vie")
    speed: float = Field(default=1.0, ge=0.5, le=2.0)


@app.post("/v1/omnivoice/load")
async def load_omnivoice():
    """Load OmniVoice model."""
    global omnivoice_tts, omnivoice_loaded

    if omnivoice_loaded and omnivoice_tts is not None:
        return {"status": "already_loaded"}

    with _omnivoice_lock:
        try:
            from omnivoice import OmniVoice as OmniVoiceModel
        except ImportError:
            raise HTTPException(status_code=400, detail="OmniVoice not installed. Run: pip install omnivoice")

        try:
            _device = "cuda:0" if _has_cuda() else "cpu"
            _dtype = "float16" if _has_cuda() else "float32"
            omnivoice_tts = OmniVoiceModel.from_pretrained("k2-fsa/OmniVoice", device_map=_device, dtype=_dtype)
            omnivoice_loaded = True
            return {"status": "ok", "device": _device}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to load OmniVoice: {str(e)}")


@app.post("/v1/omnivoice/unload")
async def unload_omnivoice():
    """Unload OmniVoice model to free memory."""
    global omnivoice_tts, omnivoice_loaded

    with _omnivoice_lock:
        if omnivoice_tts is not None:
            try:
                del omnivoice_tts
            except Exception:
                pass
        omnivoice_tts = None
        omnivoice_loaded = False

    if _has_cuda():
        try:
            import torch
            torch.cuda.empty_cache()
        except Exception:
            pass

    return {"status": "ok"}


@app.get("/v1/omnivoice/status")
async def omnivoice_status():
    """Check OmniVoice model status."""
    return {
        "loaded": omnivoice_loaded,
        "has_cuda": _has_cuda(),
    }


@app.post("/v1/omnivoice/tts")
async def omnivoice_tts_generate(request: OmniVoiceTTSRequest):
    """Generate speech with OmniVoice."""
    if not omnivoice_loaded or omnivoice_tts is None:
        raise HTTPException(status_code=503, detail="OmniVoice not loaded. Call /v1/omnivoice/load first.")

    try:
        with _omnivoice_lock:
            audio_data = omnivoice_tts.generate(
                text=request.text,
                language=request.language,
                speed=request.speed,
            )

        if isinstance(audio_data, tuple):
            audio_data, sample_rate = audio_data
        else:
            sample_rate = getattr(omnivoice_tts, 'sample_rate', 24000)

        if audio_data.dtype != np.float32:
            audio_data = audio_data.astype(np.float32)
        if np.abs(audio_data).max() > 1.0:
            audio_data = audio_data / np.abs(audio_data).max()

        # Save to disk
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"omnivoice_{timestamp}.wav"
        filepath = OUTPUTS_DIR / filename
        sf.write(str(filepath), audio_data, sample_rate, format='WAV')

        buffer = io.BytesIO()
        sf.write(buffer, audio_data, sample_rate, format='WAV')
        buffer.seek(0)
        return StreamingResponse(buffer, media_type="audio/wav")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/omnivoice/clone")
async def omnivoice_clone(
    text: str = Form(...),
    reference_audio: UploadFile = File(...),
    language: str = Form(default="vie"),
    speed: float = Form(default=1.0),
):
    """Voice clone with OmniVoice."""
    if not omnivoice_loaded or omnivoice_tts is None:
        raise HTTPException(status_code=503, detail="OmniVoice not loaded. Call /v1/omnivoice/load first.")

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            shutil.copyfileobj(reference_audio.file, tmp)
            tmp_path = tmp.name

        with _omnivoice_lock:
            audio_data = omnivoice_tts.clone(
                text=text,
                reference_audio=tmp_path,
                language=language,
                speed=speed,
            )
        os.remove(tmp_path)

        if isinstance(audio_data, tuple):
            audio_data, sample_rate = audio_data
        else:
            sample_rate = getattr(omnivoice_tts, 'sample_rate', 24000)

        if audio_data.dtype != np.float32:
            audio_data = audio_data.astype(np.float32)
        if np.abs(audio_data).max() > 1.0:
            audio_data = audio_data / np.abs(audio_data).max()

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"omnivoice_clone_{timestamp}.wav"
        filepath = OUTPUTS_DIR / filename
        sf.write(str(filepath), audio_data, sample_rate, format='WAV')

        buffer = io.BytesIO()
        sf.write(buffer, audio_data, sample_rate, format='WAV')
        buffer.seek(0)
        return StreamingResponse(buffer, media_type="audio/wav")

    except Exception as e:
        if 'tmp_path' in dir() and os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Server Startup with Port Conflict Handling
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
    return start_port  # fallback


# ============================================================================
# Static File Serving (for packaged app)
# ============================================================================

STATIC_DIR = BUNDLE_DIR / "frontend" / "out"
if STATIC_DIR.exists():
    from fastapi.staticfiles import StaticFiles
    from starlette.responses import RedirectResponse

    # Redirect /studio to /studio.html (Next.js static export puts it at root level)
    @app.get("/studio")
    async def studio_redirect():
        return RedirectResponse(url="/studio.html")

    # Mount static files - serves index.html for /, studio.html for /studio.html, etc.
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")


def run_server(host: str = "127.0.0.1", port: int = 8000):
    """Start the server. Used by both __main__ and the desktop launcher."""
    uvicorn.run(app, host=host, port=port, log_level="warning")


if __name__ == "__main__":
    port = find_available_port(8000)
    if port != 8000:
        print(f"[WARNING] Port 8000 is busy. Using port {port} instead.")
    run_server(port=port)
