import Link from "next/link";
import { ArrowRight, AudioLines, Cpu, FolderOpen, History, Layers, LockKeyhole, Mic2, MonitorDown, Sparkles, Wand2 } from "lucide-react";
import { SiteTopbar } from "./components/site-topbar";
import { LOGO_URL } from "./lib/constants";

export default function LandingPage() {
  return (
    <main className="tvhs-app-bg min-h-[100dvh] overflow-y-auto text-tvhs-text">
      <SiteTopbar variant="landing" />

      <section className="px-6 pb-12 pt-12 lg:pb-16 lg:pt-16">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <img src={LOGO_URL} alt="ThanhVinh Studio" className="h-12 w-12 rounded-full border border-tvhs-border object-cover" />
              <div>
                <p className="tvhs-caption">Local TTS workstation</p>
                <p className="text-sm text-tvhs-text-secondary">VieNeu-TTS-v2 · Offline ready</p>
              </div>
            </div>
            <h1 className="font-outfit max-w-3xl text-5xl font-extrabold leading-tight text-tvhs-text md:text-6xl">
              ThanhVinh Studio
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-tvhs-text-secondary">
              Ứng dụng tạo giọng nói tiếng Việt chạy trên máy người dùng: nhập text, chọn giọng, clone từ audio mẫu, tạo hội thoại và lưu file WAV trong thư mục họ chọn.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/studio" className="btn-primary min-h-12 px-5 text-base">
                <Sparkles className="h-5 w-5" />
                Mở Studio
              </Link>
              <Link href="/guide" className="tvhs-btn-ghost min-h-12 !rounded-lg px-5 text-base">
                Hướng dẫn cài đặt
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="studio-panel overflow-hidden">
            <div className="flex h-12 items-center gap-2 border-b border-tvhs-border bg-tvhs-surface px-4">
              <span className="h-3 w-3 rounded-full bg-red-400/80" />
              <span className="h-3 w-3 rounded-full bg-amber-300/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              <span className="ml-3 text-xs font-semibold text-tvhs-text-muted">ThanhVinh Studio</span>
            </div>
            <div className="grid min-h-[420px] grid-cols-[72px_1fr] bg-tvhs-main">
              <div className="border-r border-tvhs-border bg-tvhs-surface p-3">
                <div className="mx-auto mb-6 h-10 w-10 rounded-full border border-tvhs-border bg-tvhs-accent-faint" />
                <div className="space-y-3">
                  {[Sparkles, Mic2, History, Cpu].map((Icon, index) => (
                    <div key={index} className={`mx-auto flex h-10 w-10 items-center justify-center rounded-lg ${index === 0 ? "bg-tvhs-accent-faint text-tvhs-accent" : "text-tvhs-text-muted"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="tvhs-caption">Studio</p>
                    <h2 className="font-outfit text-xl font-bold text-tvhs-text">Tạo giọng nói</h2>
                  </div>
                  <span className="rounded-lg bg-tvhs-accent px-3 py-2 text-xs font-bold text-black">CPU GGUF</span>
                </div>
                <div className="mb-4 grid grid-cols-3 gap-2">
                  {["Giọng có sẵn", "Clone", "Đối thoại"].map((label, index) => (
                    <div key={label} className={`rounded-lg border px-3 py-2 text-center text-xs font-semibold ${index === 0 ? "border-tvhs-accent bg-tvhs-accent text-black" : "border-tvhs-border bg-tvhs-surface text-tvhs-text-secondary"}`}>
                      {label}
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-tvhs-border bg-tvhs-surface p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-tvhs-text">Nhập văn bản</span>
                    <span className="text-xs uppercase text-tvhs-text-muted">Vietnamese</span>
                  </div>
                  <div className="h-40 rounded-lg border border-tvhs-border bg-tvhs-main p-4 text-sm leading-7 text-tvhs-text-secondary">
                    Xin chào, đây là ThanhVinh Studio. Ứng dụng tổng hợp giọng nói tiếng Việt chạy trực tiếp trên máy của bạn.
                  </div>
                </div>
                <div className="mt-4 rounded-lg border border-tvhs-border bg-tvhs-surface p-3">
                  <div className="mb-2 flex items-center justify-between text-xs text-tvhs-text-muted">
                    <span>Sẵn sàng phát audio</span>
                    <span>0:00 / 0:00</span>
                  </div>
                  <div className="flex h-8 items-center gap-1">
                    {Array.from({ length: 42 }).map((_, index) => (
                      <span key={index} className="w-[3px] rounded-full bg-tvhs-accent/25" style={{ height: `${8 + ((index * 5) % 20)}px` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-tvhs-border bg-tvhs-surface/70 px-6 py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Feature icon={<MonitorDown />} title="Ứng dụng desktop" desc="Người dùng bấm mở app, không cần biết frontend/backend hay source code." />
          <Feature icon={<LockKeyhole />} title="Local-first" desc="Dữ liệu xử lý trên máy, phù hợp workflow nội bộ và tài liệu nhạy cảm." />
          <Feature icon={<FolderOpen />} title="Chọn nơi lưu" desc="Output audio có thể lưu vào thư mục người dùng chọn." />
          <Feature icon={<Cpu />} title="Model tải riêng" desc="Installer nhẹ hơn, model được tải lần đầu vào thư mục ứng dụng." />
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <p className="tvhs-caption">Workflow</p>
            <h2 className="font-outfit mt-1 text-3xl font-bold text-tvhs-text">Từ kịch bản đến file WAV</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Workflow icon={<Layers />} title="Chọn chế độ" desc="Preset cho tốc độ, clone cho giọng mẫu, dialogue cho kịch bản nhiều nhân vật." />
            <Workflow icon={<Wand2 />} title="Tinh chỉnh" desc="Chọn giọng, phong cách, khoảng dừng và model phù hợp với máy." />
            <Workflow icon={<AudioLines />} title="Nghe và lưu" desc="Tạo audio, nghe lại trong player, tải về hoặc xem lại trong lịch sử." />
          </div>
        </div>
      </section>

      <footer className="border-t border-tvhs-border px-6 py-6 text-center text-xs text-tvhs-text-muted">
        © {new Date().getFullYear()} Thanh Vinh Holdings · ThanhVinh Studio
      </footer>
    </main>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="studio-panel p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-tvhs-accent-faint text-tvhs-accent [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
      <h3 className="font-outfit text-base font-bold text-tvhs-text">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-tvhs-text-secondary">{desc}</p>
    </div>
  );
}

function Workflow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-tvhs-border bg-tvhs-surface p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-tvhs-accent-faint text-tvhs-accent [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
      <h3 className="font-outfit text-lg font-bold text-tvhs-text">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-tvhs-text-secondary">{desc}</p>
    </div>
  );
}
