"""TTS generation service: preset, clone, dialogue."""

import os

import numpy as np

from backend.state import state
from backend.helpers import (
    save_audio_to_disk, audio_to_response, generate_audio_with_pause,
    save_upload_to_tempfile,
)
from backend.config import NEUTRAL_EMOTION_TAG, DEFAULT_TEMPERATURE


def generate_speech(text: str, voice_id: str | None = None, stream: bool = False,
                    silence_p: float = 0.15, emotion: str = "natural"):
    """Generate audio from text with [pause:XXX] marker support.

    Returns either a StreamingResponse (if stream=True) or a WAV response.
    """
    voice = None
    if voice_id:
        try:
            with state.tts_lock:
                voice = state.tts.get_preset_voice(voice_id)
        except ValueError:
            pass

    emotion_tag = NEUTRAL_EMOTION_TAG if emotion == "natural" else None

    if stream:
        def audio_stream_generator():
            with state.tts_lock:
                for chunk in state.tts.infer_stream(text, voice=voice, temperature=DEFAULT_TEMPERATURE, emotion_tag=emotion_tag):
                    if chunk is not None and len(chunk) > 0:
                        yield (chunk * 32767).astype(np.int16).tobytes()
        from fastapi.responses import StreamingResponse
        return StreamingResponse(audio_stream_generator(), media_type="application/octet-stream")
    else:
        with state.tts_lock:
            audio_data = generate_audio_with_pause(state.tts, text, voice=voice, silence_p=silence_p, emotion_tag=emotion_tag)

        voice_name = voice_id or "default"
        save_audio_to_disk(audio_data, state.tts.sample_rate, voice_name, text)
        return audio_to_response(audio_data, state.tts.sample_rate)


def clone_speech(text: str, reference_text: str, reference_audio) -> "StreamingResponse":
    """Zero-shot voice cloning from reference audio."""
    tmp_path = save_upload_to_tempfile(reference_audio)

    try:
        with state.tts_lock:
            ref_codes = state.tts.encode_reference(tmp_path)
            audio_data = state.tts.infer(text, ref_codes=ref_codes, ref_text=reference_text)

        save_audio_to_disk(audio_data, state.tts.sample_rate, "clone", text)
        return audio_to_response(audio_data, state.tts.sample_rate)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def generate_dialogue(lines) -> "StreamingResponse":
    """Generate dialogue/conversation audio with multiple speakers."""
    audio_segments = []

    with state.tts_lock:
        for i, line in enumerate(lines):
            voice = None
            try:
                voice = state.tts.get_preset_voice(line.voice)
            except ValueError:
                pass

            emotion_tag = NEUTRAL_EMOTION_TAG if line.emotion == "natural" else None
            audio = generate_audio_with_pause(state.tts, line.text, voice=voice, silence_p=0.1, emotion_tag=emotion_tag)
            audio_segments.append(audio)

            if line.pause_after > 0 and i < len(lines) - 1:
                silence = np.zeros(int(line.pause_after * state.tts.sample_rate), dtype=np.float32)
                audio_segments.append(silence)

    full_audio = np.concatenate(audio_segments)

    voice_names = "_".join(set(l.voice for l in lines))
    first_text = lines[0].text[:20]
    save_audio_to_disk(full_audio, state.tts.sample_rate, f"dialogue_{voice_names}", first_text)

    return audio_to_response(full_audio, state.tts.sample_rate)


def get_voice_sample(voice_id: str):
    """Get preview audio for a preset voice."""
    from pathlib import Path

    voice_data = state.tts.get_preset_voice(voice_id)

    assets_dir = Path(__file__).resolve().parent.parent.parent / "vieneu" / "assets" / "samples"
    if assets_dir.exists():
        for file in assets_dir.iterdir():
            if file.suffix == ".wav" and voice_id.lower() in file.stem.lower():
                from fastapi.responses import FileResponse
                return FileResponse(file, media_type="audio/wav")

    from backend.config import DEFAULT_SAMPLE_TEXT
    audio_data = state.tts.infer(text=DEFAULT_SAMPLE_TEXT, voice=voice_data)
    return audio_to_response(audio_data, state.tts.sample_rate)
