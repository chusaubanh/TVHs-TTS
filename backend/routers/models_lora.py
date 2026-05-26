"""Model switching, reload, voice listing, LoRA management."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from backend.config import LOCAL_GGUF_DIR, GGUF_FILENAME, REMOTE_PYTORCH_REPO
from backend.state import state
from backend.helpers import (
    is_base_model_downloaded, find_lora_path, has_cuda, build_lora_list,
)
from backend.models import SwitchModelRequest, LoadLoraRequest

router = APIRouter()


@router.post("/v1/models/switch")
async def switch_model(body: SwitchModelRequest):
    """Switch between model backends."""
    from vieneu import Vieneu

    model_type = body.type

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
            if model_type == "gguf":
                state.tts = Vieneu(
                    mode="standard",
                    backbone_repo=str(LOCAL_GGUF_DIR),
                    gguf_filename=GGUF_FILENAME,
                    backbone_device="cpu",
                    codec_device="cpu",
                    emotion="natural",
                )
            elif model_type == "pytorch":
                state.tts = Vieneu(
                    mode="standard",
                    backbone_repo="pnnbao-ump/VieNeu-TTS-v2",
                    gguf_filename=None,
                    backbone_device="cuda" if has_cuda() else "cpu",
                    codec_device="cpu",
                    emotion="natural",
                )
            elif model_type == "turbo":
                state.tts = Vieneu(
                    mode="turbo",
                    backbone_device="cpu",
                    codec_device="cpu",
                )

            state.current_model_type = model_type
            return {"status": "ok", "model": model_type}

        except Exception as e:
            try:
                state.tts = Vieneu(
                    mode="standard",
                    backbone_repo=str(LOCAL_GGUF_DIR),
                    gguf_filename=GGUF_FILENAME,
                    backbone_device="cpu",
                    codec_device="cpu",
                    emotion="natural",
                )
                state.current_model_type = "gguf"
            except Exception:
                pass
            raise HTTPException(status_code=500, detail=f"Failed to load model: {str(e)}")


@router.post("/v1/models/reload")
async def reload_model():
    """Reload the TTS model (after download completes)."""
    from vieneu import Vieneu

    if not is_base_model_downloaded():
        return JSONResponse(status_code=400, content={"error": "Base model not downloaded yet."})

    try:
        with state.tts_lock:
            if state.tts and hasattr(state.tts, 'close'):
                state.tts.close()
            state.tts = Vieneu(
                backbone_repo=str(LOCAL_GGUF_DIR),
                codec_device="cpu",
            )
        return {"status": "ok", "message": "Model reloaded successfully."}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get("/v1/models")
async def list_models():
    """List available voices."""
    if not state.tts:
        return JSONResponse(status_code=503, content={"error": "TTS engine not initialized"})

    try:
        voices = state.tts.list_preset_voices()
        data = [{"id": voice_id, "name": description} for description, voice_id in voices]
        return {"data": data}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get("/v1/lora")
async def list_loras():
    """List available LoRA adapters."""
    data = build_lora_list()
    return {"data": data, "active": state.current_lora}


@router.post("/v1/lora/load")
async def load_lora(body: LoadLoraRequest):
    """Load a LoRA adapter."""
    from vieneu import Vieneu

    lora_name = body.name

    if not state.tts:
        return JSONResponse(status_code=503, content={"error": "TTS engine not initialized"})

    with state.tts_lock:
        is_quantized = getattr(state.tts, '_is_quantized_model', False)
        if is_quantized:
            print("Switching to PyTorch backend for LoRA...")
            try:
                if hasattr(state.tts, 'close'):
                    state.tts.close()
                state.tts = Vieneu(backbone_repo=REMOTE_PYTORCH_REPO, gguf_filename=None)
                state.current_model_type = "pytorch"
            except Exception as e:
                return JSONResponse(status_code=500, content={"error": f"Cannot load PyTorch model: {e}"})

        lora_path = find_lora_path(lora_name)
        try:
            state.tts.load_lora_adapter(lora_path)
            state.current_lora = lora_name

            try:
                if state.current_model_type == "gguf":
                    state.tts._load_voices(str(LOCAL_GGUF_DIR), clear_existing=False)
                else:
                    state.tts._load_voices(REMOTE_PYTORCH_REPO, clear_existing=False)
                print(f"   [LORA] Voices reloaded after LoRA load")
            except Exception as voice_err:
                print(f"   [LORA] Warning: Could not reload voices: {voice_err}")

            return {"status": "ok", "lora": lora_name}
        except Exception as e:
            return JSONResponse(status_code=500, content={"error": str(e)})


@router.post("/v1/lora/unload")
async def unload_lora():
    """Unload current LoRA."""
    if not state.tts:
        return JSONResponse(status_code=503, content={"error": "TTS engine not initialized"})
    with state.tts_lock:
        try:
            state.tts.unload_lora_adapter()
            state.current_lora = None
            return {"status": "ok"}
        except Exception as e:
            return JSONResponse(status_code=500, content={"error": str(e)})
