"""OmniVoice TTS and voice cloning service."""

import os
import json
import shutil
from datetime import datetime
from pathlib import Path

from backend.config import LOCAL_OMNIVOICE_DIR, REMOTE_OMNIVOICE_REPO, OUTPUTS_DIR, SAVED_VOICES_DIR
from backend.state import state
from backend.helpers import (
    is_omnivoice_downloaded, has_cuda, audio_to_response,
    normalize_audio, unpack_audio_result, save_upload_to_tempfile,
)

import soundfile as sf


def load_omnivoice() -> dict:
    """Load OmniVoice model. Returns status dict."""
    if state.omnivoice_loaded and state.omnivoice_tts is not None:
        return {"status": "already_loaded"}

    with state.omnivoice_lock:
        from omnivoice import OmniVoice as OmniVoiceModel

        _device = "cuda:0" if has_cuda() else "cpu"
        _dtype = "float16" if has_cuda() else "float32"

        if is_omnivoice_downloaded():
            model_path = str(LOCAL_OMNIVOICE_DIR)
        else:
            model_path = REMOTE_OMNIVOICE_REPO

        state.omnivoice_tts = OmniVoiceModel.from_pretrained(model_path, device_map=_device, dtype=_dtype)
        state.omnivoice_loaded = True

    return {"status": "ok", "device": _device, "source": "local" if is_omnivoice_downloaded() else "huggingface"}


def unload_omnivoice() -> dict:
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


def generate_tts(text: str, language: str = "vie", speed: float = 1.0, voice_name: str | None = None):
    """Generate speech with OmniVoice. If voice_name is set, use saved reference audio."""
    if voice_name:
        voice_dir = SAVED_VOICES_DIR / voice_name
        meta_path = voice_dir / "meta.json"
        if not meta_path.exists():
            raise FileNotFoundError(f"Voice '{voice_name}' not found")
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        ref_audio = voice_dir / meta.get("audio_file", "")
        if not ref_audio.exists():
            raise FileNotFoundError("Reference audio not found for this voice")

        with state.omnivoice_lock:
            result = state.omnivoice_tts.clone(
                text=text, reference_audio=str(ref_audio),
                language=language, speed=speed,
            )
    else:
        with state.omnivoice_lock:
            result = state.omnivoice_tts.generate(
                text=text, language=language, speed=speed,
            )

    audio_data, sample_rate = unpack_audio_result(result, state.omnivoice_tts)
    audio_data = normalize_audio(audio_data)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"omnivoice_{timestamp}.wav"
    filepath = OUTPUTS_DIR / filename
    sf.write(str(filepath), audio_data, sample_rate, format='WAV')

    return audio_to_response(audio_data, sample_rate)


def generate_clone(text: str, reference_audio, language: str = "vie", speed: float = 1.0, save_as: str = ""):
    """Voice clone with OmniVoice. If save_as is provided, save the voice for reuse."""
    tmp_path = save_upload_to_tempfile(reference_audio)

    try:
        with state.omnivoice_lock:
            result = state.omnivoice_tts.clone(
                text=text, reference_audio=tmp_path,
                language=language, speed=speed,
            )

        audio_data, sample_rate = unpack_audio_result(result, state.omnivoice_tts)
        audio_data = normalize_audio(audio_data)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"omnivoice_clone_{timestamp}.wav"
        filepath = OUTPUTS_DIR / filename
        sf.write(str(filepath), audio_data, sample_rate, format='WAV')

        # Save voice if requested
        if save_as and save_as.strip():
            _save_voice(save_as.strip(), tmp_path, language)

        return audio_to_response(audio_data, sample_rate)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def _save_voice(voice_name: str, ref_audio_path: str, language: str):
    """Save a cloned voice for reuse."""
    voice_dir = SAVED_VOICES_DIR / voice_name
    voice_dir.mkdir(parents=True, exist_ok=True)

    ref_filename = f"reference{Path(ref_audio_path).suffix}"
    shutil.copy2(ref_audio_path, voice_dir / ref_filename)

    meta = {
        "name": voice_name,
        "language": language,
        "audio_file": ref_filename,
        "created": datetime.now().isoformat(),
    }
    (voice_dir / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")


def list_saved_voices() -> list[dict]:
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


def delete_saved_voice(name: str) -> bool:
    """Delete a saved voice. Returns True if deleted."""
    voice_dir = SAVED_VOICES_DIR / name
    if not voice_dir.exists():
        return False
    shutil.rmtree(voice_dir, ignore_errors=True)
    return True


async def save_voice_from_upload(name: str, reference_audio, language: str) -> dict:
    """Save a voice from uploaded reference audio."""
    voice_name = name.strip()
    voice_dir = SAVED_VOICES_DIR / voice_name
    if voice_dir.exists():
        raise ValueError(f"Voice '{voice_name}' already exists")

    voice_dir.mkdir(parents=True, exist_ok=True)

    try:
        ext = Path(reference_audio.filename or ".wav").suffix or ".wav"
        ref_filename = f"reference{ext}"
        ref_path = voice_dir / ref_filename
        content = await reference_audio.read()
        ref_path.write_bytes(content)

        meta = {
            "name": voice_name,
            "language": language,
            "audio_file": ref_filename,
            "created": datetime.now().isoformat(),
        }
        (voice_dir / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
        return {"status": "ok", "name": voice_name, "voices": list_saved_voices()}
    except Exception as e:
        if voice_dir.exists():
            shutil.rmtree(voice_dir, ignore_errors=True)
        raise
