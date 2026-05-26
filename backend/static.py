"""Static file serving for the packaged Next.js frontend."""

from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import FileResponse
from backend.config import BUNDLE_DIR

STATIC_DIR = BUNDLE_DIR / "frontend" / "out"


def mount_static_files(app: FastAPI):
    """Mount static file serving if frontend build exists."""
    if not STATIC_DIR.exists():
        return

    from fastapi.staticfiles import StaticFiles
    from starlette.responses import RedirectResponse

    @app.get("/studio")
    async def studio_redirect():
        return RedirectResponse(url="/studio.html")

    # Mount /_next static assets — NOT catch-all to avoid intercepting API routes
    if (STATIC_DIR / "_next").exists():
        app.mount("/_next", StaticFiles(directory=str(STATIC_DIR / "_next")), name="static_next")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve Next.js static export files. Falls back to index.html for SPA routing."""
        file_path = STATIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        html_path = STATIC_DIR / f"{full_path}.html"
        if html_path.is_file():
            return FileResponse(str(html_path))
        return FileResponse(str(STATIC_DIR / "index.html"))
