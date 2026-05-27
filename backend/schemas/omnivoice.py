from typing import Optional

from pydantic import BaseModel, Field

from backend.config import DEFAULT_SPEED


class OmniVoiceTTSRequest(BaseModel):
    text: str = Field(..., min_length=1)
    language: str = Field(default="Vietnamese", description="Language name or legacy ISO code")
    speed: float = Field(default=DEFAULT_SPEED, ge=0.5, le=2.0)
    voice_name: Optional[str] = Field(default=None, description="Saved voice name to use as reference")
    instruct: Optional[str] = Field(default=None, description="Voice design instruction (e.g. 'female, young adult, high pitch')")


class OmniVoiceCloneRequest(BaseModel):
    text: str = Field(..., min_length=1)
    language: str = Field(default="Vietnamese")
    speed: float = Field(default=DEFAULT_SPEED, ge=0.5, le=2.0)
