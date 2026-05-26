"""Application configuration: paths, constants, known models."""

import os
import sys
from pathlib import Path

# Base directory: supports both dev mode and PyInstaller frozen mode
if getattr(sys, 'frozen', False):
    BUNDLE_DIR = Path(sys._MEIPASS)
else:
    BUNDLE_DIR = Path(__file__).resolve().parent.parent

# Model paths (bundled with app)
MODELS_DIR = BUNDLE_DIR / "models"
LOCAL_GGUF_DIR = MODELS_DIR / "base" / "VieNeu-TTS-v2-gguf"
LOCAL_LORA_DIR = MODELS_DIR / "lora"
LOCAL_OMNIVOICE_DIR = MODELS_DIR / "omnivoice"

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
REMOTE_OMNIVOICE_REPO = "k2-fsa/OmniVoice"

KNOWN_LORAS = {
    "ngoc-huyen": {
        "repo": "luukien/VieNeu-TTS-0.3B-v2",
        "name": "Ngoc Huyen (Vbee)",
    }
}
