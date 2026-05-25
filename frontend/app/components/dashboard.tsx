"use client";

import { Layers, Mic, MessageSquare, Clock, Cpu, Sparkles, Zap, ChevronRight } from "lucide-react";

interface AudioFile { filename: string; size_kb: number; created: string }
interface Voice { id: string; name: string }
interface SystemStatus {
  base_model: { downloaded: boolean; loaded: boolean };
  current_model?: { type: string };
  lora: { active: string | null };
}

interface Props {
  audioHistory: AudioFile[];
  voices: Voice[];
  status: SystemStatus | null;
  onNavigate: (page: string) => void;
}

function classifyAudio(filename: string): "clone" | "dialogue" | "preset" {
  if (filename.startsWith("clone_")) return "clone";
  if (filename.startsWith("dialogue_")) return "dialogue";
  return "preset";
}

function estimateDuration(sizeKb: number): number {
  return Math.round((sizeKb / 150) * 10) / 10;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

export function Dashboard({ audioHistory, voices, status, onNavigate }: Props) {
  const totalAudio = audioHistory.length;
  const totalSizeKb = audioHistory.reduce((sum, f) => sum + f.size_kb, 0);
  const totalDurationSec = estimateDuration(totalSizeKb);

  const byType = { preset: 0, clone: 0, dialogue: 0 };
  audioHistory.forEach((f) => { byType[classifyAudio(f.filename)]++; });

  const recentFiles = [...audioHistory].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()).slice(0, 5);

  const currentModel = status?.current_model?.type?.toUpperCase() || "GGUF";
  const activeLora = status?.lora?.active;

  return (
    <div className="saas-page">
      <div className="mb-1">
        <h1 className="font-outfit text-xl font-bold text-tvhs-text">Xin chào</h1>
        <p className="text-xs text-tvhs-text-secondary">Tổng quan hoạt động</p>
      </div>

      <div className="my-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<Layers className="h-[18px] w-[18px]" />} value={String(totalAudio)} label="Audio đã tạo" color="accent" />
        <StatCard icon={<Clock className="h-[18px] w-[18px]" />} value={formatDuration(totalDurationSec)} label="Tổng thời lượng" color="success" />
        <StatCard icon={<Mic className="h-[18px] w-[18px]" />} value={String(voices.length)} label="Giọng nói" color="purple" />
        <StatCard icon={<Cpu className="h-[18px] w-[18px]" />} value={currentModel} label="Model hiện tại" color="info" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <div className="studio-panel p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-tvhs-text">
              <Zap className="h-4 w-4 text-tvhs-accent" /> Tạo nhanh
            </div>
            <div className="mb-3 flex gap-2">
              <input
                type="text"
                placeholder="Nhập văn bản cần đọc..."
                className="tts-input flex-1 !py-2.5 !text-xs"
                onKeyDown={(e) => { if (e.key === "Enter") onNavigate("studio"); }}
              />
              <button onClick={() => onNavigate("studio")} className="btn-primary !rounded-lg !px-4 !py-2 !text-xs">
                <Sparkles className="h-3.5 w-3.5" /> Tạo
              </button>
            </div>
            <div className="space-y-0.5">
              {recentFiles.length === 0 ? (
                <p className="py-4 text-center text-xs text-tvhs-text-muted">Chưa có audio nào</p>
              ) : recentFiles.map((f) => (
                <button
                  key={f.filename}
                  onClick={() => onNavigate("history")}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-tvhs-hover"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-tvhs-accent-faint text-tvhs-accent">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
                  </span>
                  <span className="flex-1 truncate text-xs font-medium text-tvhs-text">{f.filename}</span>
                  <span className="shrink-0 text-[10px] text-tvhs-text-muted">{(f.size_kb / 1024).toFixed(1)} MB</span>
                  <span className="shrink-0 text-[10px] text-tvhs-text-muted">{timeAgo(f.created)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="studio-panel p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-tvhs-text">
              <Clock className="h-4 w-4 text-tvhs-accent" /> Phân loại audio
            </div>
            <div className="grid grid-cols-3 gap-3">
              <TypeBreakdown icon={<Layers className="h-4 w-4" />} label="Preset" count={byType.preset} total={totalAudio} />
              <TypeBreakdown icon={<Mic className="h-4 w-4" />} label="Clone" count={byType.clone} total={totalAudio} />
              <TypeBreakdown icon={<MessageSquare className="h-4 w-4" />} label="Dialogue" count={byType.dialogue} total={totalAudio} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="studio-panel p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-tvhs-text">
              <Sparkles className="h-4 w-4 text-tvhs-accent" /> Truy cập nhanh
            </div>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction icon={<Sparkles className="h-4 w-4" />} label="Studio" desc="Tạo audio" color="accent" onClick={() => onNavigate("studio")} />
              <QuickAction icon={<Mic className="h-4 w-4" />} label="Voices" desc="Quản lý giọng" color="purple" onClick={() => onNavigate("voices")} />
              <QuickAction icon={<Clock className="h-4 w-4" />} label="History" desc="Lịch sử" color="success" onClick={() => onNavigate("history")} />
              <QuickAction icon={<Cpu className="h-4 w-4" />} label="Settings" desc="Cài đặt" color="info" onClick={() => onNavigate("settings")} />
            </div>
          </div>

          {activeLora && (
            <div className="studio-panel p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-tvhs-text">
                <Sparkles className="h-4 w-4 text-purple-400" /> LoRA Active
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-purple-500/10 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                <span className="text-xs font-semibold text-purple-300">{activeLora}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  const colorMap: Record<string, string> = {
    accent: "bg-tvhs-accent-faint text-tvhs-accent",
    success: "bg-emerald-500/10 text-emerald-400",
    purple: "bg-purple-500/10 text-purple-400",
    info: "bg-blue-500/10 text-blue-400",
  };
  return (
    <div className="studio-panel flex items-center gap-3 p-3.5">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colorMap[color]}`}>{icon}</div>
      <div>
        <div className="font-outfit text-lg font-extrabold text-tvhs-accent">{value}</div>
        <div className="text-[10px] text-tvhs-text-secondary">{label}</div>
      </div>
    </div>
  );
}

function TypeBreakdown({ icon, label, count, total }: { icon: React.ReactNode; label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="rounded-lg bg-tvhs-elevated p-3 text-center">
      <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-tvhs-accent-faint text-tvhs-accent">{icon}</div>
      <div className="font-outfit text-lg font-bold text-tvhs-accent">{count}</div>
      <div className="text-[10px] text-tvhs-text-secondary">{label}</div>
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-tvhs-main">
        <div className="h-full rounded-full bg-tvhs-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function QuickAction({ icon, label, desc, color, onClick }: { icon: React.ReactNode; label: string; desc: string; color: string; onClick: () => void }) {
  const colorMap: Record<string, string> = {
    accent: "bg-tvhs-accent-faint text-tvhs-accent",
    success: "bg-emerald-500/10 text-emerald-400",
    purple: "bg-purple-500/10 text-purple-400",
    info: "bg-blue-500/10 text-blue-400",
  };
  return (
    <button onClick={onClick} className="flex items-center gap-2.5 rounded-lg bg-tvhs-elevated p-3 text-left transition hover:bg-tvhs-hover hover:translate-y-[-1px]">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colorMap[color]}`}>{icon}</div>
      <div>
        <div className="text-xs font-semibold text-tvhs-text">{label}</div>
        <div className="text-[10px] text-tvhs-text-muted">{desc}</div>
      </div>
      <ChevronRight className="ml-auto h-3.5 w-3.5 text-tvhs-text-muted" />
    </button>
  );
}
