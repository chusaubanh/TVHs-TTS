from typing import List, Optional

from pydantic import BaseModel

from backend.config import DEFAULT_SILENCE_P, DEFAULT_SPEED


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
    speed: float = DEFAULT_SPEED
    silence_p: float = DEFAULT_SILENCE_P
    emotion: str = "natural"
