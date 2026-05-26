"""LoRA adapter management service."""

from backend.config import LOCAL_GGUF_DIR, REMOTE_PYTORCH_REPO
from backend.state import state
from backend.helpers import find_lora_path, build_lora_list, create_viener_engine


def list_loras() -> dict:
    """List available LoRA adapters with active status."""
    data = build_lora_list()
    return {"data": data, "active": state.current_lora}


def load_lora(lora_name: str) -> dict:
    """Load a LoRA adapter. Switches to PyTorch if currently on quantized model.

    Returns {"status": "ok", "lora": ...} on success.
    Raises Exception on failure.
    """
    with state.tts_lock:
        is_quantized = getattr(state.tts, '_is_quantized_model', False)
        if is_quantized:
            if hasattr(state.tts, 'close'):
                state.tts.close()
            state.tts = create_viener_engine("pytorch")
            state.current_model_type = "pytorch"

        lora_path = find_lora_path(lora_name)
        state.tts.load_lora_adapter(lora_path)
        state.current_lora = lora_name

        # Reload voices after LoRA load
        try:
            if state.current_model_type == "gguf":
                state.tts._load_voices(str(LOCAL_GGUF_DIR), clear_existing=False)
            else:
                state.tts._load_voices(REMOTE_PYTORCH_REPO, clear_existing=False)
        except Exception:
            pass

    return {"status": "ok", "lora": lora_name}


def unload_lora() -> dict:
    """Unload current LoRA adapter.

    Returns {"status": "ok"} on success.
    Raises Exception on failure.
    """
    with state.tts_lock:
        state.tts.unload_lora_adapter()
        state.current_lora = None
    return {"status": "ok"}
