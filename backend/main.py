"""Application entry point: FastAPI app creation, lifespan, CORS, router registration."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from backend.config import (
    OUTPUTS_DIR, APP_TITLE, APP_VERSION, DEFAULT_HOST, DEFAULT_PORT, ALLOWED_ORIGINS,
)
from backend.state import state
from backend.helpers import is_base_model_downloaded, create_viener_engine


@asynccontextmanager
async def lifespan(app):
    """App lifespan: load TTS model on startup."""
    print("=" * 50)
    print("Starting ThanhVinhStudio v4.0 (VieNeu-TTS-v2)...")
    print("=" * 50)

    try:
        from vieneu import Vieneu
    except ImportError:
        print("[WARNING] Vieneu package missing.")
        print("[WARNING] Run repair.bat on Windows, or ./repair.sh on macOS/Linux, then start again.")
        yield
        return

    if is_base_model_downloaded():
        try:
            with state.tts_lock:
                state.tts = create_viener_engine("gguf")
            print("[OK] VieNeu-TTS-v2 model loaded from local files.")
            print(f"[OK] Outputs directory: {OUTPUTS_DIR}")
        except Exception as e:
            print(f"[ERROR] Failed to load local model: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("[WARNING] No local model found. Use the UI to download.")

    yield


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(title=APP_TITLE, version=APP_VERSION, lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register API routers (BEFORE static file catch-all)
    from backend.routers import system, downloads, models_lora, audio, omnivoice
    app.include_router(system.router)
    app.include_router(downloads.router)
    app.include_router(models_lora.router)
    app.include_router(audio.router)
    app.include_router(omnivoice.router)

    # Mount static files (must be LAST — contains catch-all GET route)
    from backend.static import mount_static_files
    mount_static_files(app)

    return app


app = create_app()


def run_server(host: str = DEFAULT_HOST, port: int = DEFAULT_PORT):
    """Start the server. Used by both __main__ and the desktop launcher."""
    uvicorn.run(app, host=host, port=port, log_level="warning")


if __name__ == "__main__":
    from backend.helpers import find_available_port
    port = find_available_port(DEFAULT_PORT)
    if port != DEFAULT_PORT:
        print(f"[WARNING] Port {DEFAULT_PORT} is busy. Using port {port} instead.")
    run_server(port=port)
