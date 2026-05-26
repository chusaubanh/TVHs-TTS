"""Global engine state with thread safety."""

import threading


class EngineState:
    """Singleton holding all TTS engine state."""

    def __init__(self):
        # VieNeu-TTS state
        self.tts = None
        self.tts_lock = threading.Lock()
        self.current_lora = None
        self.current_model_type = "gguf"  # "gguf", "pytorch", "turbo"

        # OmniVoice separate state
        self.omnivoice_tts = None
        self.omnivoice_lock = threading.Lock()
        self.omnivoice_loaded = False

        # Download progress tracking
        self.download_progress = {
            "base": {"status": "idle", "progress": 0, "message": ""},
            "lora": {"status": "idle", "progress": 0, "message": ""},
            "omnivoice": {"status": "idle", "progress": 0, "message": ""},
        }


# Global singleton instance
state = EngineState()
