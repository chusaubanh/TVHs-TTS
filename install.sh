#!/usr/bin/env bash
set -e

echo "==================================================="
echo "    ThanhVinh Studio - Installation"
echo "==================================================="
echo

# ============================================================
# 1. Check / Install uv (Astral)
# ============================================================
echo "[1/6] Checking uv..."
if ! command -v uv &>/dev/null; then
    echo "   uv not found. Installing..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
    echo "   uv installed successfully."
else
    echo "   uv found: $(uv --version)"
fi

# ============================================================
# 2. Check / Install Node.js
# ============================================================
echo
echo "[2/6] Checking Node.js..."
if ! command -v node &>/dev/null; then
    echo "   Node.js not found."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &>/dev/null; then
            echo "   Installing via Homebrew..."
            brew install node@20
        else
            echo "   [ERROR] Please install Node.js from https://nodejs.org/"
            exit 1
        fi
    else
        echo "   [ERROR] Please install Node.js from https://nodejs.org/"
        echo "   Or use: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs"
        exit 1
    fi
else
    echo "   Node.js found: $(node --version)"
fi

# ============================================================
# 3. Check / Install eSpeak NG
# ============================================================
echo
echo "[3/6] Checking eSpeak NG..."
if ! command -v espeak-ng &>/dev/null; then
    echo "   eSpeak NG not found."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &>/dev/null; then
            echo "   Installing via Homebrew..."
            brew install espeak-ng
        else
            echo "   [WARNING] Please install Homebrew first, then: brew install espeak-ng"
        fi
    elif command -v apt-get &>/dev/null; then
        echo "   Installing via apt..."
        sudo apt-get update && sudo apt-get install -y espeak-ng
    elif command -v dnf &>/dev/null; then
        echo "   Installing via dnf..."
        sudo dnf install -y espeak-ng
    else
        echo "   [WARNING] Please install eSpeak NG manually:"
        echo "   https://github.com/espeak-ng/espeak-ng/releases"
    fi
else
    echo "   eSpeak NG found."
fi

# ============================================================
# 4. Setup Python Environment (Backend)
# ============================================================
echo
echo "[4/6] Setting up Python Environment (Backend)..."
echo "-------------------------------------------"

if [ ! -d ".venv" ]; then
    echo "   Creating virtual environment..."
    uv venv
else
    echo "   Virtual environment already exists."
fi

echo "   Installing Python dependencies (this may take a few minutes)..."
uv sync
echo "   Python dependencies installed."

# ============================================================
# 5. Setup Node.js Environment (Frontend)
# ============================================================
echo
echo "[5/6] Setting up Node.js Environment (Frontend)..."
echo "-------------------------------------------"
cd frontend

if [ -d "node_modules" ]; then
    echo "   node_modules found, skipping npm install."
    echo "   (Delete node_modules and run again if you have issues)"
else
    echo "   Installing Node.js dependencies..."
    npm install
    echo "   Node.js dependencies installed."
fi
cd ..

# ============================================================
# 6. Download OmniVoice Model
# ============================================================
echo
echo "[6/6] Downloading OmniVoice Model..."
echo "-------------------------------------------"
echo "   This will download the OmniVoice TTS model (~1.5GB)."
echo "   You can skip this and download later from the app."
echo

if [ -d "models/omnivoice" ] && [ "$(ls -A models/omnivoice 2>/dev/null)" ]; then
    echo "   OmniVoice model already exists, skipping."
else
    echo "   Downloading OmniVoice from HuggingFace..."
    uv run python -c "from huggingface_hub import snapshot_download; snapshot_download('k2-fsa/OmniVoice', local_dir='models/omnivoice', ignore_patterns=['*.md','*.txt'])" || {
        echo "   [WARNING] Failed to download OmniVoice model."
        echo "   You can download it later from the app (OmniVoice tab)."
    }
fi

# ============================================================
# Done
# ============================================================
echo
echo "==================================================="
echo "    Installation Complete!"
echo
echo '    Run "./start.sh" to launch the application.'
echo
echo "    Prerequisites installed:"
echo "      - uv (Python package manager)"
echo "      - Node.js + npm"
echo "      - eSpeak NG (phonemization)"
echo "      - Python dependencies"
echo "      - Node.js dependencies"
echo "      - OmniVoice model (optional)"
echo
echo "    NOTE: After installation, the app runs fully offline."
echo "    Internet is only needed for the initial model download."
echo "==================================================="
