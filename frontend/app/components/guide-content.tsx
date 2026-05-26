"use client";

import { Layers, Mic, Upload, MessageSquare, Sliders, History, AlertTriangle, CheckCircle2, Radio, Play, Download, Settings, Cpu, Volume2, FileAudio, Keyboard, Clock } from "lucide-react";
import { useState } from "react";

const SECTIONS = [
  { id: "install", label: "Cài đặt", icon: <Download className="h-4 w-4" /> },
  { id: "intro", label: "Tổng quan", icon: <Layers className="h-4 w-4" /> },
  { id: "preset", label: "Preset Voices", icon: <Mic className="h-4 w-4" /> },
  { id: "clone", label: "Voice Clone", icon: <Upload className="h-4 w-4" /> },
  { id: "dialogue", label: "Dialogue", icon: <MessageSquare className="h-4 w-4" /> },
  { id: "controls", label: "Điều khiển", icon: <Sliders className="h-4 w-4" /> },
  { id: "history", label: "Lịch sử", icon: <History className="h-4 w-4" /> },
  { id: "model", label: "Model & LoRA", icon: <Cpu className="h-4 w-4" /> },
  { id: "shortcuts", label: "Phím tắt", icon: <Keyboard className="h-4 w-4" /> },
  { id: "tips", label: "Mẹo & Xử lý lỗi", icon: <AlertTriangle className="h-4 w-4" /> },
];

export function GuideContent() {
  const [activeSection, setActiveSection] = useState("intro");

  return (
    <div className="saas-page">
      <h1 className="mb-2 font-outfit text-2xl font-bold text-tvhs-text">Hướng dẫn sử dụng</h1>
      <p className="mb-8 text-base text-tvhs-text-secondary">Hướng dẫn chi tiết từ cơ bản đến nâng cao. Chọn mục bên trái để bắt đầu.</p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_1fr]">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block">
          <nav className="sticky top-0 flex flex-col gap-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${activeSection === s.id ? "bg-tvhs-accent-faint text-tvhs-accent" : "text-tvhs-text-secondary hover:bg-tvhs-elevated hover:text-tvhs-text"}`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="space-y-8">
          {activeSection === "install" && <InstallSection />}
          {activeSection === "intro" && <IntroSection />}
          {activeSection === "preset" && <PresetSection />}
          {activeSection === "clone" && <CloneSection />}
          {activeSection === "dialogue" && <DialogueSection />}
          {activeSection === "controls" && <ControlsSection />}
          {activeSection === "history" && <HistorySection />}
          {activeSection === "model" && <ModelSection />}
          {activeSection === "shortcuts" && <ShortcutsSection />}
          {activeSection === "tips" && <TipsSection />}
        </div>
      </div>
    </div>
  );
}

/* ═══ Sections ═══ */

