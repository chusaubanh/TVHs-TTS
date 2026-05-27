from pydantic import BaseModel, Field


class DownloadLoraRequest(BaseModel):
    name: str = Field(..., min_length=1)


class LoadLoraRequest(BaseModel):
    name: str = Field(..., min_length=1)
