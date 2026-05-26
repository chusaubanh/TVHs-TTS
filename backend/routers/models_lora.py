"""Model switching, reload, voice listing, LoRA management."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from backend.state import state, require_tts
from backend.helpers import build_lora_list
from backend.models import SwitchModelRequest, LoadLoraRequest
from backend.services import model_service, lora_service

router = APIRouter()


@router.post("/v1/models/switch")
async def switch_model(body: SwitchModelRequest):
    """Switch between model backends."""
    try:
        return model_service.switch_model(body.type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load model: {str(e)}")


@router.post("/v1/models/reload")
async def reload_model():
    """Reload the TTS model (after download completes)."""
    try:
        return model_service.reload_model()
    except ValueError as e:
        return JSONResponse(status_code=400, content={"error": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get("/v1/models")
async def list_models():
    """List available voices."""
    require_tts()
    try:
        voices = state.tts.list_preset_voices()
        data = [{"id": voice_id, "name": description} for description, voice_id in voices]
        return {"data": data}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get("/v1/lora")
async def list_loras():
    """List available LoRA adapters."""
    return lora_service.list_loras()


@router.post("/v1/lora/load")
async def load_lora(body: LoadLoraRequest):
    """Load a LoRA adapter."""
    require_tts()
    try:
        return lora_service.load_lora(body.name)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.post("/v1/lora/unload")
async def unload_lora():
    """Unload current LoRA."""
    require_tts()
    try:
        return lora_service.unload_lora()
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
