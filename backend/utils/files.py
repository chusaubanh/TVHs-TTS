from backend.config import LOCAL_GGUF_DIR, LOCAL_LORA_DIR, LOCAL_OMNIVOICE_DIR, KNOWN_LORAS, REMOTE_GGUF_REPO


def is_base_model_downloaded() -> bool:
    """Check if base model is available locally."""
    if LOCAL_GGUF_DIR.exists():
        return len(list(LOCAL_GGUF_DIR.glob("*.gguf"))) > 0
    return False


def is_omnivoice_downloaded() -> bool:
    """Check if OmniVoice model is downloaded locally."""
    return LOCAL_OMNIVOICE_DIR.exists() and any(LOCAL_OMNIVOICE_DIR.iterdir())


def list_local_loras() -> list[str]:
    """List locally available LoRA adapters."""
    loras = []
    if LOCAL_LORA_DIR.exists():
        for item in sorted(LOCAL_LORA_DIR.iterdir()):
            if item.is_dir() and any(item.iterdir()):
                loras.append(item.name)
    return loras


def find_model_path() -> str:
    """Find the best available model path."""
    if is_base_model_downloaded():
        print(f"Using local model: {LOCAL_GGUF_DIR}")
        return str(LOCAL_GGUF_DIR)
    print(f"Local model not found. Using remote: {REMOTE_GGUF_REPO}")
    return REMOTE_GGUF_REPO


def find_lora_path(lora_name: str) -> str:
    """Find LoRA adapter path."""
    local_path = LOCAL_LORA_DIR / lora_name
    if local_path.exists():
        if (local_path / "adapter_config.json").exists():
            return str(local_path)
        checkpoints = sorted(
            [directory for directory in local_path.iterdir() if directory.is_dir() and directory.name.startswith("checkpoint-")],
            key=lambda directory: int(directory.name.split("-")[-1]),
            reverse=True,
        )
        for checkpoint in checkpoints:
            if (checkpoint / "adapter_config.json").exists():
                return str(checkpoint)
    if "/" in lora_name:
        return lora_name
    known = KNOWN_LORAS.get(lora_name)
    if known:
        return known["repo"]
    return lora_name


def build_lora_list() -> list[dict]:
    """Build the combined local + remote LoRA list."""
    local_loras = list_local_loras()
    data = []
    for name in local_loras:
        info = KNOWN_LORAS.get(name, {})
        data.append({
            "id": name,
            "name": info.get("name", name.replace("-", " ").title()),
            "source": "local",
            "downloaded": True,
        })
    for name, info in KNOWN_LORAS.items():
        if name not in local_loras:
            data.append({
                "id": name,
                "name": info["name"],
                "source": "remote",
                "downloaded": False,
            })
    return data
