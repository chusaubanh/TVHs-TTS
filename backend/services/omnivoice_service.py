"""OmniVoice TTS and voice cloning service."""

import os
import json
import shutil
from datetime import datetime
from pathlib import Path

from backend.config import LOCAL_OMNIVOICE_DIR, REMOTE_OMNIVOICE_REPO, SAVED_VOICES_DIR, get_outputs_dir
from backend.state import state
from backend.utils.audio import (
    audio_to_response,
    normalize_audio,
    save_upload_to_tempfile,
    unpack_audio_result,
)
from backend.utils.files import is_omnivoice_downloaded
from backend.utils.hardware import has_cuda
from backend.utils.languages import normalize_omnivoice_language

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


def generate_tts(text: str, language: str = "vie", speed: float = 1.0, voice_name: str | None = None, instruct: str | None = None):
    """Generate speech with OmniVoice. If voice_name is set, use saved reference audio."""
    language = normalize_omnivoice_language(language)
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
            voice_clone_prompt = state.omnivoice_tts.create_voice_clone_prompt(ref_audio=str(ref_audio))
            kwargs = {
                "text": text,
                "voice_clone_prompt": voice_clone_prompt,
                "language": language,
                "speed": speed,
            }
            if instruct:
                kwargs["instruct"] = instruct
            result = state.omnivoice_tts.generate(**kwargs)
    else:
        kwargs = {"text": text, "language": language, "speed": speed}
        if instruct:
            kwargs["instruct"] = instruct
        with state.omnivoice_lock:
            result = state.omnivoice_tts.generate(**kwargs)

    audio_data, sample_rate = unpack_audio_result(result, state.omnivoice_tts)
    audio_data = normalize_audio(audio_data)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"omnivoice_{timestamp}.wav"
    filepath = get_outputs_dir() / filename
    sf.write(str(filepath), audio_data, sample_rate, format='WAV')

    return audio_to_response(audio_data, sample_rate)


def generate_clone(text: str, reference_audio, language: str = "vie", speed: float = 1.0, save_as: str = ""):
    """Voice clone with OmniVoice. If save_as is provided, save the voice for reuse."""
    language = normalize_omnivoice_language(language)
    tmp_path = save_upload_to_tempfile(reference_audio)

    try:
        with state.omnivoice_lock:
            voice_clone_prompt = state.omnivoice_tts.create_voice_clone_prompt(ref_audio=tmp_path)
            result = state.omnivoice_tts.generate(
                text=text,
                voice_clone_prompt=voice_clone_prompt,
                language=language, speed=speed,
            )

        audio_data, sample_rate = unpack_audio_result(result, state.omnivoice_tts)
        audio_data = normalize_audio(audio_data)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"omnivoice_clone_{timestamp}.wav"
        filepath = get_outputs_dir() / filename
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
    language = normalize_omnivoice_language(language)
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
    for meta_file in sorted(SAVED_VOICES_DIR.glob("*/meta.json")):
        try:
            meta = json.loads(meta_file.read_text(encoding="utf-8"))
            audio_path = meta_file.parent / meta.get("audio_file", "")
            if audio_path.exists():
                voices.append({
                    "name": meta.get("name", meta_file.parent.name),
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
    language = normalize_omnivoice_language(language)
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
