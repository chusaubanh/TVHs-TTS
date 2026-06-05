# -*- mode: python ; coding: utf-8 -*-
import sys
from pathlib import Path
from PyInstaller.utils.hooks import collect_data_files, collect_dynamic_libs

ROOT = Path(SPECPATH)
APP_ICON = ROOT / "frontend" / "app" / "favicon.ico"

datas = []
binaries = []

frontend_out = ROOT / "frontend" / "out"
if frontend_out.exists():
    datas.append((str(frontend_out), "frontend/out"))

datas += collect_data_files("llama_cpp")
binaries += collect_dynamic_libs("llama_cpp")

# Do not bundle models. Packaged builds read models from the user's app-data
# directory after Download Models.bat/.command has run.

a = Analysis(
    [str(ROOT / "app.py")],
    pathex=[str(ROOT)],
    binaries=binaries,
    datas=datas,
    hiddenimports=[
        "backend",
        "vieneu",
        "vieneu_utils",
        "vieneu_utils.phonemize_text",
        "vieneu_utils.core_utils",
        "vieneu_utils.normalize_text",
        "vieneu_utils.url_extract",
        "neucodec",
        "llama_cpp",
        "fastapi",
        "uvicorn",
        "uvicorn.logging",
        "uvicorn.loops",
        "uvicorn.loops.auto",
        "uvicorn.protocols",
        "uvicorn.protocols.http",
        "uvicorn.protocols.http.auto",
        "uvicorn.protocols.websockets",
        "uvicorn.protocols.websockets.auto",
        "uvicorn.lifespan",
        "uvicorn.lifespan.on",
        "soundfile",
        "webview",
        "starlette",
        "starlette.middleware",
        "starlette.middleware.cors",
        "starlette.staticfiles",
        "peft",
        "transformers",
        "huggingface_hub",
        "librosa",
        "torch",
        "torchaudio",
        "numpy",
        "onnxruntime",
        "jaraco",
        "jaraco.text",
        "jaraco.context",
        "jaraco.functools",
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        "gradio",
        "matplotlib",
        "IPython",
        "jupyter",
        "notebook",
        "pytest",
    ],
    noarchive=False,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="ThanhVinhStudio",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=str(APP_ICON),
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name="ThanhVinhStudio",
)

if sys.platform == "darwin":
    app = BUNDLE(
        coll,
        name="ThanhVinhStudio.app",
        icon=str(APP_ICON),
        bundle_identifier="studio.thanhvinh.local",
        info_plist={
            "CFBundleName": "ThanhVinhStudio",
            "CFBundleDisplayName": "ThanhVinhStudio",
            "CFBundleShortVersionString": "4.0.1",
            "CFBundleVersion": "4.0.1",
            "NSHighResolutionCapable": True,
        },
    )
