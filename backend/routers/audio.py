"""Audio endpoints: speech generation, voice cloning, dialogue, history."""

import os
from datetime import datetime
from pathlib import Path

import numpy as np
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse, FileResponse

from backend.config import OUTPUTS_DIR
from backend.state import state
from backend.helpers import (
    save_audio_to_disk, audio_to_response, generate_audio_with_pause,
    save_upload_to_tempfile,
)
from backend.models import SpeechRequest, DialogueRequest

router = APIRouter()


@router.get("/v1/audio/samples/{voice_id}")
async def get_voice_sample(voice_id: str):
    """Return preview audio for a preset voice."""
    if not state.tts:
        return JSONResponse(status_code=503, content={"error": "TTS engine not initialized"})

    try:
        voice_data = state.tts.get_preset_voice(voice_id)
    except ValueError:
        return JSONResponse(status_code=404, content={"error": f"Voice '{voice_id}' not found"})

    assets_dir = Path(__file__).resolve().parent.parent.parent / "vieneu" / "assets" / "samples"
    if assets_dir.exists():
        for file in assets_dir.iterdir():
            if file.suffix == ".wav" and voice_id.lower() in file.stem.lower():
                return FileResponse(file, media_type="audio/wav")

    try:
        audio_data = state.tts.infer(text="Xin chao, toi la giong noi tieng Viet.", voice=voice_data)
        return audio_to_response(audio_data, state.tts.sample_rate)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.post("/v1/audio/speech")
async def generate_speech(request: SpeechRequest):
    """Generate audio from text with [pause:XXX] marker support."""
    if not state.tts:
        raise HTTPException(status_code=503, detail="TTS engine not ready")

    text = request.text
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    try:
        voice = None
        if request.voice:
            try:
                with state.tts_lock:
                    voice = state.tts.get_preset_voice(request.voice)
            except ValueError:
                pass

        emotion_tag = "<|emotion_0|>" if request.emotion == "natural" else None

        if request.stream:
            def audio_stream_generator():
                with state.tts_lock:
                    for chunk in state.tts.infer_stream(text, voice=voice, temperature=0.3, emotion_tag=emotion_tag):
                        if chunk is not None and len(chunk) > 0:
                            yield (chunk * 32767).astype(np.int16).tobytes()
            from fastapi.responses import StreamingResponse
            return StreamingResponse(audio_stream_generator(), media_type="application/octet-stream")
        else:
            with state.tts_lock:
                audio_data = generate_audio_with_pause(state.tts, text, voice=voice, silence_p=request.silence_p, emotion_tag=emotion_tag)

            voice_name = request.voice or "default"
            save_audio_to_disk(audio_data, state.tts.sample_rate, voice_name, text)
            return audio_to_response(audio_data, state.tts.sample_rate)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/v1/audio/clone")
async def clone_speech(
    text: str = Form(...),
    reference_text: str = Form(...),
    reference_audio: UploadFile = File(...)
):
    """Zero-shot Voice Cloning."""
    if not state.tts:
        raise HTTPException(status_code=503, detail="TTS engine not ready")

    try:
        tmp_path = save_upload_to_tempfile(reference_audio)

        with state.tts_lock:
            ref_codes = state.tts.encode_reference(tmp_path)
            os.remove(tmp_path)
            audio_data = state.tts.infer(text, ref_codes=ref_codes, ref_text=reference_text)

        save_audio_to_disk(audio_data, state.tts.sample_rate, "clone", text)
        return audio_to_response(audio_data, state.tts.sample_rate)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/v1/audio/dialogue")
async def generate_dialogue(request: DialogueRequest):
    """Generate dialogue/conversation audio with multiple speakers."""
    if not state.tts:
        raise HTTPException(status_code=503, detail="TTS engine not ready")

    if not request.lines:
        raise HTTPException(status_code=400, detail="At least one dialogue line is required")

    try:
        audio_segments = []

        with state.tts_lock:
            for i, line in enumerate(request.lines):
                print(f"   [DIALOGUE] Line {i+1}/{len(request.lines)}: voice={line.voice}, text='{line.text[:50]}...'")

                voice = None
                try:
                    voice = state.tts.get_preset_voice(line.voice)
                except ValueError:
                    pass

                emotion_tag = "<|emotion_0|>" if line.emotion == "natural" else None
                audio = generate_audio_with_pause(state.tts, line.text, voice=voice, silence_p=0.1, emotion_tag=emotion_tag)
                audio_segments.append(audio)

                if line.pause_after > 0 and i < len(request.lines) - 1:
                    silence = np.zeros(int(line.pause_after * state.tts.sample_rate), dtype=np.float32)
                    audio_segments.append(silence)

        full_audio = np.concatenate(audio_segments)

        voice_names = "_".join(set(l.voice for l in request.lines))
        first_text = request.lines[0].text[:20]
        save_audio_to_disk(full_audio, state.tts.sample_rate, f"dialogue_{voice_names}", first_text)

        return audio_to_response(full_audio, state.tts.sample_rate)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/v1/audio/history")
async def list_audio_history():
    """List all saved audio files."""
    files = []
    for f in sorted(OUTPUTS_DIR.glob("*.wav"), key=lambda x: x.stat().st_mtime, reverse=True):
        stat = f.stat()
        files.append({
            "filename": f.name,
            "size_kb": round(stat.st_size / 1024, 1),
            "created": datetime.fromtimestamp(stat.st_mtime).isoformat(),
        })
    return {"files": files, "total": len(files)}


@router.get("/v1/audio/file/{filename}")
async def get_audio_file(filename: str):
    """Serve a saved audio file."""
    filepath = (OUTPUTS_DIR / filename).resolve()
    try:
        filepath.relative_to(OUTPUTS_DIR.resolve())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid path")
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath, media_type="audio/wav", filename=filename)


@router.delete("/v1/audio/file/{filename}")
async def delete_audio_file(filename: str):
    """Delete a saved audio file."""
    filepath = (OUTPUTS_DIR / filename).resolve()
    try:
        filepath.relative_to(OUTPUTS_DIR.resolve())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid path")
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    filepath.unlink()
    return {"status": "ok", "message": f"Deleted {filename}"}
