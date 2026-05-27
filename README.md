<div align="center">

# Thành Vinh Studio

**Ứng dụng tổng hợp giọng nói tiếng Việt chạy offline trên máy tính**

![License](https://img.shields.io/badge/license-Private-red)
![Python](https://img.shields.io/badge/python-3.10+-blue?logo=python&logoColor=white)
![Next.js](https://img.shields.io/badge/next.js-15-black?logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/fastapi-0.110+-009688?logo=fastapi&logoColor=white)
![Status](https://img.shields.io/badge/status-stable-brightgreen)

<p>Tổng hợp giọng nói tiếng Việt chất lượng cao với voice cloning, dialogue nhiều giọng, và quản lý LoRA — chạy offline sau khi đã tải đủ model lần đầu.</p>

</div>

---

## Tính năng chính

| Tính năng | Mô tả |
|-----------|-------|
| **Preset Voices** | Chọn giọng từ thư viện, điều chỉnh cảm xúc và tốc độ |
| **Voice Clone** | Tạo giọng giống từ mẫu audio 3–10 giây |
| **Dialogue** | Kịch bản hội thoại nhiều giọng, mỗi dòng một voice riêng |
| **Streaming** | Phát audio ngay trong khi đang sinh, không cần chờ |
| **LoRA Adapter** | Tải và bật/tắt LoRA để tinh chỉnh giọng nói |
| **Multi-Engine** | Hỗ trợ GGUF (CPU), PyTorch (GPU), Turbo (cân bằng) |
| **History** | Lưu, phát lại, tải về mọi file đã tạo |
| **Local-First** | Chạy offline sau khi tải model, dữ liệu không rời khỏi máy |

---

## Yêu cầu hệ thống

| Thành phần | Tối thiểu | Khuyến nghị |
|------------|-----------|-------------|
| OS | Windows 10 / macOS 12+ / Ubuntu 20.04 | Windows 11 / macOS 14+ / Ubuntu 22.04+ |
| CPU | Intel i5 / Ryzen 5 / Apple M1 | Intel i7 / Ryzen 7+ / Apple M2+ |
| RAM | 8 GB | 16 GB+ |
| GPU | Không bắt buộc | NVIDIA GPU 4GB+ VRAM (hoặc Apple Silicon) |
| Python | 3.10+ | 3.12 |
| Node.js | 18+ | 20+ |

---

## Cài đặt nhanh

### Prerequisites (cần cài trước)

| Phần mềm | Phiên bản | Bắt buộc? | Tải tại |
|-----------|-----------|-----------|---------|
| **Python** | 3.10+ (khuyến nghị 3.12) | Có | https://www.python.org/downloads/ |
| **Node.js** | 18+ (khuyến nghị 20 LTS) | Có | https://nodejs.org/ |
| **uv** (Astral) | latest | Có | `powershell -c "irm https://astral.sh/uv/install.ps1 \| iex"` |
| **eSpeak NG** | latest | Có | https://github.com/espeak-ng/espeak-ng/releases |
| **NVIDIA Driver** | 570.65+ (CUDA 12.8) | Không (cho GPU) | https://www.nvidia.com/drivers |

> Script cài đặt sẽ tự động kiểm tra và cài đặt tất cả prerequisites nếu thiếu. Chỉ cần cài **Python** và **Node.js** trước.

### Cách 1: Dùng script tự động (khuyến nghị)

**Windows:**
```bash
git clone https://github.com/chusaubanh/ThanhVinhStudio
cd ThanhVinhStudio
install.bat    # Tự động cài uv, Node.js, eSpeak NG, Python & Node dependencies
start.bat      # Khởi động ứng dụng
```

Nếu gặp lỗi vặt khi chạy lại app như port 3000/8000 đang bận, Next.js lock file, thiếu `node_modules`, hoặc lỗi `sea_g2p.Normalizer`, chạy:

```bash
repair.bat
start.bat
```

**macOS / Linux:**
```bash
git clone https://github.com/chusaubanh/ThanhVinhStudio
cd ThanhVinhStudio
chmod +x install.sh start.sh
./install.sh   # Tự động cài uv, Node.js, eSpeak NG, Python & Node dependencies
./start.sh     # Khởi động ứng dụng
```

> macOS: Cần cài [Homebrew](https://brew.sh/) trước để script tự động cài eSpeak NG.
> Linux: Script hỗ trợ apt (Ubuntu/Debian) và dnf (Fedora).

### Cách 2: Cài thủ công

```bash
git clone https://github.com/chusaubanh/ThanhVinhStudio
cd ThanhVinhStudio
```

**Backend (FastAPI):**
```bash
uv sync                                    # Cài Python dependencies
uv run python -m backend.main              # Chạy backend tại http://localhost:8000
```

**Frontend (Next.js):**
```bash
cd frontend
npm install                                # Cài Node dependencies
npm run dev                                # Chạy frontend tại http://localhost:3000
```

### Build production

```bash
cd frontend
npm run build
```

Frontend sẽ được export tĩnh vào `frontend/out/`, sau đó backend FastAPI sẽ serve trực tiếp.

---

## Cấu trúc dự án

```
ThanhVinhStudio/
├── app.py                    # Desktop launcher (pywebview)
├── backend/
│   ├── main.py               # FastAPI app creation, lifespan, CORS
│   ├── config.py             # Paths, constants, known models
│   ├── models.py             # Pydantic request/response models
│   ├── state.py              # Global engine state (singleton)
│   ├── helpers.py            # Utility functions (audio, download, hardware)
│   ├── static.py             # Static file serving (SPA fallback)
│   └── routers/
│       ├── system.py         # /health, /v1/hardware, /v1/models, /v1/status
│       ├── downloads.py      # /v1/download/*, /v1/omnivoice/download-status
│       ├── models_lora.py    # /v1/models/switch, /v1/lora/*
│       ├── audio.py          # /v1/audio/speech, /clone, /dialogue, /history
│       └── omnivoice.py      # /v1/omnivoice/load, /tts, /clone
├── frontend/
│   ├── app/
│   │   ├── page.tsx          # Landing page
│   │   ├── studio/page.tsx   # Main app shell (Dashboard, Studio, OmniVoice, etc.)
│   │   ├── features/page.tsx # Trang Tính năng
│   │   ├── guide/page.tsx    # Trang Hướng dẫn
│   │   ├── types/index.ts    # Shared TypeScript interfaces
│   │   ├── lib/              # api.ts, audio.ts, format.ts, constants.ts
│   │   ├── hooks/            # Custom React hooks (9 hooks)
│   │   └── components/       # UI components (sidebar, player, dashboard, etc.)
│   └── public/
├── models/                   # Model weights (tự động tải)
│   ├── base/                 # VieNeu-TTS GGUF model
│   ├── lora/                 # LoRA adapters
│   └── omnivoice/            # OmniVoice TTS model (~1.5GB)
├── outputs/                  # Audio output
├── build.py                  # Script build standalone (PyInstaller)
├── install.bat               # Script cài đặt (Windows)
├── install.sh                # Script cài đặt (macOS / Linux)
├── start.bat                 # Script khởi động (Windows)
└── start.sh                  # Script khởi động (macOS / Linux)
```

---

## Kiến trúc

```
┌─────────────────────────────────────────────────┐
│                   Frontend (Next.js)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Landing  │  │  Studio  │  │ Features /   │  │
│  │  Page    │  │ OmniVoice│  │ Guide / etc  │  │
│  └──────────┘  └────┬─────┘  └──────────────┘  │
│                     │ fetch                      │
├─────────────────────┼───────────────────────────┤
│              Backend (FastAPI)                   │
│  ┌──────────────────┴────────────────────────┐  │
│  │  routers/system    — Health, hardware     │  │
│  │  routers/audio     — TTS, clone, dialogue │  │
│  │  routers/models    — Switch, LoRA         │  │
│  │  routers/downloads — Model downloads      │  │
│  │  routers/omnivoice — OmniVoice engine     │  │
│  └───────────────────────────────────────────┘  │
│                     │                            │
│  ┌──────────────────┴────────────────────────┐  │
│  │  VieNeu-TTS    │    OmniVoice             │  │
│  │  GGUF/PyTorch  │    0.6B, 600+ languages  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## Công nghệ

| Layer | Công nghệ |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS v4, TypeScript |
| Backend | FastAPI, Python 3.12, uvicorn |
| TTS Engine | VieNeu-TTS (GGUF / PyTorch / Turbo), OmniVoice (0.6B) |
| UI Style | Dark theme, gold accent, SaaS layout |
| Animation | CSS transitions + keyframe animations |
| Build | PyInstaller (standalone), Next.js static export |

---

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/health` | Health check (model, CUDA, eSpeak, output) |
| `GET` | `/v1/status` | Trạng thái model và hệ thống |
| `GET` | `/v1/hardware/detect` | Phát hiện phần cứng + gợi ý engine |
| `GET` | `/v1/models/available` | Danh sách engine (GGUF/PyTorch/Turbo) |
| `POST` | `/v1/models/switch` | Chuyển engine |
| `POST` | `/v1/models/reload` | Tải lại model |
| `GET` | `/v1/models` | Danh sách giọng có sẵn |
| `POST` | `/v1/audio/speech` | Tạo audio (preset voice + streaming) |
| `POST` | `/v1/audio/clone` | Voice clone từ audio mẫu |
| `POST` | `/v1/audio/dialogue` | Tạo dialogue nhiều giọng |
| `GET` | `/v1/audio/history` | Lịch sử audio đã tạo |
| `GET` | `/v1/audio/file/{name}` | Phát/tải file audio |
| `DELETE` | `/v1/audio/file/{name}` | Xóa file audio |
| `GET` | `/v1/lora` | Danh sách LoRA adapter |
| `POST` | `/v1/lora/load` | Tải LoRA adapter |
| `POST` | `/v1/lora/unload` | Gỡ LoRA adapter |
| `POST` | `/v1/download/base` | Tải model base |
| `POST` | `/v1/download/lora` | Tải LoRA adapter |
| `POST` | `/v1/download/omnivoice` | Tải model OmniVoice |
| `GET` | `/v1/download/progress` | Tiến trình tải |
| `POST` | `/v1/omnivoice/load` | Khởi động OmniVoice |
| `POST` | `/v1/omnivoice/unload` | Gỡ OmniVoice |
| `GET` | `/v1/omnivoice/status` | Trạng thái OmniVoice |
| `POST` | `/v1/omnivoice/tts` | Tạo audio với OmniVoice |
| `POST` | `/v1/omnivoice/clone` | Voice clone với OmniVoice |

---

## License

Proprietary — Không phân phối lại. Sử dụng nội bộ.

### Giấy phép của các thư viện bên thứ third

| Thư viện | License |
|----------|---------|
| VieNeu-TTS | Apache 2.0 |
| OmniVoice | Apache 2.0 |
| FastAPI | MIT |
| Next.js | MIT |
| React | MIT |
| Tailwind CSS | MIT |
| eSpeak NG | GPL 3.0 |
| PyInstaller | GPL 2.0 |

---

**Made with ❤️ by Sáu Bảnh - Thành Vinh Studio Team - Phòng Đào Tạo**
