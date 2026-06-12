"""Global engine state with thread safety."""

import threading
from fastapi import HTTPException


class EngineState:
    """Singleton holding all TTS engine state."""

    def __init__(self):
        # VieNeu-TTS state
        self.tts = None
        self.tts_lock = threading.Lock()
        self.current_lora = None
        self.current_model_type = "gguf"  # "gguf", "pytorch", "turbo"

        # OmniVoice separate state
        self.omnivoice_tts = None
        self.omnivoice_lock = threading.Lock()
        self.omnivoice_loaded = False

        # VieNeu-TTS v3 Turbo separate state
        self.v3_tts = None
        self.v3_lock = threading.Lock()
        self.v3_loaded = False

        # Download progress tracking
        self.download_progress = {
            "base": {"status": "idle", "progress": 0, "message": ""},
            "lora": {"status": "idle", "progress": 0, "message": ""},
            "omnivoice": {"status": "idle", "progress": 0, "message": ""},
        }


# Global singleton instance
state = EngineState()


def get_state() -> EngineState:
    """Get the global engine state singleton."""
    return state


def require_tts():
    """Dependency: ensure TTS engine is loaded. Raises 503 if not."""
    if state.tts is None:
        raise HTTPException(status_code=503, detail="TTS engine not ready")
    return state


def require_omnivoice():
    """Dependency: ensure OmniVoice is loaded. Raises 503 if not."""
    if not state.omnivoice_loaded or state.omnivoice_tts is None:
        raise HTTPException(status_code=503, detail="OmniVoice not loaded. Call /v1/omnivoice/load first.")
    return state


def require_v3():
    """Dependency: ensure v3 Turbo is loaded. Raises 503 if not."""
    if not state.v3_loaded or state.v3_tts is None:
        raise HTTPException(status_code=503, detail="v3 Turbo not loaded. Call /api/v3/load first.")
    return state