function InstallSection() {
  return (
    <Section title="Hướng dẫn cài đặt">
      <p>Thành Vinh Studio hỗ trợ Windows, macOS và Linux. Xem hướng dẫn chi tiết cho hệ điều hành của bạn:</p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <a href="/guide/install-guide.html" className="group rounded-xl border border-tvhs-border bg-tvhs-main p-5 transition hover:border-tvhs-accent hover:bg-tvhs-elevated">
          <div className="text-2xl mb-2">🪟</div>
          <div className="text-base font-bold text-tvhs-text group-hover:text-tvhs-accent">Windows</div>
          <div className="mt-1 text-sm text-tvhs-text-secondary">install.bat tự động cài đặt</div>
        </a>
        <a href="/guide/install-guide.html#macos" className="group rounded-xl border border-tvhs-border bg-tvhs-main p-5 transition hover:border-tvhs-accent hover:bg-tvhs-elevated">
          <div className="text-2xl mb-2">🍎</div>
          <div className="text-base font-bold text-tvhs-text group-hover:text-tvhs-accent">macOS</div>
          <div className="mt-1 text-sm text-tvhs-text-secondary">install.sh + Homebrew</div>
        </a>
        <a href="/guide/install-guide.html#linux" className="group rounded-xl border border-tvhs-border bg-tvhs-main p-5 transition hover:border-tvhs-accent hover:bg-tvhs-elevated">
          <div className="text-2xl mb-2">🐧</div>
          <div className="text-base font-bold text-tvhs-text group-hover:text-tvhs-accent">Linux</div>
          <div className="mt-1 text-sm text-tvhs-text-secondary">install.sh (apt/dnf)</div>
        </a>
      </div>

      <Callout type="info">
        Xem hướng dẫn cài đặt chi tiết (bao gồm prerequisites, GPU setup, build standalone, troubleshooting) tại file <a href="/guide/install-guide.html" className="underline text-tvhs-accent">install-guide.html</a>.
      </Callout>

      <SubTitle>Cài đặt nhanh</SubTitle>
      <div className="space-y-3">
        <StepItem num={1} title="Clone repo" desc='git clone https://github.com/chusaubanh/ThanhVinhStudio && cd ThanhVinhStudio' />
        <StepItem num={2} title="Cài đặt" desc="Windows: install.bat | macOS/Linux: ./install.sh" />
        <StepItem num={3} title="Khởi động" desc="Windows: start.bat | macOS/Linux: ./start.sh" />
      </div>

      <SubTitle>Yêu cầu hệ thống</SubTitle>
      <div className="space-y-2">
        <ParamRow name="CPU" desc="Intel i5 / Ryzen 5 / Apple M1 trở lên" />
        <ParamRow name="RAM" desc="8 GB tối thiểu, 16 GB khuyến nghị" />
        <ParamRow name="GPU" desc="Không bắt buộc. NVIDIA 4GB+ VRAM hoặc Apple Silicon cho GPU mode" />
        <ParamRow name="Python" desc="3.10+ (khuyến nghị 3.12)" />
        <ParamRow name="Node.js" desc="18+ (khuyến nghị 20 LTS)" />
      </div>
    </Section>
  );
}

function IntroSection() {
  return (
    <Section title="Tổng quan về Thành Vinh Studio">
      <p>Thành Vinh Studio là ứng dụng tổng hợp giọng nói tiếng Việt (Text-to-Speech) chạy hoàn toàn trên máy tính của bạn. Dữ liệu không được gửi đi đâu ngoài máy của bạn.</p>

      <SubTitle>Giao diện gồm những gì?</SubTitle>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UICard title="Nav Sidebar (bên trái)" desc="Thanh điều hướng nhỏ 64px, chứa các nút chuyển trang: Dashboard, Studio, Voices, History, Settings." />
        <UICard title="Studio Sidebar" desc="Panel bên trong trang Studio, chứa LoRA, model controls, voice selector, emotion, silence và streaming." />
        <UICard title="Vùng nhập text" desc="Ở giữa màn hình, là nơi bạn nhập văn bản cần đọc. Hỗ trợ chèn khoảng lặng giữa các câu." />
        <UICard title="Player" desc="Phía dưới cùng, dùng để nghe lại audio đã tạo, tua, tải về và tạo audio mới." />
      </div>

      <SubTitle>Ba chế độ chính</SubTitle>
      <div className="space-y-3">
        <StepItem num={1} title="Preset" desc="Chọn giọng có sẵn từ model, nhập text, bấm tạo. Nhanh và đơn giản nhất." />
        <StepItem num={2} title="Clone" desc="Upload file audio mẫu, nhập transcript, hệ thống tạo giọng giống mẫu." />
        <StepItem num={3} title="Dialogue" desc="Tạo kịch bản hội thoại nhiều giọng, mỗi dòng một voice riêng." />
      </div>
    </Section>
  );
}

