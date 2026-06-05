<div align="center">

<img src="assets/company-favicon.webp" alt="ThanhVinh Studio" width="128" height="128" />

# TVHs TTS — ThanhVinh Studio

**Desktop app tạo giọng nói tiếng Việt chạy local trên máy người dùng**

![License](https://img.shields.io/badge/license-Apache--2.0-blue)
![Windows](https://img.shields.io/badge/windows-installer-0078D4?logo=windows&logoColor=white)
![macOS](https://img.shields.io/badge/macos-app%20%2B%20dmg-000000?logo=apple&logoColor=white)
![Python](https://img.shields.io/badge/python-3.12-blue?logo=python&logoColor=white)
![Next.js](https://img.shields.io/badge/next.js-static%20export-black?logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/fastapi-local%20backend-009688?logo=fastapi&logoColor=white)

<p>
Tạo audio tiếng Việt bằng VieNeu-TTS-v2. Ứng dụng mở như app desktop, tự chạy backend local trên máy người dùng, không cần server bên ngoài sau khi đã tải model lần đầu.
</p>

</div>

---

## Mục Tiêu

TVHs TTS được đóng gói như một ứng dụng desktop cho người không cần biết code:

- Cài bằng file setup trên Windows.
- Chạy local trên máy người dùng.
- Không gửi source code trong bộ cài.
- Không nhét model lớn vào installer.
- Có script tải model lần đầu đi kèm.
- Người dùng chọn được thư mục lưu audio output.
- Có cấu hình build Windows và macOS bằng GitHub Actions.

---

## Tính Năng

| Tính năng | Mô tả |
|---|---|
| Preset voice | Chọn giọng có sẵn từ model VieNeu-TTS-v2 |
| Voice clone | Tạo giọng từ audio mẫu và transcript |
| Dialogue | Kịch bản nhiều dòng, nhiều voice |
| Local backend | FastAPI chạy trên `127.0.0.1`, không public ra internet |
| Desktop shell | App mở bằng cửa sổ desktop qua PyWebView |
| Output folder | Người dùng chọn thư mục lưu file WAV |
| History | Xem, phát lại, xóa audio đã tạo |
| First-run model download | `Download Models.bat` / `.command` tải model lần đầu |
| Windows installer | Đóng gói bằng PyInstaller + Inno Setup |
| macOS package | Build `.app`, `.zip`, unsigned `.dmg` trên macOS runner |

Streaming đã được bỏ để flow ổn định hơn: backend tạo WAV hoàn chỉnh rồi trả về player.

---

## Cấu Trúc Bản Cài

Trên Windows, app được cài vào:

```text
%LOCALAPPDATA%\ThanhVinhStudio
```

Bên trong gồm:

```text
ThanhVinhStudio/
  ThanhVinhStudio.exe
  _internal/
  Download Models.bat
  models/
  outputs/
  logs/
  settings.json
```

Model không nằm trong installer. Người dùng chạy `Download Models.bat` lần đầu để tải:

```text
models/base/VieNeu-TTS-v2-gguf/
  VieNeu-TTS-v2-Q4-K-M.gguf
  voices.json
```

---

## Dành Cho Người Dùng

### Windows

1. Tải `ThanhVinhStudio-Setup.exe` từ artifact hoặc release.
2. Cài app.
3. Mở Start Menu > `ThanhVinhStudio` hoặc shortcut desktop.
4. Nếu chưa có model, chạy `Download Models`.
5. Vào app > bấm `Lưu output` để chọn thư mục lưu audio.
6. Nhập văn bản và bấm `Tạo giọng`.

### macOS

macOS build hiện là unsigned vì chưa dùng Apple Developer Program.

1. Tải `ThanhVinhStudio-macOS-unsigned.dmg` hoặc `.zip`.
2. Mở DMG, kéo app vào Applications nếu muốn.
3. Chạy `Open First Time.command` nếu Gatekeeper chặn.
4. Chạy `Download Models.command` để tải model lần đầu.
5. Mở `ThanhVinhStudio.app`.

Nếu không notarize, macOS vẫn có thể cảnh báo Gatekeeper. Đây là giới hạn của app unsigned.

---

## Build Local Trên Windows

Yêu cầu:

- Windows 10/11
- Python 3.12
- Node.js 22 hoặc mới hơn
- uv
- Inno Setup 6

Chạy:

```powershell
uv run --python 3.12 python build.py
```

Kết quả:

```text
dist/ThanhVinhStudio-Setup.exe
```

---

## Build macOS

Không thể build macOS `.app` / `.dmg` chuẩn từ Windows. Cần build trên macOS hoặc GitHub Actions macOS runner.

Trên máy Mac:

```bash
uv run --python 3.12 python build.py
```

Kết quả:

```text
dist/ThanhVinhStudio.app
dist/ThanhVinhStudio-macOS.zip
```

Workflow GitHub Actions còn tạo thêm:

```text
dist/ThanhVinhStudio-macOS-unsigned.dmg
```

---

## GitHub Actions

Workflow:

```text
.github/workflows/build-desktop.yml
```

Chạy thủ công:

```text
GitHub > Actions > Build Desktop Apps > Run workflow
```

Artifacts:

- `ThanhVinhStudio-Windows-Setup`
- `ThanhVinhStudio-macOS-Zip`
- `ThanhVinhStudio-macOS-Unsigned-DMG`

---

## Ghi Chú Kỹ Thuật

- Frontend: Next.js static export.
- Backend: FastAPI chạy local.
- Desktop shell: PyWebView.
- Packaging: PyInstaller.
- Windows installer: Inno Setup.
- macOS DMG: `hdiutil`.
- Model path sau khi cài: cùng folder app trong `models/`.
- Output path: mặc định `outputs/`, có thể đổi trong app bằng nút `Lưu output`.

---

## License

Apache-2.0
