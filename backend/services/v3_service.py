"""VieNeu-TTS v3 Turbo generation service."""

import os
from datetime import datetime
from backend.state import state
from backend.utils.audio import audio_to_response, save_upload_to_tempfile
from backend.config import get_outputs_dir
import soundfile as sf
import traceback

def load_v3() -> dict:
    """Load VieNeu-TTS v3 Turbo model."""
    if state.v3_loaded and state.v3_tts is not None:
        return {"status": "already_loaded"}

    with state.v3_lock:
        try:
            from vieneu import Vieneu
            from backend.config import LOCAL_V3_DIR
            
            kwargs = {}
            if LOCAL_V3_DIR.exists() and any(LOCAL_V3_DIR.iterdir()):
                kwargs["backbone_repo"] = str(LOCAL_V3_DIR)
                kwargs["onnx_dir"] = str(LOCAL_V3_DIR / "onnx")
                
            state.v3_tts = Vieneu(mode="v3turbo", **kwargs)
            state.v3_loaded = True
            return {"status": "ok"}
        except Exception as e:
            traceback.print_exc()
            return {"status": "error", "message": str(e)}

def unload_v3() -> dict:
    """Unload v3 Turbo model to free memory."""
    with state.v3_lock:
        if state.v3_tts is not None:
            try:
                del state.v3_tts
            except Exception:
                pass
        state.v3_tts = None
        state.v3_loaded = False

    from backend.utils.hardware import has_cuda
    if has_cuda():
        try:
            import torch
            torch.cuda.empty_cache()
        except Exception:
            pass

    return {"status": "ok"}

def generate_v3_tts(text: str, voice_name: str | None = None):
    """Generate speech using v3 default voices."""
    with state.v3_lock:
        if voice_name:
            audio_data = state.v3_tts.infer(text, voice=voice_name)
        else:
            audio_data = state.v3_tts.infer(text)
            
        sample_rate = state.v3_tts.sample_rate

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    voice_suffix = f"_{voice_name}" if voice_name else ""
    filename = f"v3turbo{voice_suffix}_{timestamp}.wav"
    filepath = get_outputs_dir() / filename
    
    sf.write(str(filepath), audio_data, sample_rate, format='WAV')

    return audio_to_response(audio_data, sample_rate)

def generate_v3_clone(text: str, reference_audio):
    """Zero-shot voice cloning with v3 Turbo."""
    tmp_path = save_upload_to_tempfile(reference_audio)

    try:
        with state.v3_lock:
            audio_data = state.v3_tts.infer(text, ref_audio=tmp_path)
            sample_rate = state.v3_tts.sample_rate

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"v3turbo_clone_{timestamp}.wav"
        filepath = get_outputs_dir() / filename
        sf.write(str(filepath), audio_data, sample_rate, format='WAV')

        return audio_to_response(audio_data, sample_rate)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

def list_preset_voices() -> list[dict]:
    """Get list of preset voices from v3 Turbo."""
    with state.v3_lock:
        if not state.v3_loaded or state.v3_tts is None:
            return []
        voices = state.v3_tts.list_preset_voices()
        return [{"label": label, "id": voice_id} for label, voice_id in voices]
