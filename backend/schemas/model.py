from pydantic import BaseModel, Field


class SwitchModelRequest(BaseModel):
    type: str = Field(..., pattern="^(gguf|pytorch|turbo)$")
