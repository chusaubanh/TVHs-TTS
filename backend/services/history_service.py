"""Audio history management service."""

from datetime import datetime
from pathlib import Path

from fastapi.responses import FileResponse

from backend.config import OUTPUTS_DIR


def list_history() -> dict:
    """List all saved audio files."""
    files = []
    for f in sorted(OUTPUTS_DIR.glob("*.wav"), key=lambda x: x.stat().st_mtime, reverse=True):
        stat = f.stat()
        files.append({
            "filename": f.name,
            "size_kb": round(stat.st_size / 1024, 1),
            "created": datetime.fromtimestamp(stat.st_mtime).isoformat(),
        })
    return {"files": files, "total": len(files)}


def get_audio_file(filename: str) -> FileResponse:
    """Serve a saved audio file. Validates path safety."""
    filepath = (OUTPUTS_DIR / filename).resolve()
    try:
        filepath.relative_to(OUTPUTS_DIR.resolve())
    except ValueError:
        raise ValueError("Invalid path")
    if not filepath.exists():
        raise FileNotFoundError("File not found")
    return FileResponse(filepath, media_type="audio/wav", filename=filename)


def delete_audio_file(filename: str) -> dict:
    """Delete a saved audio file. Validates path safety."""
    filepath = (OUTPUTS_DIR / filename).resolve()
    try:
        filepath.relative_to(OUTPUTS_DIR.resolve())
    except ValueError:
        raise ValueError("Invalid path")
    if not filepath.exists():
        raise FileNotFoundError("File not found")
    filepath.unlink()
    return {"status": "ok", "message": f"Deleted {filename}"}
