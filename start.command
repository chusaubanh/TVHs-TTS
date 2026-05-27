#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

chmod +x ./install.sh ./start.sh ./repair.sh 2>/dev/null || true
./start.sh
