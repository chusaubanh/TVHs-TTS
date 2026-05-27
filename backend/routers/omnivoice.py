"""OmniVoice endpoints: load, unload, status, TTS, voice cloning, voice management."""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from backend.state import state, require_omnivoice
from backend.models import OmniVoiceTTSRequest
from backend.services import omnivoice_service

router = APIRouter()


@router.post("/v1/omnivoice/load")
async def load_omnivoice():
    """Load OmniVoice model (local cache first, then HuggingFace)."""
    try:
        return omnivoice_service.load_omnivoice()
    except ImportError:
        raise HTTPException(status_code=400, detail="OmniVoice not installed. Run: pip install omnivoice")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load OmniVoice: {str(e)}")


@router.post("/v1/omnivoice/unload")
async def unload_omnivoice():
    """Unload OmniVoice model to free memory."""
    return omnivoice_service.unload_omnivoice()


@router.get("/v1/omnivoice/status")
async def omnivoice_status():
    """Check OmniVoice model status."""
    from backend.utils.hardware import has_cuda
    return {"loaded": state.omnivoice_loaded, "has_cuda": has_cuda()}


@router.post("/v1/omnivoice/tts")
async def omnivoice_tts_generate(request: OmniVoiceTTSRequest):
    """Generate speech with OmniVoice."""
    require_omnivoice()
    try:
        return omnivoice_service.generate_tts(
            text=request.text,
            language=request.language,
            speed=request.speed,
            voice_name=request.voice_name,
            instruct=request.instruct,
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/v1/omnivoice/clone")
async def omnivoice_clone(
    text: str = Form(...),
    reference_audio: UploadFile = File(...),
    language: str = Form(default="Vietnamese"),
    speed: float = Form(default=1.0),
    save_as: str = Form(default=""),
):
    """Voice clone with OmniVoice. If save_as is provided, save the voice for reuse."""
    require_omnivoice()
    try:
        return omnivoice_service.generate_clone(text, reference_audio, language, speed, save_as)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/v1/omnivoice/voices")
async def list_omnivoice_voices():
    """List all saved OmniVoice clones."""
    return {"voices": omnivoice_service.list_saved_voices()}


@router.post("/v1/omnivoice/voice/save")
async def save_omnivoice_voice(
    name: str = Form(...),
    reference_audio: UploadFile = File(...),
    language: str = Form(default="Vietnamese"),
):
    """Save a voice from reference audio for reuse."""
    if not name.strip():
        raise HTTPException(status_code=400, detail="Voice name is required")
    try:
        return await omnivoice_service.save_voice_from_upload(name, reference_audio, language)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/v1/omnivoice/voice/{name}")
async def delete_omnivoice_voice(name: str):
    """Delete a saved OmniVoice voice."""
    if not omnivoice_service.delete_saved_voice(name):
        raise HTTPException(status_code=404, detail=f"Voice '{name}' not found")
    return {"status": "ok", "name": name, "voices": omnivoice_service.list_saved_voices()}