function PresetSection() {
  return (
    <Section title="Preset Voices — Tạo audio từ giọng có sẵn">
      <p>Đây là chế độ cơ bản và nhanh nhất. Bạn chọn một giọng từ thư viện, nhập văn bản, và hệ thống sẽ đọc cho bạn nghe.</p>

      <SubTitle>Các bước thực hiện</SubTitle>
      <div className="space-y-3">
        <StepItem num={1} title="Chọn voice" desc="Ở sidebar bên trái, mục 'Voice Selector', bấm vào dropdown để chọn giọng. Mỗi giọng có đặc điểm khác nhau (giọng nam, nữ, trẻ, già...)." />
        <StepItem num={2} title="Điều chỉnh cảm xúc" desc="Mục 'Emotion' trong sidebar. Chọn: Natural (tự nhiên), Happy (vui), Sad (buồn), Angry (tức giận). Không phải voice nào cũng hỗ trợ tất cả cảm xúc." />
        <StepItem num={3} title="Điều chỉnh khoảng lặng" desc="Mục 'Silence' — kéo thanh trượt để chỉnh thời gian dừng giữa các câu. Giá trị 0.1–0.3 giây là phổ biến." />
        <StepItem num={4} title="Nhập văn bản" desc="Ở vùng trung tâm, gõ hoặc dán văn bản cần đọc. Có thể dùng nút '250ms', '500ms', '1s', '2s' để chèn khoảng dừng cụ thể." />
        <StepItem num={5} title="Tạo audio" desc="Bấm nút 'Tạo giọng' ở thanh Player phía dưới. Chờ vài giây, audio sẽ tự động phát khi xong." />
      </div>

      <Callout type="info">
        Mẹo: Nếu muốn nghe thử nhanh, chỉ cần nhập 1–2 câu ngắn. Khi đã ưng ý giọng, hãy nhập toàn bộ nội dung.
      </Callout>

      <SubTitle>Chèn khoảng lặng giữa câu</SubTitle>
      <p>Bên trên vùng nhập text, có các nút chèn khoảng dừng: <code className="rounded bg-tvhs-elevated px-2 py-0.5 text-sm text-tvhs-accent">250ms</code> <code className="rounded bg-tvhs-elevated px-2 py-0.5 text-sm text-tvhs-accent">500ms</code> <code className="rounded bg-tvhs-elevated px-2 py-0.5 text-sm text-tvhs-accent">1s</code> <code className="rounded bg-tvhs-elevated px-2 py-0.5 text-sm text-tvhs-accent">2s</code>. Bấm vào để chèn marker vào vị trí con trỏ đang đứng.</p>
    </Section>
  );
}

function CloneSection() {
  return (
    <Section title="Voice Clone — Tạo giọng từ mẫu audio">
      <p>Voice Clone cho phép bạn tạo giọng nói mới dựa trên một file audio mẫu. Hệ thống sẽ học giọng từ mẫu và đọc bất kỳ văn bản nào bạn nhập.</p>

      <SubTitle>Yêu cầu file mẫu</SubTitle>
      <div className="space-y-2">
        <Requirement icon="✅" text="Thời lượng: 3–10 giây" />
        <Requirement icon="✅" text="Định dạng: WAV, MP3, FLAC, OGG" />
        <Requirement icon="✅" text="Chất lượng: rõ ràng, ít tạp âm, không có nhạc nền" />
        <Requirement icon="✅" text="Nội dung: nói rõ ràng, không ngắt quãng quá dài" />
        <Requirement icon="❌" text="Tránh: file quá ngắn (dưới 2s), quá ồn, nhiều người nói cùng lúc" />
      </div>

      <SubTitle>Các bước thực hiện</SubTitle>
      <div className="space-y-3">
        <StepItem num={1} title="Chuyển sang tab Clone" desc="Bấm nút 'Clone' ở thanh chế độ phía trên vùng nhập text." />
        <StepItem num={2} title="Upload file mẫu" desc="Ở sidebar, mục 'Reference Audio', bấm 'Chọn file' để upload file audio mẫu từ máy tính." />
        <StepItem num={3} title="Nhập transcript" desc="Ở mục 'Reference Text', gõ chính xác những gì được nói trong file mẫu. Đây là bước quan trọng nhất — transcript sai sẽ khiến kết quả bị lệch." />
        <StepItem num={4} title="Nhập văn bản cần đọc" desc="Ở vùng trung tâm, gõ văn bản mà bạn muốn giọng clone đọc." />
        <StepItem num={5} title="Tạo audio" desc="Bấm 'Tạo giọng'. Quá trình clone có thể mất lâu hơn preset một chút." />
      </div>

      <Callout type="warning">
        Nếu transcript không khớp với nội dung file mẫu, giọng clone sẽ nghe rất khác hoặc bị lỗi. Hãy nghe lại file mẫu và gõ đúng từng chữ.
      </Callout>

      <SubTitle>Ví dụ thực tế</SubTitle>
      <div className="rounded-xl bg-tvhs-main p-5 text-base">
        <p className="mb-2 text-tvhs-text-muted">File mẫu nói: "Xin chào, tôi là trợ lý ảo của bạn."</p>
        <p className="text-tvhs-text">→ Transcript cần nhập: <code className="rounded bg-tvhs-elevated px-2 py-0.5 text-tvhs-accent">Xin chào, tôi là trợ lý ảo của bạn.</code></p>
        <p className="mt-3 text-tvhs-text-muted">Sau đó nhập văn bản mới ở vùng text chính, ví dụ: "Hôm nay thời tiết rất đẹp, chúng ta cùng đi dạo nhé."</p>
      </div>
    </Section>
  );
}

