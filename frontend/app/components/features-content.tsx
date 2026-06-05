"use client";

import { Cpu, FolderOpen, History, Layers, LockKeyhole, Mic, MonitorDown, Settings, Upload, Users, Wand2 } from "lucide-react";

export function FeaturesContent() {
  return (
    <div className="saas-page mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="tvhs-caption">Tính năng</p>
        <h1 className="font-outfit mt-1 text-3xl font-bold text-tvhs-text">ThanhVinh Studio</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-tvhs-text-secondary">
          Bộ công cụ tạo giọng nói tiếng Việt cho desktop local. Người dùng mở ứng dụng, tải model lần đầu và làm việc ngay trên máy của họ.
        </p>
      </div>

      <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <FeatureCard icon={<Mic />} title="Giọng có sẵn" desc="Chọn voice từ thư viện, nhập text, chỉnh phong cách đọc và tạo file WAV." items={["Preset voice cho tác vụ nhanh", "Chèn khoảng dừng 250ms đến 2s", "Phù hợp voiceover, bài học, thông báo"]} />
        <FeatureCard icon={<Upload />} title="Voice clone" desc="Dùng audio tham chiếu và transcript để tạo bản đọc theo giọng mẫu." items={["Upload WAV, MP3 hoặc FLAC", "Nhập transcript khớp audio", "Dùng cho giọng cá nhân hóa"]} />
        <FeatureCard icon={<Users />} title="Đối thoại" desc="Tạo kịch bản nhiều dòng, mỗi dòng dùng một voice và khoảng dừng riêng." items={["Nhiều nhân vật trong một file", "Chỉnh emotion từng dòng", "Phù hợp roleplay và training case"]} />
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FeatureCard icon={<History />} title="History và output" desc="File đã tạo được lưu lại để nghe, tải xuống hoặc dùng lại." items={["Chọn thư mục output trong app", "Nghe lại file đã sinh", "Tải file WAV về máy"]} />
        <FeatureCard icon={<Cpu />} title="Model và phần cứng" desc="Chuyển model theo cấu hình máy và xem gợi ý phần cứng." items={["CPU GGUF cho máy phổ thông", "PyTorch cho GPU", "Turbo khi cần tốc độ"]} />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <LocalCard icon={<MonitorDown />} title="Desktop app" desc="Không cần mở source code để chạy thủ công." />
        <LocalCard icon={<LockKeyhole />} title="Dữ liệu local" desc="Text, audio và output ở trên máy người dùng." />
        <LocalCard icon={<FolderOpen />} title="Output rõ ràng" desc="Người dùng tự chọn nơi lưu file." />
        <LocalCard icon={<Settings />} title="Dễ vận hành" desc="Cài xong, tải model một lần, rồi dùng." />
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc, items }: { icon: React.ReactNode; title: string; desc: string; items: string[] }) {
  return (
    <article className="studio-panel flex flex-col p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-tvhs-accent-faint text-tvhs-accent [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </div>
      <h2 className="font-outfit text-lg font-bold text-tvhs-text">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-tvhs-text-secondary">{desc}</p>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-2 rounded-lg border border-tvhs-border bg-tvhs-main/60 px-3 py-2 text-sm text-tvhs-text-secondary">
            <Wand2 className="h-4 w-4 shrink-0 text-tvhs-accent" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function LocalCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-tvhs-border bg-tvhs-surface p-4">
      <div className="mb-3 text-tvhs-accent [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
      <h3 className="font-outfit text-sm font-bold text-tvhs-text">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-tvhs-text-muted">{desc}</p>
    </div>
  );
}
