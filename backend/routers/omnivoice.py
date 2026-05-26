"""OmniVoice endpoints: load, unload, status, TTS, voice cloning."""

import os
from datetime import datetime

from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from backend.config import LOCAL_OMNIVOICE_DIR, REMOTE_OMNIVOICE_REPO, OUTPUTS_DIR
from backend.state import state
from backend.helpers import (
    is_omnivoice_downloaded, has_cuda, audio_to_response,
    normalize_audio, unpack_audio_result, save_upload_to_tempfile,
)
from backend.models import OmniVoiceTTSRequest

import soundfile as sf

router = APIRouter()


@router.post("/v1/omnivoice/load")
async def load_omnivoice():
    """Load OmniVoice model (local cache first, then HuggingFace)."""
    if state.omnivoice_loaded and state.omnivoice_tts is not None:
        return {"status": "already_loaded"}

    with state.omnivoice_lock:
        try:
            from omnivoice import OmniVoice as OmniVoiceModel
        except ImportError:
            raise HTTPException(status_code=400, detail="OmniVoice not installed. Run: pip install omnivoice")

        try:
            _device = "cuda:0" if has_cuda() else "cpu"
            _dtype = "float16" if has_cuda() else "float32"

            if is_omnivoice_downloaded():
                model_path = str(LOCAL_OMNIVOICE_DIR)
                print(f"Loading OmniVoice from local: {model_path}")
            else:
                model_path = REMOTE_OMNIVOICE_REPO
                print(f"Downloading OmniVoice from HuggingFace: {model_path}")

            state.omnivoice_tts = OmniVoiceModel.from_pretrained(model_path, device_map=_device, dtype=_dtype)
            state.omnivoice_loaded = True
            return {"status": "ok", "device": _device, "source": "local" if is_omnivoice_downloaded() else "huggingface"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to load OmniVoice: {str(e)}")


@router.post("/v1/omnivoice/unload")
async def unload_omnivoice():
    """Unload OmniVoice model to free memory."""
    with state.omnivoice_lock:
        if state.omnivoice_tts is not None:
            try:
                del state.omnivoice_tts
            except Exception:
                pass
        state.omnivoice_tts = None
        state.omnivoice_loaded = False

    if has_cuda():
        try:
            import torch
            torch.cuda.empty_cache()
        except Exception:
            pass

    return {"status": "ok"}


@router.get("/v1/omnivoice/status")
async def omnivoice_status():
    """Check OmniVoice model status."""
    return {
        "loaded": state.omnivoice_loaded,
        "has_cuda": has_cuda(),
    }


@router.post("/v1/omnivoice/tts")
async def omnivoice_tts_generate(request: OmniVoiceTTSRequest):
    """Generate speech with OmniVoice."""
    if not state.omnivoice_loaded or state.omnivoice_tts is None:
        raise HTTPException(status_code=503, detail="OmniVoice not loaded. Call /v1/omnivoice/load first.")

    try:
        with state.omnivoice_lock:
            result = state.omnivoice_tts.generate(
                text=request.text,
                language=request.language,
                speed=request.speed,
            )

        audio_data, sample_rate = unpack_audio_result(result, state.omnivoice_tts)
        audio_data = normalize_audio(audio_data)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"omnivoice_{timestamp}.wav"
        filepath = OUTPUTS_DIR / filename
        sf.write(str(filepath), audio_data, sample_rate, format='WAV')

        return audio_to_response(audio_data, sample_rate)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/v1/omnivoice/clone")
async def omnivoice_clone(
    text: str = Form(...),
    reference_audio: UploadFile = File(...),
    language: str = Form(default="vie"),
    speed: float = Form(default=1.0),
):
    """Voice clone with OmniVoice."""
    if not state.omnivoice_loaded or state.omnivoice_tts is None:
        raise HTTPException(status_code=503, detail="OmniVoice not loaded. Call /v1/omnivoice/load first.")

    tmp_path = None
    try:
        tmp_path = save_upload_to_tempfile(reference_audio)

        with state.omnivoice_lock:
            result = state.omnivoice_tts.clone(
                text=text,
                reference_audio=tmp_path,
                language=language,
                speed=speed,
            )
        os.remove(tmp_path)

        audio_data, sample_rate = unpack_audio_result(result, state.omnivoice_tts)
        audio_data = normalize_audio(audio_data)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"omnivoice_clone_{timestamp}.wav"
        filepath = OUTPUTS_DIR / filename
        sf.write(str(filepath), audio_data, sample_rate, format='WAV')

        return audio_to_response(audio_data, sample_rate)

    except Exception as e:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise HTTPException(status_code=500, detail=str(e))
