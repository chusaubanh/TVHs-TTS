#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"
export UV_LINK_MODE=copy

echo "==================================================="
echo "    ThanhVinh Studio - Installation"
echo "==================================================="
echo
echo "If installation fails, copy the full terminal output and send it to support."
echo

echo "[1/7] Checking uv..."
if ! command -v uv >/dev/null 2>&1; then
    echo "   uv not found. Installing..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
fi
echo "   uv: $(uv --version)"

echo
echo "[2/7] Checking Node.js..."
if ! command -v node >/dev/null 2>&1; then
    echo "   Node.js not found."
    if [[ "${OSTYPE:-}" == "darwin"* ]] && command -v brew >/dev/null 2>&1; then
        echo "   Installing Node.js via Homebrew..."
        brew install node@20 || brew install node
        export PATH="/opt/homebrew/opt/node@20/bin:/usr/local/opt/node@20/bin:$PATH"
    elif command -v apt-get >/dev/null 2>&1; then
        echo "   Installing Node.js 20 via NodeSource..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif command -v dnf >/dev/null 2>&1; then
        echo "   Installing Node.js via dnf..."
        sudo dnf install -y nodejs npm
    else
        echo "   [ERROR] Please install Node.js 20+ from https://nodejs.org/"
        exit 1
    fi
fi
echo "   node: $(node --version)"
echo "   npm:  $(npm --version)"

echo
echo "[3/7] Checking eSpeak NG..."
if ! command -v espeak-ng >/dev/null 2>&1; then
    echo "   eSpeak NG not found."
    if [[ "${OSTYPE:-}" == "darwin"* ]] && command -v brew >/dev/null 2>&1; then
        brew install espeak-ng
    elif command -v apt-get >/dev/null 2>&1; then
        sudo apt-get update
        sudo apt-get install -y espeak-ng
    elif command -v dnf >/dev/null 2>&1; then
        sudo dnf install -y espeak-ng
    else
        echo "   [WARNING] Please install eSpeak NG manually:"
        echo "   https://github.com/espeak-ng/espeak-ng/releases"
    fi
else
    echo "   eSpeak NG found."
fi

echo
echo "[4/7] Setting up Python environment..."
if [ ! -d ".venv" ]; then
    uv venv
else
    echo "   Virtual environment already exists."
fi

echo "   Installing Python dependencies from uv.lock..."
uv sync --frozen

echo "   Repairing known fragile dependencies: vieneu and sea-g2p..."
uv pip install --force-reinstall vieneu==2.7.0 sea-g2p==0.7.5

echo "   Verifying Python imports..."
uv run --frozen python -c "from sea_g2p import Normalizer; from vieneu import Vieneu; print('Python dependencies OK')"

echo
echo "[5/7] Setting up frontend dependencies..."
rm -f frontend/.next/dev/lock
rm -rf frontend/.next/dev
(
    cd frontend
    npm ci --no-audit --no-fund
    npm run build
)

echo
echo "[6/7] Downloading OmniVoice model..."
echo "   This is optional and large (~1.5GB)."
if [ -d "models/omnivoice" ] && [ "$(ls -A models/omnivoice 2>/dev/null)" ]; then
    echo "   OmniVoice model already exists, skipping."
else
    printf "   Download OmniVoice now? [y/N]: "
    read -r answer
    case "$answer" in
        y|Y|yes|YES)
            uv run --frozen python -c "from huggingface_hub import snapshot_download; snapshot_download('k2-fsa/OmniVoice', local_dir='models/omnivoice', ignore_patterns=['*.md','*.txt'])" || {
                echo "   [WARNING] Failed to download OmniVoice. You can retry later from the app."
            }
            ;;
        *)
            echo "   Skipped OmniVoice download."
            ;;
    esac
fi

echo
echo "[7/7] Final backend verification..."
uv run --frozen python -m compileall backend

echo
echo "==================================================="
echo "    Installation Complete!"
echo
echo "    Run ./start.sh to launch the application."
echo "    If anything gets stuck later, run ./repair.sh."
echo "==================================================="
