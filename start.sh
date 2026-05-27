#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

kill_port() {
    local port="$1"
    if command -v lsof >/dev/null 2>&1; then
        local pids
        pids="$(lsof -ti :"$port" 2>/dev/null || true)"
        if [ -n "$pids" ]; then
            echo "   Killing process on port $port: $pids"
            kill $pids 2>/dev/null || true
            sleep 1
            pids="$(lsof -ti :"$port" 2>/dev/null || true)"
            [ -n "$pids" ] && kill -9 $pids 2>/dev/null || true
        fi
    elif command -v fuser >/dev/null 2>&1; then
        fuser -k "${port}/tcp" 2>/dev/null || true
    fi
}

wait_url() {
    local url="$1"
    local max_wait="$2"
    local count=0
    while [ "$count" -lt "$max_wait" ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo "   Ready: $url"
            return 0
        fi
        count=$((count + 1))
        echo "   Waiting... ($count/$max_wait)"
        sleep 1
    done
    return 1
}

echo "==================================================="
echo "    ThanhVinh Studio - Start"
echo "==================================================="
echo

echo "Checking prerequisites..."
need_install=0
command -v uv >/dev/null 2>&1 || need_install=1
command -v node >/dev/null 2>&1 || need_install=1
[ -d ".venv" ] || need_install=1
[ -d "frontend/node_modules" ] || need_install=1

if [ "$need_install" -eq 1 ]; then
    echo "  [!] Some dependencies are missing. Running ./install.sh now..."
    chmod +x ./install.sh 2>/dev/null || true
    ./install.sh
fi

if ! uv run --frozen python -c "from vieneu import Vieneu; from sea_g2p import Normalizer" >/dev/null 2>&1; then
    echo "  [!] Python dependencies are incomplete. Running ./repair.sh now..."
    chmod +x ./repair.sh 2>/dev/null || true
    ./repair.sh
fi

echo "All prerequisites OK."
echo

echo "[0/4] Cleaning old backend/frontend processes..."
kill_port 8000
kill_port 3000
kill_port 3001

rm -f frontend/.next/dev/lock
rm -rf frontend/.next/dev

echo "[1/4] Starting Backend Server..."
uv run --frozen python -m backend.main &
BACKEND_PID=$!

echo "[2/4] Waiting for backend..."
if ! wait_url "http://localhost:8000/health" 60; then
    echo
    echo "[ERROR] Backend did not become ready. Check terminal output above."
    kill "$BACKEND_PID" 2>/dev/null || true
    exit 1
fi

echo "[3/4] Starting Frontend Server..."
(
    cd frontend
    npm run dev -- -p 3000 -H 127.0.0.1
) &
FRONTEND_PID=$!

echo "[4/4] Waiting for frontend..."
if ! wait_url "http://localhost:3000" 60; then
    echo
    echo "[ERROR] Frontend did not become ready."
    echo "Run ./repair.sh if you see Next.js lock or dependency errors."
    kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
    exit 1
fi

echo
echo "Opening Browser..."
if [[ "${OSTYPE:-}" == "darwin"* ]]; then
    open http://localhost:3000
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open http://localhost:3000 >/dev/null 2>&1 || true
else
    echo "  Open http://localhost:3000 in your browser"
fi

echo
echo "==================================================="
echo "  App is running!"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend:  http://localhost:8000"
echo
echo "  Press Ctrl+C to stop."
echo "==================================================="

cleanup() {
    kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM
wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
