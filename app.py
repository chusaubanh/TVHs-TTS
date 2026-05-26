"""
ThanhVinhStudio - Desktop Application Launcher
Starts the FastAPI backend in a background thread and opens a native window.
"""

import sys
import os
import threading
import time
import socket

# Fix imports for PyInstaller frozen mode
if getattr(sys, 'frozen', False):
    sys.path.insert(0, sys._MEIPASS)
    os.chdir(sys._MEIPASS)

from backend.config import DEFAULT_HOST, DEFAULT_PORT


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
    from backend.main import run_server
    run_server(host=host, port=port)


def main():
    from backend.helpers import find_available_port
    port = find_available_port(DEFAULT_PORT)

    # Start backend in a daemon thread
    server_thread = threading.Thread(
        target=start_backend,
        kwargs={"host": "127.0.0.1", "port": port},
        daemon=True,
    )
    server_thread.start()

    # Wait for server to be ready
    print(f"Starting ThanhVinhStudio on port {port}...")
    if not wait_for_server(port=port, timeout=30):
        print("ERROR: Backend server failed to start within 30 seconds.")
        sys.exit(1)

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

    webview.start(debug=False)


if __name__ == "__main__":
    main()
