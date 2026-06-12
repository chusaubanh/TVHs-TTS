========================================================================
                      HƯỚNG DẪN CÀI ĐẶT & SỬ DỤNG
                    TVHs TTS - ThanhVinh Studio (Desktop)
========================================================================

TVHs TTS là ứng dụng Desktop giúp chuyển đổi văn bản thành giọng nói tiếng Việt
chạy hoàn toàn local (ngoại tuyến) trên máy tính của bạn sau khi cài đặt.

------------------------------------------------------------------------
1. HƯỚNG DẪN CÀI ĐẶT (WINDOWS)
------------------------------------------------------------------------
Bước 1: Tải file cài đặt "ThanhVinhStudio-Setup.exe" từ thư mục Google Drive.
Bước 2: Click đúp vào file "ThanhVinhStudio-Setup.exe" để chạy bộ cài đặt.
Bước 3: Thực hiện cài đặt theo các bước hướng dẫn trên màn hình. Mặc định ứng
        dụng sẽ được cài đặt vào thư mục người dùng:
        %LOCALAPPDATA%\ThanhVinhStudio

------------------------------------------------------------------------
2. TẢI MODEL LẦN ĐẦU (BẮT BUỘC)
------------------------------------------------------------------------
Để tiết kiệm dung lượng bộ cài, file trí tuệ nhân tạo (Model) không đi kèm
sẵn trong bộ cài. Bạn cần tải về trong lần đầu tiên sử dụng:

Bước 1: Sau khi cài đặt xong, truy cập vào thư mục cài đặt của ứng dụng:
        - Nhấn tổ hợp phím Windows + R, gõ: %LOCALAPPDATA%\ThanhVinhStudio
        - Hoặc tìm đến thư mục cài đặt của phần mềm.
Bước 2: Click đúp vào file "Download Models.bat".
Bước 3: Cửa sổ dòng lệnh sẽ tự động tải file Model giọng nói (khoảng 300MB)
        và thiết lập cấu hình. Hãy đợi cho đến khi cửa sổ tự động đóng.

------------------------------------------------------------------------
3. HƯỚNG DẪN SỬ DỤNG
------------------------------------------------------------------------
Bước 1: Mở ứng dụng "ThanhVinhStudio" từ màn hình Desktop hoặc Start Menu.
Bước 2: Trên giao diện phần mềm, bấm nút "Lưu output" ở góc dưới bên trái 
        để chọn thư mục chứa các file âm thanh (.wav) sau khi tạo.
Bước 3: Chọn chế độ đọc (Giọng có sẵn, Clone giọng nói, hoặc Kịch bản).
Bước 4: Nhập nội dung văn bản tiếng Việt cần đọc vào ô văn bản lớn.
Bước 5: Nhấn nút "Tạo giọng" (màu xanh lá cây) và đợi phần mềm xử lý.
Bước 6: Nhấn nút Play để nghe trực tiếp hoặc truy cập thư mục output đã chọn
        ở Bước 2 để lấy file âm thanh hoàn chỉnh.

------------------------------------------------------------------------
* LƯU Ý KHI GẶP LỖI:
- Nếu ứng dụng không tạo được tiếng, hãy chắc chắn bạn đã chạy file 
  "Download Models.bat" thành công và thư mục "models" trong thư mục cài đặt
  có chứa file "VieNeu-TTS-v2-Q4-K-M.gguf" (~300MB).
- Bạn có thể xem lịch sử âm thanh đã tạo ở tab "Lịch sử" phía trên cùng.
========================================================================
