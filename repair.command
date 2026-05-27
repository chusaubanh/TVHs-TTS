#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

chmod +x ./install.sh ./start.sh ./repair.sh 2>/dev/null || true
./repair.sh

echo
echo "You can close this window now."
read -r -p "Press Enter to exit..."
