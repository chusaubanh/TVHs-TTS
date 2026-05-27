# AI Agent Setup Prompt

Dùng prompt này khi nhờ Codex, Claude Code, Antigravity hoặc AI coding agent khác setup project trên máy local.

```text
Bạn đang giúp tôi setup và chạy project này trên máy local.

Mục tiêu:
- Đọc cấu trúc repo trước.
- Kiểm tra các phần mềm hệ thống cần có trước khi cài dependency của project.
- Xác định backend, frontend, package manager, runtime version và entry point.
- Chỉ cài dependency cần thiết để chạy source code.
- Chỉ tạo lại các folder/file bị ignore hoặc generated khi thật sự cần.
- Không khôi phục private assets, voice samples, audio/video generated, local databases, node_modules, virtual environments, planning files hoặc manuscript files.
- Ưu tiên các bước setup an toàn trên local và giải thích command trước khi chạy.

Ngữ cảnh repo:
- Đây là bản source-only public snapshot của ThanhVinhStudio.
- Một số asset, model weights và file generated đã được cố tình loại khỏi Git bằng .gitignore.
- Project không đảm bảo clone về là chạy ngay nếu máy thiếu runtime, dependency hệ thống hoặc model.
- Nếu thiếu media/output files thì xem đó là bình thường.
- Không commit secret. Nếu cần secret/API key, dùng environment variable placeholder trong .env.local hoặc .env.example.
- Frontend là Next.js/React, nằm trong thư mục frontend, cần Node.js 20+.
- Backend là FastAPI/Python, entry point chính là python -m backend.main, dùng uv để quản lý môi trường.
- Backend có thể cần Python 3.10+, uv, eSpeak NG, FFmpeg, Torch, Transformers/Hugging Face tooling, pydub/soundfile và OmniVoice tùy chức năng.
- Không download model/media file lớn nếu tôi chưa đồng ý.
- Không add generated outputs, model weights, node_modules, .venv, .next hoặc frontend/out vào Git.

Script có sẵn:
- Windows:
  - install.bat: cài dependency và verify môi trường.
  - start.bat: tự dọn port/Next lock và chạy app.
  - repair.bat: sửa lỗi vặt như port kẹt, Next lock, sea-g2p, node_modules hỏng.
  - download.bat: tải model khi tôi đồng ý.
- macOS:
  - install.command, start.command, repair.command: double-click được.
  - install.sh, start.sh, repair.sh: chạy từ Terminal.
- Linux:
  - install.sh, start.sh, repair.sh.

Workflow đề xuất:
1. Liệt kê cấu trúc project phát hiện được.
2. Đọc README.md, pyproject.toml, uv.lock, frontend/package.json, các script install/start/repair.
3. Kiểm tra version của git, node, npm, python, uv, ffmpeg, espeak-ng.
4. Trên Windows, ưu tiên thử install.bat rồi start.bat. Nếu lỗi vặt, chạy repair.bat rồi start.bat.
5. Trên macOS, ưu tiên install.command/start.command nếu người dùng muốn double-click; hoặc chmod +x install.sh start.sh repair.sh rồi chạy ./install.sh và ./start.sh.
6. Trên Linux, chạy chmod +x install.sh start.sh repair.sh, sau đó ./install.sh và ./start.sh.
7. Nếu setup thủ công:
   - Backend: uv sync --frozen, uv pip install --force-reinstall sea-g2p==0.7.5, uv run --frozen python -m backend.main.
   - Frontend: cd frontend, npm ci --no-audit --no-fund, npm run dev -- -p 3000 -H 127.0.0.1.
8. Nếu startup fail vì thiếu model/audio/output bị ignore, không tự khôi phục private assets. Hãy giải thích file nào thiếu và hỏi tôi trước khi tải model lớn.
9. Nếu cần tạo .env, chỉ tạo placeholder, không ghi secret thật.
10. Sau khi chạy được, tóm tắt lại command setup cuối cùng và cách chạy app lần sau.

Ràng buộc:
- Không commit secret.
- Không download model/media file lớn nếu tôi chưa đồng ý.
- Không add generated outputs vào Git.
- Không khôi phục private assets, voice samples, local databases, node_modules, virtual environments, planning files hoặc manuscript files.
- Giữ thay đổi nhỏ, tập trung vào setup local.

Hãy bắt đầu bằng cách liệt kê cấu trúc project phát hiện được, sau đó đề xuất chính xác các command setup cho máy của tôi.
```

