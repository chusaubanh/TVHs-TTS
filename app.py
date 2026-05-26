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
    # Add bundled directory to path
    sys.path.insert(0, sys._MEIPASS)
    os.chdir(sys._MEIPASS)


def wait_for_server(host: str = "127.0.0.1", port: int = 8000, timeout: float = 30.0) -> bool:
    """Wait until the backend server is accepting connections."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection((host, port), timeout=1):
                return True
        except OSError:
            time.sleep(0.3)
    return False


def start_backend(host: str = "127.0.0.1", port: int = 8000):
    """Start the FastAPI backend server."""
    from backend.main import run_server
    run_server(host=host, port=port)


def find_available_port(start_port: int = 8000, max_tries: int = 10) -> int:
    """Find an available port."""
    for port in range(start_port, start_port + max_tries):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            sock.bind(('127.0.0.1', port))
            sock.close()
            return port
        except OSError:
            continue
    return start_port


def main():
    port = find_available_port(8000)

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
