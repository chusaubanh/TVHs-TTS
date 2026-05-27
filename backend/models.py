"""Compatibility exports for backend request schemas."""

from backend.schemas.audio import DialogueLine, DialogueRequest, SpeechRequest
from backend.schemas.lora import DownloadLoraRequest, LoadLoraRequest
from backend.schemas.model import SwitchModelRequest
from backend.schemas.omnivoice import OmniVoiceCloneRequest, OmniVoiceTTSRequest

__all__ = [
    "DialogueLine",
    "DialogueRequest",
    "DownloadLoraRequest",
    "LoadLoraRequest",
    "OmniVoiceCloneRequest",
    "OmniVoiceTTSRequest",
    "SpeechRequest",
    "SwitchModelRequest",
]
