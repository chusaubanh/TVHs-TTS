"""
ThanhVinhStudio - Desktop Application Launcher
Starts the FastAPI backend in a background thread and opens a native window.
"""

import sys
import os
import threading
import time
import socket
import traceback
from pathlib import Path


def _early_log(message: str):
    try:
        if getattr(sys, "frozen", False):
            base = Path(sys.executable).resolve().parent
        elif sys.platform == "win32":
            base = Path(os.environ.get("LOCALAPPDATA", Path.home())) / "ThanhVinhStudio"
        elif sys.platform == "darwin":
            base = Path.home() / "Library" / "Application Support" / "ThanhVinhStudio"
        else:
            base = Path.home() / ".local" / "share" / "ThanhVinhStudio"
        log_dir = base / "logs"
        log_dir.mkdir(parents=True, exist_ok=True)
        with (log_dir / "launcher.log").open("a", encoding="utf-8") as fh:
            timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
            fh.write(f"[{timestamp}] {message}\n")
    except Exception:
        pass


_early_log("Process started before frozen setup")

# Fix imports for PyInstaller frozen mode
if getattr(sys, 'frozen', False):
    _early_log("Frozen mode detected")
    sys.path.insert(0, sys._MEIPASS)
    os.chdir(sys._MEIPASS)
    _early_log(f"Changed working directory to {sys._MEIPASS}")

from backend.config import DEFAULT_HOST, DEFAULT_PORT
_early_log("Imported backend config")


def get_log_file() -> Path:
    """Return the launcher log path outside the app bundle."""
    if getattr(sys, "frozen", False):
        base = Path(sys.executable).resolve().parent
    elif sys.platform == "win32":
        base = Path(os.environ.get("LOCALAPPDATA", Path.home())) / "ThanhVinhStudio"
    elif sys.platform == "darwin":
        base = Path.home() / "Library" / "Application Support" / "ThanhVinhStudio"
    else:
        base = Path.home() / ".local" / "share" / "ThanhVinhStudio"
    log_dir = base / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    return log_dir / "launcher.log"


LOG_FILE = get_log_file()


def log(message: str):
    """Append a launcher diagnostic line."""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    with LOG_FILE.open("a", encoding="utf-8") as fh:
        fh.write(f"[{timestamp}] {message}\n")


def wait_for_server(host: str = DEFAULT_HOST, port: int = DEFAULT_PORT, timeout: float = 30.0) -> bool:
    """Wait until the backend server is accepting connections."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection((host, port), timeout=1):
                return True
        except OSError:
            time.sleep(0.3)
    return False


def start_backend(host: str = DEFAULT_HOST, port: int = DEFAULT_PORT):
    """Start the FastAPI backend server."""
    try:
        log(f"Starting backend at {host}:{port}")
        from backend.main import run_server
        run_server(host=host, port=port)
    except Exception:
        log("Backend failed to start:")
        log(traceback.format_exc())
        raise


def main():
    log("=" * 60)
    log("Launcher started")
    from backend.helpers import find_available_port
    port = find_available_port(DEFAULT_PORT)
    log(f"Selected port: {port}")

    # Start backend in a daemon thread
    server_thread = threading.Thread(
        target=start_backend,
        kwargs={"host": "127.0.0.1", "port": port},
        daemon=True,
    )
    server_thread.start()

    # Wait for server to be ready
    print(f"Starting ThanhVinhStudio on port {port}...")
    if not wait_for_server(port=port, timeout=120):
        log("Backend server failed to start within 120 seconds.")
        print("ERROR: Backend server failed to start within 120 seconds.")
        sys.exit(1)

    log(f"Backend ready at http://127.0.0.1:{port}")
    print(f"Backend ready at http://127.0.0.1:{port}")

    # Launch native window
    import webview

    window = webview.create_window(
        title="ThanhVinhStudio",
        url=f"http://127.0.0.1:{port}",
        width=1280,
        height=860,
        min_size=(900, 600),
        text_select=True,
    )

    log("Starting webview")
    webview.start(debug=False)
    log("Webview exited")


if __name__ == "__main__":
    main()
