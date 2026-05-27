#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"
export UV_LINK_MODE=copy

kill_port() {
    local port="$1"
    if command -v lsof >/dev/null 2>&1; then
        local pids
        pids="$(lsof -ti :"$port" 2>/dev/null || true)"
        if [ -n "$pids" ]; then
            echo "Killing process on port $port: $pids"
            kill $pids 2>/dev/null || true
            sleep 1
            pids="$(lsof -ti :"$port" 2>/dev/null || true)"
            [ -n "$pids" ] && kill -9 $pids 2>/dev/null || true
        fi
    elif command -v fuser >/dev/null 2>&1; then
        fuser -k "${port}/tcp" 2>/dev/null || true
    fi
}

echo "==================================================="
echo "    ThanhVinh Studio - Repair"
echo "==================================================="
echo
echo "This repairs common local issues:"
echo "  - stale Next.js lock files"
echo "  - ports 8000, 3000, 3001 being occupied"
echo "  - broken Python dependency sea-g2p"
echo "  - missing/corrupt node_modules"
echo

kill_port 8000
kill_port 3000
kill_port 3001

rm -f frontend/.next/dev/lock
rm -rf frontend/.next/dev

if ! command -v uv >/dev/null 2>&1; then
    echo "[ERROR] uv not found. Run ./install.sh first."
    exit 1
fi

echo
echo "Repairing Python dependencies..."
uv sync --frozen
uv pip install --force-reinstall vieneu==2.7.0 sea-g2p==0.7.5
uv run --frozen python -c "from sea_g2p import Normalizer; from vieneu import Vieneu; print('Python dependencies OK')"

echo
echo "Repairing frontend dependencies..."
(
    cd frontend
    npm ci --no-audit --no-fund
)

echo
echo "==================================================="
echo "    Repair complete. Run ./start.sh now."
echo "==================================================="
