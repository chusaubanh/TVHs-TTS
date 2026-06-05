#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_PATH="$SCRIPT_DIR/ThanhVinhStudio.app"

if [ ! -d "$APP_PATH" ] && [ -d "/Applications/ThanhVinhStudio.app" ]; then
  APP_PATH="/Applications/ThanhVinhStudio.app"
fi

if [ ! -d "$APP_PATH" ]; then
  echo "Could not find ThanhVinhStudio.app next to this script or in /Applications."
  read -r -p "Press Enter to close."
  exit 1
fi

echo "Preparing first launch:"
echo "$APP_PATH"
xattr -dr com.apple.quarantine "$APP_PATH" 2>/dev/null || true
chmod +x "$APP_PATH/Contents/MacOS/"* 2>/dev/null || true
open "$APP_PATH"