function DialogueSection() {
  return (
    <Section title="Dialogue — Kịch bản hội thoại nhiều giọng">
      <p>Chế độ Dialogue cho phép bạn tạo một kịch bản hội thoại với nhiều nhân vật, mỗi nhân vật có giọng nói và cảm xúc riêng.</p>

      <SubTitle>Khi nào nên dùng Dialogue?</SubTitle>
      <div className="space-y-2">
        <UseCase icon="🎙️" text="Tạo podcast có 2–3 người host" />
        <UseCase icon="📚" text="Bài học có giáo viên và học sinh" />
        <UseCase icon="🎭" text="Kịch bản roleplay, training case" />
        <UseCase icon="📞" text="Mô phỏng cuộc gọi điện thoại" />
      </div>

      <SubTitle>Các bước thực hiện</SubTitle>
      <div className="space-y-3">
        <StepItem num={1} title="Chuyển sang tab Dialogue" desc="Bấm nút 'Đối thoại' ở thanh chế độ." />
        <StepItem num={2} title="Thêm dòng hội thoại" desc="Bấm nút '+ Thêm dòng' ở sidebar để thêm nhân vật. Mỗi dòng là một câu nói của một nhân vật." />
        <StepItem num={3} title="Chọn voice cho từng dòng" desc="Ở mỗi dòng, chọn voice (Vinh, Binh, v.v.) từ dropdown. Mỗi nhân vật nên có giọng khác nhau." />
        <StepItem num={4} title="Nhập nội dung" desc="Gõ nội dung từng câu nói vào ô text tương ứng." />
        <StepItem num={5} title="Điều chỉnh khoảng lặng" desc="Ở mỗi dòng, kéo 'Pause' để chỉnh thời gian dừng sau câu đó. Giá trị 0.3–0.8 giây là tự nhiên nhất." />
        <StepItem num={6} title="Tạo audio" desc="Bấm 'Tạo giọng'. Hệ thống sẽ nối tất cả dòng lại thành một file audio hoàn chỉnh." />
      </div>

      <Callout type="info">
        Mẹo: Sắp xếp thứ tự dòng theo đúng luồng hội thoại. Nếu cần sửa, bấm nút xóa (🗑️) ở cuối mỗi dòng rồi thêm lại.
      </Callout>
    </Section>
  );
}

function ControlsSection() {
  return (
    <Section title="Điều khiển nâng cao">
      <p>Các tham số trong sidebar cho phép bạn tinh chỉnh chi tiết cách audio được tạo ra.</p>

      <SubTitle>Emotion — Cảm xúc</SubTitle>
      <div className="mb-6 space-y-2">
        <ParamRow name="Natural" desc="Giọng đọc bình thường, tự nhiên nhất. Phù hợp cho hầu hết trường hợp." />
        <ParamRow name="Happy" desc="Giọng vui vẻ, phấn khích. Phù hợp cho quảng cáo, giới thiệu sản phẩm." />
        <ParamRow name="Sad" desc="Giọng buồn, trầm lắng. Phù hợp cho truyện kể, nội dung cảm xúc." />
        <ParamRow name="Angry" desc="Giọng tức giận, mạnh mẽ. Phù hợp cho kịch, cảnh đối đầu." />
      </div>

      <SubTitle>Silence — Khoảng lặng</SubTitle>
      <p className="mb-3">Thanh trượt từ 0 đến 1, điều chỉnh thời gian dừng giữa các câu. Giá trị 0.15 là mặc định.</p>
      <div className="mb-6 space-y-2">
        <ParamRow name="0.05–0.10" desc="Nói liên tục, ít dừng. Phù hợp đọc nhanh, giới thiệu." />
        <ParamRow name="0.15–0.25" desc="Tốc độ bình thường, dễ nghe." />
        <ParamRow name="0.30–0.50" desc="Chậm, có khoảng nghỉ rõ rệt. Phù hợp đọc sách, thiền." />
      </div>

      <SubTitle>Streaming Mode</SubTitle>
      <p className="mb-4">Bật streaming để nghe audio ngay trong khi đang sinh, thay vì phải chờ toàn bộ quá trình hoàn tất. Hữu ích khi văn bản dài.</p>

      <SubTitle>Insert Pause — Chèn khoảng dừng cụ thể</SubTitle>
      <p className="mb-3">Bên trên vùng nhập text, bấm vào các nút để chèn marker dừng tại vị trí con trỏ:</p>
      <div className="space-y-2">
        <ParamRow name="250ms" desc="Dừng rất ngắn, như lấy hơi." />
        <ParamRow name="500ms" desc="Dừng vừa phải, như dấu phẩy." />
        <ParamRow name="1s" desc="Dừng rõ, như dấu chấm." />
        <ParamRow name="2s" desc="Dừng dài, như giữa hai đoạn." />
      </div>
    </Section>
  );
}

