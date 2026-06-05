"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Cpu, Download, FolderOpen, History, Mic, MonitorDown, Play, Settings, Upload } from "lucide-react";

const SECTIONS = [
  { id: "install", label: "Cài đặt", icon: <MonitorDown className="h-4 w-4" /> },
  { id: "first-run", label: "Lần đầu mở", icon: <Download className="h-4 w-4" /> },
  { id: "studio", label: "Tạo audio", icon: <Mic className="h-4 w-4" /> },
  { id: "output", label: "Lưu output", icon: <FolderOpen className="h-4 w-4" /> },
  { id: "troubleshoot", label: "Xử lý lỗi", icon: <AlertTriangle className="h-4 w-4" /> },
];

export function GuideContent() {
  const [activeSection, setActiveSection] = useState("install");

  return (
    <div className="saas-page mx-auto max-w-6xl">
      <div className="mb-8">
        <p className="tvhs-caption">Hướng dẫn</p>
        <h1 className="font-outfit mt-1 text-3xl font-bold text-tvhs-text">Sử dụng ThanhVinh Studio</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-tvhs-text-secondary">
          Tài liệu dành cho người dùng bản desktop local. Không yêu cầu biết code, không cần tự chạy frontend hoặc backend.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-0 space-y-1">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex min-h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-sm font-semibold transition-colors ${activeSection === section.id ? "bg-tvhs-accent-faint text-tvhs-accent" : "text-tvhs-text-secondary hover:bg-tvhs-elevated hover:text-tvhs-text"}`}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="studio-panel p-6">
          {activeSection === "install" && <InstallSection />}
          {activeSection === "first-run" && <FirstRunSection />}
          {activeSection === "studio" && <StudioSection />}
          {activeSection === "output" && <OutputSection />}
          {activeSection === "troubleshoot" && <TroubleshootSection />}
        </main>
      </div>
    </div>
  );
}

function InstallSection() {
  return (
    <Section title="Cài đặt ứng dụng">
      <Step num={1} title="Windows" desc="Mở file setup `.exe`, chọn thư mục cài đặt và hoàn tất wizard." />
      <Step num={2} title="macOS" desc="Mở file `.dmg`, kéo ứng dụng vào Applications. Nếu macOS chặn vì chưa ký Apple Developer, dùng file Open First Time.command đi kèm hoặc mở qua chuột phải > Open." />
      <Step num={3} title="Không cần source code" desc="Bộ cài chỉ chứa phần cần để chạy ứng dụng desktop local, không yêu cầu người dùng cài Node, Python hay mở terminal." />
      <Callout tone="info">
        Model không nằm trong installer để file cài nhẹ hơn. Ứng dụng sẽ tải model ở lần mở đầu tiên.
      </Callout>
    </Section>
  );
}

function FirstRunSection() {
  return (
    <Section title="Lần đầu mở ứng dụng">
      <Step num={1} title="Mở ThanhVinh Studio" desc="Ứng dụng tự khởi động backend local và mở giao diện desktop." />
      <Step num={2} title="Tải model" desc="Bấm Tải model và bắt đầu. Model được lưu trong thư mục ứng dụng hoặc thư mục dữ liệu local đã cấu hình." />
      <Step num={3} title="Chờ nạp model" desc="Khi trạng thái sẵn sàng, bạn có thể vào Studio để tạo audio." />
      <Callout tone="warning">
        Không tắt ứng dụng trong lúc tải model. Nếu mất mạng giữa chừng, mở lại và bấm tải lại.
      </Callout>
    </Section>
  );
}

