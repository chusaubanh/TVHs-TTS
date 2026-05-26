"""OmniVoice endpoints: load, unload, status, TTS, voice cloning, voice management."""

import os
import json
import shutil
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from backend.config import LOCAL_OMNIVOICE_DIR, REMOTE_OMNIVOICE_REPO, OUTPUTS_DIR, SAVED_VOICES_DIR
from backend.state import state
from backend.helpers import (
    is_omnivoice_downloaded, has_cuda, audio_to_response,
    normalize_audio, unpack_audio_result, save_upload_to_tempfile,
)
from backend.models import OmniVoiceTTSRequest

import soundfile as sf

router = APIRouter()


def _list_saved_voices() -> list[dict]:
    """List all saved OmniVoice clones."""
    voices = []
    if not SAVED_VOICES_DIR.exists():
        return voices
    for meta_file in sorted(SAVED_VOICES_DIR.glob("*.json")):
        try:
            meta = json.loads(meta_file.read_text(encoding="utf-8"))
            audio_path = SAVED_VOICES_DIR / meta.get("audio_file", "")
            if audio_path.exists():
                voices.append({
                    "name": meta.get("name", meta_file.stem),
                    "language": meta.get("language", "vie"),
                    "created": meta.get("created", ""),
                    "audio_file": meta.get("audio_file", ""),
                })
        except Exception:
            continue
    return voices


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
    """Generate speech with OmniVoice. If voice_name is set, use saved reference audio."""
    if not state.omnivoice_loaded or state.omnivoice_tts is None:
        raise HTTPException(status_code=503, detail="OmniVoice not loaded. Call /v1/omnivoice/load first.")

    try:
        # If voice_name provided, use clone mode with saved reference
        if request.voice_name:
            voice_dir = SAVED_VOICES_DIR / request.voice_name
            meta_path = voice_dir / "meta.json"
            if not meta_path.exists():
                raise HTTPException(status_code=404, detail=f"Voice '{request.voice_name}' not found")
            meta = json.loads(meta_path.read_text(encoding="utf-8"))
            ref_audio = voice_dir / meta.get("audio_file", "")
            if not ref_audio.exists():
                raise HTTPException(status_code=404, detail="Reference audio not found for this voice")

            with state.omnivoice_lock:
                result = state.omnivoice_tts.clone(
                    text=request.text,
                    reference_audio=str(ref_audio),
                    language=request.language,
                    speed=request.speed,
                )
        else:
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

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/v1/omnivoice/clone")
async def omnivoice_clone(
    text: str = Form(...),
    reference_audio: UploadFile = File(...),
    language: str = Form(default="vie"),
    speed: float = Form(default=1.0),
    save_as: str = Form(default=""),
):
    """Voice clone with OmniVoice. If save_as is provided, save the voice for reuse."""
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

        audio_data, sample_rate = unpack_audio_result(result, state.omnivoice_tts)
        audio_data = normalize_audio(audio_data)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"omnivoice_clone_{timestamp}.wav"
        filepath = OUTPUTS_DIR / filename
        sf.write(str(filepath), audio_data, sample_rate, format='WAV')

        # Save voice if requested
        if save_as and save_as.strip():
            voice_name = save_as.strip()
            voice_dir = SAVED_VOICES_DIR / voice_name
            voice_dir.mkdir(parents=True, exist_ok=True)

            # Copy reference audio
            ref_filename = f"reference{Path(tmp_path).suffix}"
            shutil.copy2(tmp_path, voice_dir / ref_filename)

            # Save metadata
            meta = {
                "name": voice_name,
                "language": language,
                "audio_file": ref_filename,
                "created": datetime.now().isoformat(),
            }
            (voice_dir / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

        # Clean up temp file
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

        return audio_to_response(audio_data, sample_rate)

    except Exception as e:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/v1/omnivoice/voices")
async def list_omnivoice_voices():
    """List all saved OmniVoice clones."""
    return {"voices": _list_saved_voices()}


@router.post("/v1/omnivoice/voice/save")
async def save_omnivoice_voice(
    name: str = Form(...),
    reference_audio: UploadFile = File(...),
    language: str = Form(default="vie"),
):
    """Save a voice from reference audio for reuse."""
    voice_name = name.strip()
    if not voice_name:
        raise HTTPException(status_code=400, detail="Voice name is required")

    voice_dir = SAVED_VOICES_DIR / voice_name
    if voice_dir.exists():
        raise HTTPException(status_code=409, detail=f"Voice '{voice_name}' already exists")

    voice_dir.mkdir(parents=True, exist_ok=True)

    try:
        # Save reference audio
        ext = Path(reference_audio.filename or ".wav").suffix or ".wav"
        ref_filename = f"reference{ext}"
        ref_path = voice_dir / ref_filename
        content = await reference_audio.read()
        ref_path.write_bytes(content)

        # Save metadata
        meta = {
            "name": voice_name,
            "language": language,
            "audio_file": ref_filename,
            "created": datetime.now().isoformat(),
        }
        (voice_dir / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

        return {"status": "ok", "name": voice_name, "voices": _list_saved_voices()}

    except Exception as e:
        # Clean up on error
        if voice_dir.exists():
            shutil.rmtree(voice_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/v1/omnivoice/voice/{name}")
async def delete_omnivoice_voice(name: str):
    """Delete a saved OmniVoice voice."""
    voice_dir = SAVED_VOICES_DIR / name
    if not voice_dir.exists():
        raise HTTPException(status_code=404, detail=f"Voice '{name}' not found")

    shutil.rmtree(voice_dir, ignore_errors=True)
    return {"status": "ok", "name": name, "voices": _list_saved_voices()}