function HistorySection() {
  return (
    <Section title="Lịch sử audio">
      <p>Mọi file audio bạn tạo đều được lưu tự động vào lịch sử. Bạn có thể nghe lại, tải về hoặc xóa bất kỳ lúc nào.</p>

      <SubTitle>Xem lịch sử</SubTitle>
      <p className="mb-4">Bấm biểu tượng <Clock className="inline h-4 w-4 text-tvhs-accent" /> (History) ở nav sidebar để xem danh sách tất cả file đã tạo.</p>

      <SubTitle>Các thao tác</SubTitle>
      <div className="space-y-3 mb-6">
        <StepItem num={1} title="Nghe lại" desc="Bấm nút Play (▶) ở bên phải mỗi dòng để phát audio." />
        <StepItem num={2} title="Tải về" desc="Bấm nút Download (↓) để lưu file WAV về máy." />
        <StepItem num={3} title="Xóa" desc="Bấm nút Xóa (🗑️) để xóa file vĩnh viễn. Thao tác này không thể hoàn tác." />
      </div>

      <Callout type="info">
        File trong lịch sử cũng có thể được dùng làm mẫu cho voice clone. Khi cần tạo giọng tương tự, hãy tìm file cũ trong history và dùng lại.
      </Callout>

      <SubTitle>Phân loại file</SubTitle>
      <div className="space-y-2">
        <ParamRow name="Preset" desc="File được tạo từ chế độ Preset (giọng có sẵn)." />
        <ParamRow name="Clone" desc="File được tạo từ chế độ Voice Clone." />
        <ParamRow name="Dialogue" desc="File được tạo từ chế độ Dialogue." />
      </div>
    </Section>
  );
}

function ModelSection() {
  return (
    <Section title="Model & LoRA Adapter">
      <p>Thành Vinh Studio hỗ trợ nhiều engine và LoRA adapter để bạn tùy chỉnh chất lượng và tốc độ.</p>

      <SubTitle>Ba engine</SubTitle>
      <div className="mb-6 space-y-3">
        <ModelCard name="GGUF" desc="Nhẹ nhất, chạy tốt trên máy yếu. Chất lượng trung bình, tốc độ nhanh. Phù hợp khi CPU không mạnh." recommended="Máy yếu, CPU" />
        <ModelCard name="PyTorch" desc="Chất lượng cao nhất, cần GPU với VRAM đủ lớn. Phù hợp khi bạn có card đồ họa rời." recommended="Máy có GPU, VRAM 4GB+" />
        <ModelCard name="Turbo" desc="Cân bằng giữa tốc độ và chất lượng. Chạy nhanh hơn PyTorch, chất lượng vẫn tốt." recommended="Cần tốc độ, chất lượng tốt" />
      </div>

      <SubTitle>LoRA Adapter</SubTitle>
      <p className="mb-4">LoRA (Low-Rank Adaptation) là các "plugin" nhỏ giúp tinh chỉnh giọng nói. Bạn có thể tải và bật/tắt LoRA để thay đổi đặc điểm giọng.</p>
      <div className="space-y-3 mb-6">
        <StepItem num={1} title="Tải LoRA" desc="Trong sidebar, mục 'LoRA Adapters', bấm nút Tải (↓) bên cạnh LoRA bạn muốn sử dụng." />
        <StepItem num={2} title="Bật LoRA" desc="Sau khi tải, bấm nút Bật (⚡) để kích hoạt. Biểu tượng ✨ sẽ xuất hiện ở thanh chế độ." />
        <StepItem num={3} title="Tắt LoRA" desc="Bấm nút 'Tắt LoRA' để quay về giọng mặc định." />
      </div>

      <Callout type="warning">
        LoRA chỉ hoạt động với engine PyTorch. Nếu đang dùng GGUF hoặc Turbo, bạn cần chuyển sang PyTorch trước.
      </Callout>

      <SubTitle>Phát hiện phần cứng</SubTitle>
      <p>Bấm nút 'Phát hiện' trong sidebar để hệ thống quét CPU, GPU, VRAM và đưa ra gợi ý engine phù hợp nhất cho máy của bạn.</p>
    </Section>
  );
}

