"""Application entry point: FastAPI app creation, lifespan, CORS, router registration."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from backend.config import LOCAL_GGUF_DIR, GGUF_FILENAME
from backend.state import state
from backend.helpers import is_base_model_downloaded


@asynccontextmanager
async def lifespan(app):
    """App lifespan: load TTS model on startup."""
    print("=" * 50)
    print("Starting ThanhVinhStudio v4.0 (VieNeu-TTS-v2)...")
    print("=" * 50)

    try:
        from vieneu import Vieneu
    except ImportError:
        print("[WARNING] Vieneu package missing. Running in mock mode.")
        yield
        return

    if is_base_model_downloaded():
        try:
            with state.tts_lock:
                state.tts = Vieneu(
                    mode="standard",
                    backbone_repo=str(LOCAL_GGUF_DIR),
                    gguf_filename=GGUF_FILENAME,
                    backbone_device="cpu",
                    codec_device="cpu",
                    emotion="natural",
                )
            from backend.config import OUTPUTS_DIR
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
    app = FastAPI(title="ThanhVinhStudio API", version="4.0.1", lifespan=lifespan)

    # CORS — restrict to local dev ports
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
            "tauri://localhost",
            "https://tauri.localhost",
        ],
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


def run_server(host: str = "127.0.0.1", port: int = 8000):
    """Start the server. Used by both __main__ and the desktop launcher."""
    uvicorn.run(app, host=host, port=port, log_level="warning")


if __name__ == "__main__":
    from backend.helpers import find_available_port
    port = find_available_port(8000)
    if port != 8000:
        print(f"[WARNING] Port 8000 is busy. Using port {port} instead.")
    run_server(port=port)
