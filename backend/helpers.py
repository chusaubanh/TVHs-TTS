"""Compatibility utility exports plus TTS engine factory and network helpers."""

import socket
from pathlib import Path

from backend.config import GGUF_FILENAME, LOCAL_GGUF_DIR, REMOTE_PYTORCH_REPO
from backend.utils.audio import (
    audio_to_response,
    generate_audio_with_pause,
    normalize_audio,
    save_audio_to_disk,
    save_upload_to_tempfile,
    unpack_audio_result,
)
from backend.utils.downloads import download_with_progress
from backend.utils.files import (
    build_lora_list,
    find_lora_path,
    find_model_path,
    is_base_model_downloaded,
    is_omnivoice_downloaded,
    list_local_loras,
)
from backend.utils.hardware import has_cuda


def create_viener_engine(model_type: str = "gguf"):
    """Create a Vieneu TTS engine instance for the given model type."""
    try:
        from vieneu import Vieneu
    except ModuleNotFoundError as exc:
        if exc.name == "vieneu":
            raise RuntimeError(
                "Missing Python package 'vieneu'. Run repair.bat on Windows, "
                "or ./repair.sh on macOS/Linux, then start the app again."
            ) from exc
        raise

    if model_type == "pytorch":
        return Vieneu(
            mode="standard",
            backbone_repo=REMOTE_PYTORCH_REPO,
            gguf_filename=None,
            backbone_device="cuda" if has_cuda() else "cpu",
            codec_device="cpu",
            emotion="natural",
        )
    if model_type == "turbo":
        return Vieneu(
            mode="turbo",
            backbone_device="cpu",
            codec_device="cpu",
        )
    patch_llama_local_from_pretrained()
    return Vieneu(
        mode="standard",
        backbone_repo=str(LOCAL_GGUF_DIR),
        gguf_filename=GGUF_FILENAME,
        backbone_device="cpu",
        codec_device="cpu",
        emotion="natural",
    )


def patch_llama_local_from_pretrained():
    """Allow vieneu's GGUF loader to consume a local model directory on Windows."""
    try:
        from llama_cpp import Llama
    except Exception:
        return

    if getattr(Llama.from_pretrained, "_thanhvinhstudio_patched", False):
        return

    original_from_pretrained = Llama.from_pretrained

    @classmethod
    def from_pretrained_local(cls, repo_id: str, filename: str = "*.gguf", **kwargs):
        repo_path = Path(repo_id)
        if repo_path.exists():
            if filename and filename != "*.gguf":
                model_path = repo_path / filename
            else:
                matches = list(repo_path.glob("*.gguf"))
                if not matches:
                    raise FileNotFoundError(f"No GGUF model found in {repo_path}")
                model_path = matches[0]

            allowed = {
                "verbose",
                "n_gpu_layers",
                "n_ctx",
                "flash_attn",
            }
            llama_kwargs = {key: value for key, value in kwargs.items() if key in allowed}
            if "mlock" in kwargs:
                llama_kwargs["use_mlock"] = kwargs["mlock"]
            return cls(model_path=str(model_path), **llama_kwargs)

        return original_from_pretrained(repo_id=repo_id, filename=filename, **kwargs)

    from_pretrained_local._thanhvinhstudio_patched = True
    Llama.from_pretrained = from_pretrained_local


def find_available_port(start_port: int = 8000, max_tries: int = 10) -> int:
    """Find an available port, starting from start_port."""
    for port in range(start_port, start_port + max_tries):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            sock.bind(("127.0.0.1", port))
            sock.close()
            return port
        except OSError:
            continue
    return start_port


__all__ = [
    "audio_to_response",
    "build_lora_list",
    "create_viener_engine",
    "download_with_progress",
    "find_available_port",
    "find_lora_path",
    "find_model_path",
    "generate_audio_with_pause",
    "has_cuda",
    "is_base_model_downloaded",
    "is_omnivoice_downloaded",
    "list_local_loras",
    "normalize_audio",
    "save_audio_to_disk",
    "save_upload_to_tempfile",
    "unpack_audio_result",
]
