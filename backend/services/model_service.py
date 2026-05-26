"""Model switching and reloading service."""

from backend.state import state
from backend.helpers import is_base_model_downloaded, create_viener_engine


def switch_model(model_type: str) -> dict:
    """Switch between model backends (gguf/pytorch/turbo).

    Returns {"status": ..., "model": ...} on success.
    Raises Exception on failure.
    """
    if model_type == state.current_model_type and state.tts is not None:
        return {"status": "already_loaded", "model": model_type}

    with state.tts_lock:
        if state.tts and hasattr(state.tts, 'close'):
            try:
                state.tts.close()
            except Exception:
                pass
        state.tts = None
        state.current_lora = None

        try:
            state.tts = create_viener_engine(model_type)
            state.current_model_type = model_type
            return {"status": "ok", "model": model_type}
        except Exception as e:
            # Fallback to gguf
            try:
                state.tts = create_viener_engine("gguf")
                state.current_model_type = "gguf"
            except Exception:
                pass
            raise


def reload_model() -> dict:
    """Reload the TTS model after download completes.

    Returns {"status": "ok", "message": ...} on success.
    Raises Exception on failure.
    """
    if not is_base_model_downloaded():
        raise ValueError("Base model not downloaded yet.")

    with state.tts_lock:
        if state.tts and hasattr(state.tts, 'close'):
            state.tts.close()
        state.tts = create_viener_engine("gguf")

    return {"status": "ok", "message": "Model reloaded successfully."}
