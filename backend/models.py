"""Pydantic request/response models for the API."""

from typing import Optional, List
from pydantic import BaseModel, Field


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
    speed: float = 1.0
    silence_p: float = 0.15
    emotion: str = "natural"


class OmniVoiceTTSRequest(BaseModel):
    text: str = Field(..., min_length=1)
    language: str = Field(default="vie", description="Language code (ISO 639-3)")
    speed: float = Field(default=1.0, ge=0.5, le=2.0)


class OmniVoiceCloneRequest(BaseModel):
    text: str = Field(..., min_length=1)
    language: str = Field(default="vie")
    speed: float = Field(default=1.0, ge=0.5, le=2.0)
