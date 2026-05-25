<div align="center">

# Thành Vinh Studio

**Ứng dụng tổng hợp giọng nói tiếng Việt chạy hoàn toàn trên máy tính**

![License](https://img.shields.io/badge/license-Private-red)
![Python](https://img.shields.io/badge/python-3.10+-blue?logo=python&logoColor=white)
![Next.js](https://img.shields.io/badge/next.js-15-black?logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/fastapi-0.110+-009688?logo=fastapi&logoColor=white)
![Status](https://img.shields.io/badge/status-stable-brightgreen)

<p>Tổng hợp giọng nói tiếng Việt chất lượng cao với voice cloning, dialogue nhiều giọng, và quản lý LoRA — chạy offline, không cần internet.</p>

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
| **Local-First** | Chạy hoàn toàn offline, dữ liệu không rời khỏi máy |

---

## Yêu cầu hệ thống

| Thành phần | Tối thiểu | Khuyến nghị |
|------------|-----------|-------------|
| OS | Windows 10 / Ubuntu 20.04 | Windows 11 / Ubuntu 22.04+ |
| CPU | Intel i5 / Ryzen 5 | Intel i7 / Ryzen 7+ |
| RAM | 8 GB | 16 GB+ |
| GPU | Không bắt buộc | NVIDIA GPU, VRAM 4 GB+ |
| Python | 3.10+ | 3.12 |
| Node.js | 18+ | 20+ |

---

## Cài đặt nhanh

### 1. Clone repository

```bash
git clone [<repo-url>](https://github.com/chusaubanh/ThanhVinhStudio)
cd ThanhVinhStudio
```

### 2. Backend (FastAPI)

```bash
# Dùng uv (khuyến nghị)
uv sync
uv run python app.py

# Hoặc pip
pip install -r requirements-build.txt
python app.py
```

Backend chạy tại `http://localhost:8000`.

### 3. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại `http://localhost:3000`.

### 4. Build production

```bash
cd frontend
npm run build
```

Frontend sẽ được export tĩnh vào `frontend/out/`, sau đó backend FastAPI sẽ serve trực tiếp.

---

## Cấu trúc dự án

```
ThanhVinhStudio/
├── app.py                    # FastAPI backend (API + serve static)
├── backend/                  # Business logic, model loading, TTS engine
├── frontend/
│   ├── app/
│   │   ├── page.tsx          # Landing page
│   │   ├── studio/page.tsx   # SaaS layout chính (Dashboard, Studio, Voices, History, Settings)
│   │   ├── features/page.tsx # Trang Tính năng
│   │   ├── guide/page.tsx    # Trang Hướng dẫn
│   │   └── components/
│   │       ├── saas-shell.tsx    # Layout chung (nav sidebar + topbar)
│   │       ├── sidebar.tsx       # Studio sidebar (LoRA, voice, emotion, controls)
│   │       ├── player.tsx        # Audio player với waveform animation
│   │       ├── dashboard.tsx     # Dashboard với stats từ backend
│   │       ├── voice-library.tsx # Quản lý giọng
│   │       ├── history.tsx       # Lịch sử audio
│   │       ├── settings.tsx      # Cài đặt (model, hardware, export)
│   │       ├── features-content.tsx
│   │       ├── guide-content.tsx
│   │       └── setup-screen.tsx  # Màn hình setup model lần đầu
│   └── public/
├── models/                   # Model weights (tự động tải)
├── outputs/                  # Audio output
├── preview.html              # HTML preview của giao diện SaaS
├── build.py                  # Script build standalone
└── install.bat               # Script cài đặt Windows
```

---

## Kiến trúc

```
┌─────────────────────────────────────────────────┐
│                   Frontend (Next.js)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Landing  │  │  Studio  │  │ Features /   │  │
│  │  Page    │  │  (SaaS)  │  │ Guide / etc  │  │
│  └──────────┘  └────┬─────┘  └──────────────┘  │
│                     │ fetch                      │
├─────────────────────┼───────────────────────────┤
│              Backend (FastAPI)                   │
│  ┌──────────────────┴────────────────────────┐  │
│  │  /v1/status    — Model status             │  │
│  │  /v1/tts       — Generate speech          │  │
│  │  /v1/clone     — Voice clone              │  │
│  │  /v1/dialogue  — Multi-voice dialogue     │  │
│  │  /v1/voices    — List preset voices       │  │
│  │  /v1/audio/*   — History & file management│  │
│  │  /v1/hardware  — Hardware detection       │  │
│  └───────────────────────────────────────────┘  │
│                     │                            │
│  ┌──────────────────┴────────────────────────┐  │
│  │         VieNeu-TTS Engine                 │  │
│  │  GGUF (CPU) │ PyTorch (GPU) │ Turbo      │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## Công nghệ

| Layer | Công nghệ |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS v4, TypeScript |
| Backend | FastAPI, Python 3.12, uvicorn |
| TTS Engine | VieNeu-TTS (GGUF / PyTorch / Turbo) |
| UI Style | Dark theme, gold accent, SaaS layout |
| Animation | CSS transitions + keyframe animations |
| Build | PyInstaller (standalone), Next.js static export |

---

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/v1/status` | Trạng thái model và hệ thống |
| `POST` | `/v1/tts` | Tạo audio từ text (preset voice) |
| `POST` | `/v1/clone` | Voice clone từ audio mẫu |
| `POST` | `/v1/dialogue` | Tạo dialogue nhiều giọng |
| `GET` | `/v1/voices` | Danh sách giọng có sẵn |
| `GET` | `/v1/audio/history` | Lịch sử audio đã tạo |
| `GET` | `/v1/audio/file/{name}` | Phát/tải file audio |
| `DELETE` | `/v1/audio/file/{name}` | Xóa file audio |
| `GET` | `/v1/hardware` | Phát hiện phần cứng |
| `POST` | `/v1/model/reload` | Tải lại model |

---

## License

Private — Không phân phối lại.

---

**Made with ❤️ by Anh Phương - Thành Vinh Studio Team - Phòng Đào Tạo**
