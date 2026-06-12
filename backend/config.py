"""Application configuration: paths, constants, known models."""

import os
import sys
import json
from pathlib import Path

# ─── App metadata ────────────────────────────────────────────────────────────
APP_TITLE = "ThanhVinhStudio API"
APP_VERSION = "4.0.1"
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8000

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "tauri://localhost",
    "https://tauri.localhost",
]


# ─── Base directory ──────────────────────────────────────────────────────────
if getattr(sys, 'frozen', False):
    BUNDLE_DIR = Path(sys._MEIPASS)
else:
    BUNDLE_DIR = Path(__file__).resolve().parent.parent

# ─── Model paths ─────────────────────────────────────────────────────────────
if getattr(sys, 'frozen', False):
    APP_DATA = Path(sys.executable).resolve().parent
else:
    APP_DATA = BUNDLE_DIR

MODELS_DIR = APP_DATA / "models"
LOCAL_GGUF_DIR = MODELS_DIR / "base" / "VieNeu-TTS-v2-gguf"
LOCAL_V3_DIR = MODELS_DIR / "base" / "VieNeu-TTS-v3-Turbo"
LOCAL_LORA_DIR = MODELS_DIR / "lora"
LOCAL_OMNIVOICE_DIR = MODELS_DIR / "omnivoice"

GGUF_FILENAME = "VieNeu-TTS-v2-Q4-K-M.gguf"

# ─── Output directory ────────────────────────────────────────────────────────
DEFAULT_OUTPUTS_DIR = APP_DATA / "outputs"
SETTINGS_FILE = APP_DATA / "settings.json"


def get_outputs_dir() -> Path:
    """Return the configured audio output directory, falling back to app/outputs."""
    output_dir = DEFAULT_OUTPUTS_DIR
    try:
        if SETTINGS_FILE.exists():
            settings = json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))
            configured = settings.get("output_dir")
            if configured:
                output_dir = Path(configured).expanduser()
    except Exception:
        output_dir = DEFAULT_OUTPUTS_DIR

    output_dir.mkdir(parents=True, exist_ok=True)
    return output_dir


def set_outputs_dir(path: str) -> Path:
    """Persist and return a writable audio output directory."""
    output_dir = Path(path).expanduser().resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    test_file = output_dir / ".write_test"
    test_file.write_text("ok", encoding="utf-8")
    test_file.unlink()

    settings = {}
    if SETTINGS_FILE.exists():
        try:
            settings = json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))
        except Exception:
            settings = {}
    settings["output_dir"] = str(output_dir)
    SETTINGS_FILE.write_text(json.dumps(settings, ensure_ascii=False, indent=2), encoding="utf-8")
    return output_dir


OUTPUTS_DIR = get_outputs_dir()

SAVED_VOICES_DIR = APP_DATA / "saved_voices"
SAVED_VOICES_DIR.mkdir(parents=True, exist_ok=True)

# ─── Remote repos ────────────────────────────────────────────────────────────
REMOTE_GGUF_REPO = "pnnbao-ump/VieNeu-TTS-v2"
REMOTE_PYTORCH_REPO = "pnnbao-ump/VieNeu-TTS-v2"
REMOTE_OMNIVOICE_REPO = "k2-fsa/OmniVoice"

# ─── LoRA registry ──────────────────────────────────────────────────────────
KNOWN_LORAS = {
    "ngoc-huyen": {
        "repo": "luukien/VieNeu-TTS-0.3B-v2",
        "name": "Ngoc Huyen (Vbee)",
    }
}

# ─── TTS defaults ────────────────────────────────────────────────────────────
DEFAULT_SILENCE_P = 0.15
DEFAULT_SPEED = 1.0
DEFAULT_TEMPERATURE = 0.3
NEUTRAL_EMOTION_TAG = "<|emotion_0|>"
DEFAULT_SAMPLE_TEXT = "Xin chao, toi la giong noi tieng Viet."

# ─── eSpeak ──────────────────────────────────────────────────────────────────
ESPEAK_WIN_PATH = r"C:\Program Files\eSpeak NG\espeak-ng.exe"

# ─── Download ────────────────────────────────────────────────────────────────
DOWNLOAD_IGNORE_PATTERNS = [
    "*.md", "*.txt", "*.pt", "*.pth",
    "optimizer*", "scheduler*", "rng_state*",
    "trainer_state*", "training_args*",
]
