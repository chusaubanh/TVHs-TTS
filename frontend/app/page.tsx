import Link from "next/link";
import {
  ArrowRight,
  AudioLines,
  ChevronDown,
  Cpu,
  Gauge,
  History,
  Layers,
  MessageSquare,
  Mic2,
  Sparkles,
  Upload,
  Wand2,
  Zap,
} from "lucide-react";
import { LiquidBackground } from "./components/liquid-background";
import { SiteTopbar } from "./components/site-topbar";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-y-auto bg-tvhs-main text-tvhs-text">
      <SiteTopbar variant="landing" />

      <section className="relative flex min-h-[calc(100vh-72px)] flex-col items-center justify-center px-6 py-20 text-center lg:py-28">
        <LiquidBackground intensity="hero" />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-40"
          style={{
            background:
              "linear-gradient(to bottom, transparent, var(--color-tvhs-main))",
          }}
        />

        <div className="fade-in relative z-[3] max-w-4xl">
          <div className="mb-6 flex justify-center">
            <div className="flex items-center gap-2 rounded-full border border-tvhs-accent/30 bg-tvhs-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-tvhs-accent-light">
              <Zap className="h-3.5 w-3.5 fill-current" />
              VieNeu-TTS Voice Studio
            </div>
          </div>

          <h1 className="gradient-text font-outfit mb-4 text-5xl font-extrabold leading-[1.05] md:text-6xl lg:text-7xl">
            Thành Vinh Studio
          </h1>

          <p className="mx-auto mb-10 max-w-3xl text-lg font-medium tracking-wide text-tvhs-text-secondary md:text-xl">
            Ứng dụng tạo giọng nói tiếng Việt nội bộ: chọn giọng có sẵn, clone
            giọng từ mẫu audio, dựng hội thoại nhiều nhân vật và xuất file WAV
            ngay trên máy.
          </p>

          <div className="mx-auto mb-12 max-w-2xl text-base font-light italic leading-relaxed text-tvhs-text-secondary md:text-lg">
            &ldquo;Mục tiêu của Thành Vinh Studio là giúp team biến kịch bản đào tạo,
            thông báo và video hướng dẫn thành audio rõ ràng, nhất quán, dùng
            được ngay.&rdquo;
          </div>

          <div className="mb-18 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/studio"
              className="gradient-gold font-outfit flex items-center gap-2 rounded-full px-10 py-4 text-base font-bold tracking-wide text-black shadow-[0_4px_20px_rgba(197,160,89,0.3)] transition-all hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_8px_28px_rgba(197,160,89,0.45)]"
            >
              Mở Studio
              <ArrowRight className="h-5 w-5" />
            </Link>

            <a
              href="#features"
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-tvhs-text-secondary transition hover:text-tvhs-accent"
            >
              Xem chức năng
              <ChevronDown className="h-4 w-4" />
            </a>
          </div>

          <div id="features" className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Layers />}
              title="Giọng có sẵn"
              desc="Chọn nhanh giọng đọc từ thư viện model hiện có, kèm cảm xúc và khoảng nghỉ."
            />
            <FeatureCard
              icon={<Mic2 />}
              title="Clone giọng"
              desc="Upload audio tham chiếu và transcript để tạo bản đọc theo giọng mẫu."
            />
            <FeatureCard
              icon={<MessageSquare />}
              title="Hội thoại"
              desc="Tạo nhiều dòng thoại với từng giọng, cảm xúc và thời gian dừng riêng."
            />
            <FeatureCard
              icon={<Cpu />}
              title="Model nội bộ"
              desc="Chuyển CPU/GPU/Turbo, quản lý LoRA và chạy trên hạ tầng của chúng ta."
            />
          </div>
        </div>

        <div className="relative z-[3] mt-14 animate-bounce text-tvhs-text-muted">
          <ChevronDown className="h-7 w-7" />
        </div>
      </section>

      <section className="border-y border-tvhs-border bg-tvhs-surface px-6 py-20 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-tvhs-accent">
              Quy trình
            </div>
            <h2 className="font-outfit mb-3 text-3xl font-bold text-tvhs-text md:text-4xl">
              Từ kịch bản đến audio hoàn chỉnh
            </h2>
            <p className="mx-auto max-w-2xl text-tvhs-text-secondary">
              App hiện tại tập trung vào workflow sản xuất thật: nhập text, chọn
              nguồn giọng, sinh audio, nghe lại, tải file và xem lịch sử.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <UseCaseCard
              icon={<Upload />}
              title="Chuẩn bị nguồn giọng"
              desc="Dùng preset có sẵn hoặc upload audio mẫu cho chế độ clone."
            />
            <UseCaseCard
              icon={<Wand2 />}
              title="Tinh chỉnh cách đọc"
              desc="Chọn cảm xúc, tốc độ, khoảng nghỉ và bật streaming khi cần phản hồi nhanh."
            />
            <UseCaseCard
              icon={<AudioLines />}
              title="Nghe và xuất file"
              desc="Player kiểu TVHs-TTS cho nghe thử, tua lại và tải file WAV."
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:py-24">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard icon={<Gauge />} label="Chế độ" value="3" desc="Preset, Clone, Dialogue" />
          <StatCard icon={<History />} label="Quản lý" value="Audio" desc="Lịch sử và phát lại file đã sinh" />
          <StatCard icon={<Sparkles />} label="Mở rộng" value="LoRA" desc="Tải, bật/tắt adapter giọng" />
        </div>
      </section>

      <section className="px-6 pb-20 text-center lg:pb-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="gradient-text font-outfit mb-4 text-3xl font-bold md:text-4xl">
            Sẵn sàng tạo bản đọc đầu tiên?
          </h2>
          <p className="mb-8 text-tvhs-text-secondary">
            Mở Studio, giữ nguyên vùng nhập text hiện tại và bắt đầu sinh audio.
          </p>
          <Link
            href="/studio"
            className="gradient-gold font-outfit inline-flex items-center gap-2 rounded-full px-10 py-4 font-bold text-black shadow-[0_4px_20px_rgba(197,160,89,0.3)] transition-all hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_8px_28px_rgba(197,160,89,0.45)]"
          >
            <Sparkles className="h-5 w-5" />
            Vào Studio
          </Link>
        </div>
      </section>

      <footer className="border-t border-tvhs-border px-6 py-6 text-center text-xs text-tvhs-text-muted">
        © {new Date().getFullYear()} Thành Vinh Holdings · Powered by VieNeu-TTS
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="glass flex flex-col items-center gap-3 p-6 text-center transition hover:border-tvhs-accent/30">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tvhs-accent-faint text-tvhs-accent [&>svg]:h-6 [&>svg]:w-6">
        {icon}
      </div>
      <h3 className="font-outfit text-sm font-bold uppercase tracking-wide text-tvhs-text">
        {title}
      </h3>
      <p className="text-xs leading-relaxed text-tvhs-text-muted">{desc}</p>
    </div>
  );
}

function UseCaseCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="studio-panel flex flex-col gap-3 p-6 transition-all hover:-translate-y-1 hover:border-tvhs-accent/30">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-tvhs-accent-faint text-tvhs-accent [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </div>
      <h3 className="font-outfit text-base font-bold text-tvhs-text">{title}</h3>
      <p className="text-sm leading-relaxed text-tvhs-text-secondary">{desc}</p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  desc,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  desc: string;
}) {
  return (
    <div className="studio-panel flex items-center gap-4 p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-tvhs-accent-faint text-tvhs-accent [&>svg]:h-6 [&>svg]:w-6">
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-tvhs-text-muted">
          {label}
        </div>
        <div className="font-outfit text-2xl font-bold text-tvhs-accent">{value}</div>
        <p className="text-sm text-tvhs-text-secondary">{desc}</p>
      </div>
    </div>
  );
}
