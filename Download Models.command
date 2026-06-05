#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DATA="$SCRIPT_DIR"
MODELS_DIR="$APP_DATA/models"
BASE_DIR="$MODELS_DIR/base/VieNeu-TTS-v2-gguf"
OMNIVOICE_DIR="$MODELS_DIR/omnivoice"

mkdir -p "$BASE_DIR" "$OMNIVOICE_DIR"

echo "ThanhVinhStudio model directory:"
echo "$MODELS_DIR"
echo

download_file() {
  local url="$1"
  local dest="$2"
  mkdir -p "$(dirname "$dest")"
  if [ -s "$dest" ]; then
    echo "Exists: $dest"
    return
  fi
  echo "Downloading: $url"
  curl -L --fail --retry 3 --continue-at - --output "$dest.partial" "$url"
  mv "$dest.partial" "$dest"
}

download_base() {
  download_file \
    "https://huggingface.co/pnnbao-ump/VieNeu-TTS-v2/resolve/main/VieNeu-TTS-v2-Q4-K-M.gguf" \
    "$BASE_DIR/VieNeu-TTS-v2-Q4-K-M.gguf"
  download_file \
    "https://huggingface.co/pnnbao-ump/VieNeu-TTS-v2/resolve/main/voices.json" \
    "$BASE_DIR/voices.json"
}

download_omnivoice() {
  if ! command -v python3 >/dev/null 2>&1; then
    echo "python3 is required to download OmniVoice from the Hugging Face file list."
    echo "You can skip this now and download OmniVoice from inside the app later."
    return
  fi

  python3 - "$OMNIVOICE_DIR" <<'PY'
import json
import os
import sys
import urllib.request
import urllib.parse

target = sys.argv[1]
repo = "k2-fsa/OmniVoice"
api = f"https://huggingface.co/api/models/{repo}"

with urllib.request.urlopen(api) as response:
    meta = json.load(response)

for sibling in meta.get("siblings", []):
    name = sibling.get("rfilename")
    if not name:
        continue
    url_name = "/".join(urllib.parse.quote(part) for part in name.split("/"))
    url = f"https://huggingface.co/{repo}/resolve/main/{url_name}"
    dest = os.path.join(target, name)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        print(f"Exists: {dest}")
        continue
    print(f"Downloading: {url}")
    tmp = dest + ".partial"
    urllib.request.urlretrieve(url, tmp)
    os.replace(tmp, dest)
PY
}

download_base

if [ ! -s "$BASE_DIR/VieNeu-TTS-v2-Q4-K-M.gguf" ]; then
  echo "Base model was not downloaded correctly."
  exit 1
fi

echo
read -r -p "Download OmniVoice too? This can be large. Type Y to download, anything else to skip: " answer
case "$answer" in
  [Yy]*) download_omnivoice ;;
  *) echo "Skipped OmniVoice." ;;
esac

echo
echo "Models are ready in:"
echo "$MODELS_DIR"
echo "You can open ThanhVinhStudio now."
read -r -p "Press Enter to close."
