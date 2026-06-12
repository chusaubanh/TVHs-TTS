"""Router for VieNeu-TTS v3 Turbo API."""

from fastapi import APIRouter, File, Form, UploadFile, Depends
from backend.services import v3_service
from backend.state import state, require_v3

router = APIRouter(prefix="/api/v3", tags=["v3"])

@router.get("/status")
def get_status():
    """Get current status of v3 model."""
    return {"loaded": state.v3_loaded}

@router.post("/load")
def load_model():
    """Load the v3 model."""
    return v3_service.load_v3()

@router.post("/unload")
def unload_model():
    """Unload the v3 model."""
    return v3_service.unload_v3()

@router.get("/voices", dependencies=[Depends(require_v3)])
def list_voices():
    """List preset voices available in v3."""
    return {"voices": v3_service.list_preset_voices()}

@router.post("/generate", dependencies=[Depends(require_v3)])
def generate_tts(
    text: str = Form(...),
    voice: str = Form(None),
):
    """Generate TTS using default voices."""
    return v3_service.generate_v3_tts(text=text, voice_name=voice)

@router.post("/clone", dependencies=[Depends(require_v3)])
def generate_clone(
    text: str = Form(...),
    reference_audio: UploadFile = File(...),
):
    """Generate zero-shot clone with v3."""
    return v3_service.generate_v3_clone(text=text, reference_audio=reference_audio)
