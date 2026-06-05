import io
import os
import re
import shutil
import tempfile
import unicodedata
from datetime import datetime

import numpy as np
import soundfile as sf
from fastapi.responses import StreamingResponse

from backend.config import DEFAULT_SILENCE_P, get_outputs_dir


def _ascii_slug(value: str, fallback: str = "audio") -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^A-Za-z0-9]+", "_", ascii_text).strip("_")
    return slug or fallback


def _safe_print(message: str) -> None:
    try:
        print(message)
    except UnicodeEncodeError:
        print(message.encode("ascii", "replace").decode("ascii"))


def save_audio_to_disk(audio_data: np.ndarray, sample_rate: int, voice: str = "unknown", text: str = "") -> str:
    """Save generated audio to outputs/ directory. Returns filename."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_text = _ascii_slug(text[:30])
    safe_voice = _ascii_slug(voice, "voice")
    filename = f"{timestamp}_{safe_voice}_{safe_text}.wav"
    filepath = get_outputs_dir() / filename
    sf.write(str(filepath), audio_data, sample_rate, format="WAV")
    _safe_print(f"   [SAVE] Audio saved: {filename}")
    return filename


def audio_to_response(audio_data: np.ndarray, sample_rate: int) -> StreamingResponse:
    """Convert audio array to WAV StreamingResponse."""
    buffer = io.BytesIO()
    sf.write(buffer, audio_data, sample_rate, format="WAV")
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="audio/wav")


def normalize_audio(audio_data: np.ndarray) -> np.ndarray:
    """Normalize audio to float32 with peak <= 1.0."""
    if audio_data.dtype != np.float32:
        audio_data = audio_data.astype(np.float32)
    peak = np.abs(audio_data).max()
    if peak > 1.0:
        audio_data = audio_data / peak
    return audio_data


def unpack_audio_result(result, default_engine) -> tuple[np.ndarray, int]:
    """Unpack model audio output into a single waveform and sample rate."""
    if isinstance(result, tuple):
        audio_data, sample_rate = result
    else:
        audio_data = result[0] if isinstance(result, list) else result
        sample_rate = getattr(
            default_engine,
            "sample_rate",
            getattr(default_engine, "sampling_rate", 24000),
        )

    return audio_data, sample_rate


def save_upload_to_tempfile(upload) -> str:
    """Save UploadFile to a temporary file. Returns the temp file path."""
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    shutil.copyfileobj(upload.file, tmp)
    tmp.close()
    return tmp.name


def generate_audio_with_pause(
    tts_engine,
    text: str,
    voice=None,
    silence_p: float = DEFAULT_SILENCE_P,
    emotion_tag: str = None,
) -> np.ndarray:
    """Generate audio with [pause:XXX] marker support."""
    parts = re.split(r"\[pause:(\d+(?:\.\d+)?)(s|ms)?\]", text)

    if len(parts) == 1:
        return tts_engine.infer(text, voice=voice, silence_p=silence_p, emotion_tag=emotion_tag)

    audio_segments = []
    i = 0
    while i < len(parts):
        segment = parts[i].strip()
        if segment:
            _safe_print(f"   [PAUSE] Generating segment: '{_ascii_slug(segment[:50])}...'")
            audio = tts_engine.infer(segment, voice=voice, silence_p=silence_p, emotion_tag=emotion_tag)
            audio_segments.append(audio)

        if i + 1 < len(parts):
            duration = float(parts[i + 1])
            unit = parts[i + 2] if i + 2 < len(parts) else "ms"
            pause_seconds = duration if unit == "s" else duration / 1000.0
            silence = np.zeros(int(pause_seconds * tts_engine.sample_rate), dtype=np.float32)
            audio_segments.append(silence)
            _safe_print(f"   [PAUSE] Inserted {pause_seconds}s silence")
            i += 3
        else:
            i += 1

    return np.concatenate(audio_segments)


def remove_temp_file(path: str) -> None:
    if os.path.exists(path):
        os.remove(path)
