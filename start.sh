#!/usr/bin/env bash
set -e

echo "==================================================="
echo "    ThanhVinh Studio"
echo "==================================================="
echo

# Quick prerequisite check
echo "Checking prerequisites..."
MISSING=0

if ! command -v uv &>/dev/null; then
    echo "  [!] uv not found. Run install.sh first."
    MISSING=1
fi

if ! command -v node &>/dev/null; then
    echo "  [!] Node.js not found. Run install.sh first."
    MISSING=1
fi

if [ ! -d ".venv" ]; then
    echo "  [!] Virtual environment not found. Run install.sh first."
    MISSING=1
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "  [!] Frontend dependencies not found. Run install.sh first."
    MISSING=1
fi

if [ "$MISSING" -ne 0 ]; then
    echo
    echo "Please run install.sh first to set up all dependencies."
    exit 1
fi

echo "All prerequisites OK."
echo

# 0. Kill existing processes on port 8000
echo "[0/3] Cleaning up old processes..."
if lsof -ti:8000 &>/dev/null; then
    kill $(lsof -ti:8000) 2>/dev/null || true
    echo "   Killed old process on port 8000"
fi
sleep 1

# 1. Backend
echo "[1/3] Starting Backend Server..."
cd "$(dirname "$0")"
uv run --frozen python -m backend.main &
BACKEND_PID=$!
cd ..

# 2. Wait for backend to be ready
echo "[2/3] Waiting for backend to start..."
MAX_WAIT=30
COUNT=0

while [ $COUNT -lt $MAX_WAIT ]; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "   Backend is ready!"
        break
    fi
    sleep 1
    COUNT=$((COUNT + 1))
    echo "   Waiting... ($COUNT/$MAX_WAIT)"
done

if [ $COUNT -ge $MAX_WAIT ]; then
    echo
    echo "  [WARNING] Backend did not respond after ${MAX_WAIT} seconds."
    echo "  Check for errors in the backend output above."
fi

# 3. Frontend
echo "[3/3] Starting Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# 4. Wait & Launch
echo
echo "Opening Browser in 5 seconds..."
sleep 5

if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000
elif command -v xdg-open &>/dev/null; then
    xdg-open http://localhost:3000
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

# Wait for either process to exit
wait $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
