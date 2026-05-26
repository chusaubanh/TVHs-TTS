"""Audio endpoints: speech generation, voice cloning, dialogue, history."""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from backend.state import require_tts
from backend.models import SpeechRequest, DialogueRequest
from backend.services import tts_service, history_service

router = APIRouter()


@router.get("/v1/audio/samples/{voice_id}")
async def get_voice_sample(voice_id: str):
    """Return preview audio for a preset voice."""
    require_tts()
    try:
        return tts_service.get_voice_sample(voice_id)
    except ValueError:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=404, content={"error": f"Voice '{voice_id}' not found"})
    except Exception as e:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.post("/v1/audio/speech")
async def generate_speech(request: SpeechRequest):
    """Generate audio from text with [pause:XXX] marker support."""
    require_tts()
    if not request.text:
        raise HTTPException(status_code=400, detail="Text is required")
    try:
        return tts_service.generate_speech(
            text=request.text,
            voice_id=request.voice,
            stream=request.stream,
            silence_p=request.silence_p,
            emotion=request.emotion,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/v1/audio/clone")
async def clone_speech(
    text: str = Form(...),
    reference_text: str = Form(...),
    reference_audio: UploadFile = File(...)
):
    """Zero-shot Voice Cloning."""
    require_tts()
    try:
        return tts_service.clone_speech(text, reference_text, reference_audio)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/v1/audio/dialogue")
async def generate_dialogue(request: DialogueRequest):
    """Generate dialogue/conversation audio with multiple speakers."""
    require_tts()
    if not request.lines:
        raise HTTPException(status_code=400, detail="At least one dialogue line is required")
    try:
        return tts_service.generate_dialogue(request.lines)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/v1/audio/history")
async def list_audio_history():
    """List all saved audio files."""
    return history_service.list_history()


@router.get("/v1/audio/file/{filename}")
async def get_audio_file(filename: str):
    """Serve a saved audio file."""
    try:
        return history_service.get_audio_file(filename)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid path")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")


@router.delete("/v1/audio/file/{filename}")
async def delete_audio_file(filename: str):
    """Delete a saved audio file."""
    try:
        return history_service.delete_audio_file(filename)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid path")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")
