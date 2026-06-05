"""Audio history management service."""

from datetime import datetime
from pathlib import Path

from fastapi.responses import FileResponse

from backend.config import get_outputs_dir


def list_history() -> dict:
    """List all saved audio files."""
    outputs_dir = get_outputs_dir()
    files = []
    for f in sorted(outputs_dir.glob("*.wav"), key=lambda x: x.stat().st_mtime, reverse=True):
        stat = f.stat()
        files.append({
            "filename": f.name,
            "size_kb": round(stat.st_size / 1024, 1),
            "created": datetime.fromtimestamp(stat.st_mtime).isoformat(),
        })
    return {"files": files, "total": len(files)}


def get_audio_file(filename: str) -> FileResponse:
    """Serve a saved audio file. Validates path safety."""
    outputs_dir = get_outputs_dir()
    filepath = (outputs_dir / filename).resolve()
    try:
        filepath.relative_to(outputs_dir.resolve())
    except ValueError:
        raise ValueError("Invalid path")
    if not filepath.exists():
        raise FileNotFoundError("File not found")
    return FileResponse(filepath, media_type="audio/wav", filename=filename)


def delete_audio_file(filename: str) -> dict:
    """Delete a saved audio file. Validates path safety."""
    outputs_dir = get_outputs_dir()
    filepath = (outputs_dir / filename).resolve()
    try:
        filepath.relative_to(outputs_dir.resolve())
    except ValueError:
        raise ValueError("Invalid path")
    if not filepath.exists():
        raise FileNotFoundError("File not found")
    filepath.unlink()
    return {"status": "ok", "message": f"Deleted {filename}"}
