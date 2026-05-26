"""Application configuration: paths, constants, known models."""

import os
import sys
from pathlib import Path

# ─── App metadata ────────────────────────────────────────────────────────────
APP_TITLE = "ThanhVinhStudio API"
APP_VERSION = "4.0.1"
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8000

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
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
MODELS_DIR = BUNDLE_DIR / "models"
LOCAL_GGUF_DIR = MODELS_DIR / "base" / "VieNeu-TTS-v2-gguf"
LOCAL_LORA_DIR = MODELS_DIR / "lora"
LOCAL_OMNIVOICE_DIR = MODELS_DIR / "omnivoice"

GGUF_FILENAME = "VieNeu-TTS-v2-Q4-K-M.gguf"

# ─── Output directory ────────────────────────────────────────────────────────
if getattr(sys, 'frozen', False):
    if sys.platform == "win32":
        APP_DATA = Path(os.environ.get("LOCALAPPDATA", Path.home())) / "ThanhVinhStudio"
    else:
        APP_DATA = Path.home() / "Library" / "Application Support" / "ThanhVinhStudio"
    OUTPUTS_DIR = APP_DATA / "outputs"
else:
    OUTPUTS_DIR = BUNDLE_DIR / "outputs"
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

SAVED_VOICES_DIR = OUTPUTS_DIR / "saved_voices"
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