function StudioSection() {
  return (
    <Section title="Tạo audio trong Studio">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <ModeCard icon={<Mic />} title="Giọng có sẵn" desc="Chọn voice, nhập văn bản và bấm Tạo giọng." />
        <ModeCard icon={<Upload />} title="Clone" desc="Chọn audio tham chiếu, nhập transcript đúng với audio rồi tạo bản đọc." />
        <ModeCard icon={<Play />} title="Đối thoại" desc="Thêm từng dòng hội thoại, chọn voice và khoảng dừng cho từng dòng." />
      </div>
      <SubTitle>Gợi ý thao tác</SubTitle>
      <Step num={1} title="Thử đoạn ngắn trước" desc="Dùng 1 đến 2 câu để kiểm tra voice, model và tốc độ." />
      <Step num={2} title="Chèn khoảng dừng" desc="Dùng các nút 250ms, 500ms, 1s, 2s để audio nghe tự nhiên hơn." />
      <Step num={3} title="Nghe lại trong player" desc="Sau khi tạo xong, dùng player bên dưới để phát, tua hoặc tải file." />
    </Section>
  );
}

function OutputSection() {
  return (
    <Section title="Chọn nơi lưu output">
      <Step num={1} title="Bấm nút Lưu output" desc="Nút nằm trên thanh trên cùng của ứng dụng." />
      <Step num={2} title="Chọn thư mục" desc="Chọn nơi người dùng muốn lưu file audio, ví dụ Desktop, Documents hoặc ổ dữ liệu riêng." />
      <Step num={3} title="Tạo audio mới" desc="Các file sau đó sẽ được lưu vào thư mục đã chọn và vẫn hiện trong History." />
      <Callout tone="info">
        Tính năng này giúp người dùng không phải mò trong thư mục cài đặt để tìm file WAV.
      </Callout>
    </Section>
  );
}

function TroubleshootSection() {
  return (
    <Section title="Xử lý lỗi thường gặp">
      <Issue icon={<Settings />} title="Không mở được app" desc="Chờ vài giây rồi mở lại. Trên macOS chưa ký, dùng chuột phải > Open hoặc file mở lần đầu đi kèm." />
      <Issue icon={<Download />} title="Tải model lỗi" desc="Kiểm tra internet, đóng app và mở lại để tải tiếp." />
      <Issue icon={<Cpu />} title="Tạo audio chậm" desc="Dùng CPU GGUF cho máy phổ thông hoặc thử Turbo nếu có sẵn." />
      <Issue icon={<History />} title="Không thấy file output" desc="Bấm Lưu output để chọn lại thư mục, sau đó tạo audio mới." />
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-outfit mb-5 border-b border-tvhs-border pb-3 text-xl font-bold text-tvhs-text">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-tvhs-text-secondary">{children}</div>
    </section>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-outfit mt-6 text-base font-bold text-tvhs-text">{children}</h3>;
}

function Step({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-tvhs-border bg-tvhs-main/60 p-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-tvhs-accent-faint text-sm font-bold text-tvhs-accent">{num}</div>
      <div>
        <div className="font-semibold text-tvhs-text">{title}</div>
        <div className="mt-1 text-tvhs-text-secondary">{desc}</div>
      </div>
    </div>
  );
}

function ModeCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-tvhs-border bg-tvhs-main/60 p-4">
      <div className="mb-3 text-tvhs-accent [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
      <div className="font-semibold text-tvhs-text">{title}</div>
      <div className="mt-1 text-sm leading-6 text-tvhs-text-muted">{desc}</div>
    </div>
  );
}

function Issue({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-tvhs-border bg-tvhs-main/60 p-4">
      <div className="mt-0.5 text-tvhs-accent [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
      <div>
        <div className="font-semibold text-tvhs-text">{title}</div>
        <div className="mt-1 text-tvhs-text-secondary">{desc}</div>
      </div>
    </div>
  );
}

function Callout({ tone, children }: { tone: "info" | "warning"; children: React.ReactNode }) {
  const style = tone === "info"
    ? "border-tvhs-accent/25 bg-tvhs-accent-faint text-tvhs-accent-light"
    : "border-amber-500/25 bg-amber-500/10 text-amber-200";
  return (
    <div className={`flex gap-3 rounded-lg border p-4 ${style}`}>
      {tone === "info" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />}
      <div>{children}</div>
    </div>
  );
}
