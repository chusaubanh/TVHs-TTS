from backend.config import DOWNLOAD_IGNORE_PATTERNS
from backend.state import state


def download_with_progress(repo_id: str, local_dir: str, key: str, allow_patterns: list = None):
    """Download a repo with progress tracking. Intended to run in a background thread."""
    try:
        state.download_progress[key]["status"] = "downloading"
        state.download_progress[key]["message"] = f"Dang tai {repo_id}..."
        state.download_progress[key]["progress"] = 10

        from huggingface_hub import snapshot_download

        kwargs = {
            "repo_id": repo_id,
            "local_dir": local_dir,
            "ignore_patterns": DOWNLOAD_IGNORE_PATTERNS,
        }
        if allow_patterns:
            kwargs["allow_patterns"] = allow_patterns

        snapshot_download(**kwargs)

        state.download_progress[key]["status"] = "done"
        state.download_progress[key]["progress"] = 100
        state.download_progress[key]["message"] = "Tai xong!"
    except Exception as e:
        state.download_progress[key]["status"] = "error"
        state.download_progress[key]["message"] = str(e)
