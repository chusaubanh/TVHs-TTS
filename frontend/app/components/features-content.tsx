"use client";

import { Layers, Mic, MessageSquare, Clock, Cpu, Upload, Server, Radio, Sparkles, Zap, Shield, Headphones } from "lucide-react";

export function FeaturesContent() {
  return (
    <div className="saas-page">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-tvhs-accent">Chức năng</div>
        <h1 className="gradient-text font-outfit mb-4 text-4xl font-extrabold">Thành Vinh Studio</h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-tvhs-text-secondary">
          Ứng dụng tổng hợp giọng nói tiếng Việt chạy hoàn toàn trên máy tính của bạn.
          Không gửi dữ liệu ra ngoài, không cần internet, không giới hạn số lần sử dụng.
        </p>
      </div>

      {/* Core Features */}
      <div className="mb-3 text-xs font-bold uppercase tracking-widest text-tvhs-text-muted">Ba chế độ chính</div>
      <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-3">
        <FeatureCard
          icon={<Mic className="h-5 w-5" />}
          title="Preset Voices"
          tagline="Chọn giọng có sẵn, nhập text, tạo audio"
          points={[
            "Chọn từ thư viện giọng đã được train sẵn",
            "Điều chỉnh cảm xúc: tự nhiên, vui, buồn, tức giận",
            "Tốc độ nói và khoảng lặng giữa các câu",
            "Phù hợp: đọc sách, thuyết trình, voiceover nhanh",
          ]}
          tip="Bắt đầu với chế độ này nếu bạn mới sử dụng lần đầu."
        />
        <FeatureCard
          icon={<Upload className="h-5 w-5" />}
          title="Voice Clone"
          tagline="Tạo giọng giống từ mẫu audio tham chiếu"
          points={[
            "Upload file audio mẫu 3–10 giây (WAV, MP3, FLAC)",
            "Nhập transcript chính xác với nội dung file mẫu",
            "Hệ thống sẽ tạo giọng mới giống với giọng trong mẫu",
            "Phù hợp: narrate giọng riêng, tạo voice cá nhân hóa",
          ]}
          tip="Chất lượng clone phụ thuộc vào độ rõ ràng của file mẫu và độ chính xác của transcript."
        />
        <FeatureCard
          icon={<Layers className="h-5 w-5" />}
          title="Dialogue"
          tagline="Nhiều giọng trong một kịch bản hội thoại"
          points={[
            "Mỗi dòng gán một voice riêng biệt",
            "Tự động chèn khoảng lặng giữa các câu",
            "Hỗ trợ cảm xúc khác nhau cho từng dòng",
            "Phù hợp: kịch bản podcast, training case, roleplay",
          ]}
          tip="Dùng khi cần mô phỏng cuộc hội thoại giữa 2–3 nhân vật trở lên."
        />
      </div>

      {/* Additional Features */}
      <div className="mb-3 text-xs font-bold uppercase tracking-widest text-tvhs-text-muted">Quản lý & điều khiển</div>
      <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-2">
        <FeatureCard
          icon={<Clock className="h-5 w-5" />}
          title="Lịch sử & Streaming"
          tagline="Quản lý và phát lại mọi file đã tạo"
          points={[
            "Mọi file audio đều được lưu tự động vào lịch sử",
            "Phát lại bất kỳ lúc nào, không cần tạo lại",
            "Tải về định dạng WAV chất lượng cao",
            "Streaming playback: nghe ngay trong khi đang sinh audio",
          ]}
          tip="File lịch sử có thể được dùng lại làm mẫu cho voice clone."
        />
        <FeatureCard
          icon={<Cpu className="h-5 w-5" />}
          title="Model & Hardware"
          tagline="Chuyển đổi engine và quản lý LoRA"
          points={[
            "Hỗ trợ 3 engine: GGUF (nhẹ), PyTorch (chất lượng cao), Turbo (nhanh)",
            "Tự động phát hiện phần cứng: CPU, GPU, VRAM",
            "Tải và bật/tắt LoRA adapter để tinh chỉnh giọng",
            "Chạy hoàn toàn local — dữ liệu không rời khỏi máy bạn",
          ]}
          tip="Dùng GGUF nếu máy yếu, Turbo nếu cần tốc độ, PyTorch nếu cần chất lượng tốt nhất."
        />
      </div>

      {/* Why Local */}
      <div className="mb-3 text-xs font-bold uppercase tracking-widest text-tvhs-text-muted">Tại sao chạy local?</div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <WhyLocalCard
          icon={<Shield className="h-5 w-5" />}
          title="Bảo mật tuyệt đối"
          desc="Dữ liệu audio và giọng nói không bao giờ rời khỏi máy tính. Không lo bị thu thập hay rò rỉ."
        />
        <WhyLocalCard
          icon={<Zap className="h-5 w-5" />}
          title="Không giới hạn"
          desc="Không cần API key, không giới hạn số lần gọi, không tốn tiền theo từng request. Dùng thoải mái."
        />
        <WhyLocalCard
          icon={<Headphones className="h-5 w-5" />}
          title="Offline hoàn toàn"
          desc="Sau khi tải model, ứng dụng hoạt động mà không cần internet. Hữu ích khi làm việc ở nơi không có mạng."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, tagline, points, tip }: { icon: React.ReactNode; title: string; tagline: string; points: string[]; tip?: string }) {
  return (
    <div className="studio-panel flex flex-col gap-3 p-5 transition-all hover:-translate-y-0.5 hover:border-tvhs-accent/30">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-tvhs-accent-faint text-tvhs-accent">{icon}</div>
        <div>
          <h3 className="font-outfit text-base font-bold text-tvhs-text">{title}</h3>
          <p className="text-sm text-tvhs-accent-light">{tagline}</p>
        </div>
      </div>
      <ul className="space-y-2 text-base leading-relaxed text-tvhs-text-secondary">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2">
            <span className="mt-1 text-tvhs-accent">▸</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      {tip && (
        <div className="mt-auto rounded-lg bg-tvhs-accent-faint px-4 py-3 text-sm leading-relaxed text-tvhs-accent-light">
          💡 {tip}
        </div>
      )}
    </div>
  );
}

function WhyLocalCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="studio-panel flex flex-col gap-3 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tvhs-accent-faint text-tvhs-accent">{icon}</div>
      <h4 className="font-outfit text-base font-bold text-tvhs-text">{title}</h4>
      <p className="text-base leading-relaxed text-tvhs-text-secondary">{desc}</p>
    </div>
  );
}