function ShortcutsSection() {
  return (
    <Section title="Phím tắt & Thao tác nhanh">
      <p>Các phím tắt giúp bạn thao tác nhanh hơn mà không cần dùng chuột.</p>

      <SubTitle>Trong vùng nhập text</SubTitle>
      <div className="space-y-2 mb-6">
        <ShortcutRow keys="Bấm nút 250ms/500ms/1s/2s" desc="Chèn marker khoảng dừng tại vị trí con trỏ." />
        <ShortcutRow keys="Enter" desc="Xuống dòng (không tạo audio)." />
      </div>

      <SubTitle>Trong Player</SubTitle>
      <div className="space-y-2 mb-6">
        <ShortcutRow keys="Bấm Play/Pause" desc="Phát hoặc tạm dừng audio." />
        <ShortcutRow keys="Bấm Restart" desc="Phát lại từ đầu." />
        <ShortcutRow keys="Bấm Download" desc="Tải file WAV về máy." />
        <ShortcutRow keys="Kéo thanh waveform" desc="Tua đến vị trí mong muốn." />
      </div>

      <SubTitle>Trong Sidebar</SubTitle>
      <div className="space-y-2">
        <ShortcutRow keys="Bấm 🔄" desc="Làm mới danh sách voice và LoRA." />
        <ShortcutRow keys="Bấm ⚙️ Hardware" desc="Phát hiện phần cứng và gợi ý engine." />
      </div>
    </Section>
  );
}

function TipsSection() {
  return (
    <Section title="Mẹo hay & Xử lý lỗi">
      <p>Tổng hợp các mẹo và cách khắc phục lỗi thường gặp.</p>

      <SubTitle>Mẹo hay</SubTitle>
      <div className="space-y-3 mb-8">
        <TipCard icon={<CheckCircle2 className="h-4 w-4" />} tone="success" title="Nhập text ngắn để thử nhanh" desc="Trước khi đọc cả đoạn dài, hãy thử 1–2 câu để kiểm tra giọng và cảm xúc đã ổn chưa." />
        <TipCard icon={<CheckCircle2 className="h-4 w-4" />} tone="success" title="Dùng lại file từ lịch sử" desc="File trong history có thể được dùng làm mẫu cho voice clone, giúp bạn giữ giọng nhất quán." />
        <TipCard icon={<CheckCircle2 className="h-4 w-4" />} tone="success" title="Chọn engine phù hợp" desc="Dùng 'Phát hiện phần cứng' để hệ thống gợi ý engine tốt nhất cho máy bạn." />
        <TipCard icon={<CheckCircle2 className="h-4 w-4" />} tone="success" title="Chèn khoảng dừng hợp lý" desc="Dùng marker 500ms–1s giữa các câu để audio nghe tự nhiên hơn." />
      </div>

      <SubTitle>Lỗi thường gặp</SubTitle>
      <div className="space-y-3">
        <TipCard icon={<AlertTriangle className="h-4 w-4" />} tone="warning" title="Không phát được audio" desc="Kiểm tra: (1) Backend có đang chạy không? (2) File audio có còn tồn tại trong history? (3) Trình duyệt có chặn autoplay không?" />
        <TipCard icon={<AlertTriangle className="h-4 w-4" />} tone="warning" title="Voice clone nghe không giống mẫu" desc="Nguyên nhân phổ biến: transcript nhập sai. Hãy nghe lại file mẫu và gõ chính xác từng chữ, kể cả dấu câu." />
        <TipCard icon={<AlertTriangle className="h-4 w-4" />} tone="warning" title="Tạo audio quá chậm" desc="Thử chuyển sang engine Turbo hoặc GGUF. Nếu dùng PyTorch, kiểm tra GPU có được nhận diện không (xem mục Hardware)." />
        <TipCard icon={<AlertTriangle className="h-4 w-4" />} tone="warning" title="LoRA không hoạt động" desc="LoRA chỉ chạy với engine PyTorch. Hãy chuyển sang PyTorch trước khi bật LoRA." />
        <TipCard icon={<AlertTriangle className="h-4 w-4" />} tone="warning" title="Ứng dụng không khởi động" desc="Kiểm tra backend FastAPI có đang chạy trên port 8000 không. Nếu không, khởi động lại backend." />
      </div>
    </Section>
  );
}

