"""Pydantic request/response models for the API."""

from typing import Optional, List
from pydantic import BaseModel, Field

from backend.config import DEFAULT_SILENCE_P, DEFAULT_SPEED


class SwitchModelRequest(BaseModel):
    type: str = Field(..., pattern="^(gguf|pytorch|turbo)$")


class DownloadLoraRequest(BaseModel):
    name: str = Field(..., min_length=1)


class LoadLoraRequest(BaseModel):
    name: str = Field(..., min_length=1)


class DialogueLine(BaseModel):
    text: str
    voice: str
    pause_after: float = 0.5
    emotion: str = "natural"


class DialogueRequest(BaseModel):
    lines: List[DialogueLine]


class SpeechRequest(BaseModel):
    text: str
    voice: Optional[str] = None
    stream: bool = False
    speed: float = DEFAULT_SPEED
    silence_p: float = DEFAULT_SILENCE_P
    emotion: str = "natural"


class OmniVoiceTTSRequest(BaseModel):
    text: str = Field(..., min_length=1)
    language: str = Field(default="vie", description="Language code (ISO 639-3)")
    speed: float = Field(default=DEFAULT_SPEED, ge=0.5, le=2.0)
    voice_name: Optional[str] = Field(default=None, description="Saved voice name to use as reference")


class OmniVoiceCloneRequest(BaseModel):
    text: str = Field(..., min_length=1)
    language: str = Field(default="vie")
    speed: float = Field(default=DEFAULT_SPEED, ge=0.5, le=2.0)