/* ═══ Reusable Components ═══ */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-5 border-b border-tvhs-border pb-3 font-outfit text-xl font-bold text-tvhs-text">{title}</h2>
      <div className="space-y-4 text-base leading-relaxed text-tvhs-text-secondary">{children}</div>
    </div>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-6 mb-3 font-outfit text-lg font-bold text-tvhs-text">{children}</h3>;
}

function StepItem({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="flex gap-4 rounded-lg bg-tvhs-main p-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tvhs-accent-faint text-sm font-bold text-tvhs-accent">{num}</div>
      <div>
        <div className="text-base font-bold text-tvhs-text">{title}</div>
        <div className="mt-0.5 text-sm text-tvhs-text-secondary">{desc}</div>
      </div>
    </div>
  );
}

function Callout({ type, children }: { type: "info" | "warning"; children: React.ReactNode }) {
  const styles = { info: "bg-blue-500/10 text-blue-300 border-blue-500/20", warning: "bg-amber-500/10 text-amber-300 border-amber-500/20" };
  return <div className={`rounded-lg border px-5 py-4 text-base leading-relaxed ${styles[type]}`}>{children}</div>;
}

function ParamRow({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 rounded-lg bg-tvhs-main px-4 py-3">
      <code className="mt-0.5 shrink-0 rounded bg-tvhs-elevated px-2 py-0.5 text-sm font-bold text-tvhs-accent">{name}</code>
      <span className="text-sm">{desc}</span>
    </div>
  );
}

function Requirement({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-tvhs-main px-4 py-3 text-base">
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function UseCase({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-tvhs-main px-4 py-3 text-base">
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function ModelCard({ name, desc, recommended }: { name: string; desc: string; recommended: string }) {
  return (
    <div className="flex items-start justify-between rounded-lg bg-tvhs-main p-4">
      <div>
        <div className="text-base font-bold text-tvhs-text">{name}</div>
        <div className="mt-1 text-sm text-tvhs-text-secondary">{desc}</div>
      </div>
      <span className="ml-4 shrink-0 rounded bg-tvhs-accent-faint px-3 py-1 text-xs font-bold text-tvhs-accent">{recommended}</span>
    </div>
  );
}

function UICard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg bg-tvhs-main p-4">
      <div className="text-base font-bold text-tvhs-text">{title}</div>
      <div className="mt-1 text-sm text-tvhs-text-secondary">{desc}</div>
    </div>
  );
}

function ShortcutRow({ keys, desc }: { keys: string; desc: string }) {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-tvhs-main px-4 py-3">
      <code className="shrink-0 rounded bg-tvhs-elevated px-3 py-1 text-sm font-bold text-tvhs-accent">{keys}</code>
      <span className="text-sm">{desc}</span>
    </div>
  );
}

function TipCard({ icon, tone, title, desc }: { icon: React.ReactNode; tone: "success" | "warning"; title: string; desc: string }) {
  const colors = { success: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", warning: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
  return (
    <div className={`flex gap-4 rounded-lg border p-4 ${colors[tone]}`}>
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <div className="text-base font-bold">{title}</div>
        <div className="mt-1 text-sm opacity-80">{desc}</div>
      </div>
    </div>
  );
}
