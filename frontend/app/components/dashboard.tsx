"use client";

import { Layers, Mic, MessageSquare, Clock, Cpu, Sparkles, Zap, ChevronRight, FolderOpen } from "lucide-react";
import type { AudioFile, Voice, SystemStatus } from "../types";
import { formatDuration, timeAgo } from "../lib/format";

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

export function Dashboard({ audioHistory, voices, status, onNavigate }: Props) {
  const totalAudio = audioHistory.length;
  const totalSizeKb = audioHistory.reduce((sum, f) => sum + f.size_kb, 0);
  const totalDurationSec = estimateDuration(totalSizeKb);
  const recentFiles = [...audioHistory]
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    .slice(0, 6);

  const byType = { preset: 0, clone: 0, dialogue: 0 };
  audioHistory.forEach((f) => {
    byType[classifyAudio(f.filename)]++;
  });

  return (
    <div className="saas-page mx-auto max-w-[1280px]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="tvhs-caption">Tổng quan hoạt động</p>
          <h1 className="font-outfit mt-1 text-2xl font-bold text-tvhs-text">ThanhVinh Studio</h1>
        </div>
        <button onClick={() => onNavigate("studio")} className="btn-primary min-h-10 px-4 py-2 text-sm">
          <Sparkles className="h-4 w-4" />
          Tạo audio
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard icon={<Layers className="h-5 w-5" />} value={String(totalAudio)} label="Audio đã tạo" />
        <StatCard icon={<Clock className="h-5 w-5" />} value={formatDuration(totalDurationSec)} label="Tổng thời lượng" />
        <StatCard icon={<Mic className="h-5 w-5" />} value={String(voices.length)} label="Giọng nói" />
        <StatCard icon={<Cpu className="h-5 w-5" />} value={status?.current_model?.type?.toUpperCase() || "GGUF"} label="Model hiện tại" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
        <section className="studio-panel p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="tvhs-panel-title">Tạo nhanh</h2>
              <p className="text-xs text-tvhs-text-muted">Chuyển thẳng vào Studio để nhập nội dung và sinh file WAV.</p>
            </div>
            <Zap className="h-5 w-5 text-tvhs-accent" />
          </div>

          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
            <input
              type="text"
              placeholder="Nhập nội dung cần đọc..."
              className="tvhs-input min-h-10 !py-2.5 !text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") onNavigate("studio");
              }}
            />
            <button onClick={() => onNavigate("studio")} className="btn-primary min-h-10 px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4" />
              Mở Studio
            </button>
          </div>

          <div className="rounded-lg border border-tvhs-border bg-tvhs-main/60">
            <div className="flex items-center justify-between border-b border-tvhs-border px-3 py-2">
              <span className="text-xs font-semibold text-tvhs-text">File gần đây</span>
              <button onClick={() => onNavigate("history")} className="text-xs font-semibold text-tvhs-accent hover:text-tvhs-accent-light">
                Xem tất cả
              </button>
            </div>
            {recentFiles.length === 0 ? (
              <div className="flex min-h-36 items-center justify-center text-sm text-tvhs-text-muted">
                Chưa có audio nào.
              </div>
            ) : (
              <div className="divide-y divide-tvhs-border">
                {recentFiles.map((file) => (
                  <button key={file.filename} onClick={() => onNavigate("history")} className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-tvhs-elevated">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-tvhs-accent-faint text-tvhs-accent">
                      <FolderOpen className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-tvhs-text">{file.filename}</span>
                      <span className="block text-xs text-tvhs-text-muted">{timeAgo(file.created)}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs text-tvhs-text-secondary">{(file.size_kb / 1024).toFixed(1)} MB</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="studio-panel p-4">
            <h2 className="tvhs-panel-title mb-3">Truy cập nhanh</h2>
            <div className="space-y-2">
              <QuickAction icon={<Sparkles className="h-4 w-4" />} label="Studio" desc="Tạo audio mới" onClick={() => onNavigate("studio")} />
              <QuickAction icon={<Mic className="h-4 w-4" />} label="Voice Library" desc="Chọn giọng đọc" onClick={() => onNavigate("voices")} />
              <QuickAction icon={<Clock className="h-4 w-4" />} label="History" desc="Nghe lại và tải file" onClick={() => onNavigate("history")} />
              <QuickAction icon={<Cpu className="h-4 w-4" />} label="Settings" desc="Model, output, phần cứng" onClick={() => onNavigate("settings")} />
            </div>
          </section>

          <section className="studio-panel p-4">
            <h2 className="tvhs-panel-title mb-3">Phân loại audio</h2>
            <div className="space-y-2">
              <TypeRow icon={<Layers className="h-4 w-4" />} label="Preset" count={byType.preset} total={totalAudio} />
              <TypeRow icon={<Mic className="h-4 w-4" />} label="Clone" count={byType.clone} total={totalAudio} />
              <TypeRow icon={<MessageSquare className="h-4 w-4" />} label="Dialogue" count={byType.dialogue} total={totalAudio} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="studio-panel flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tvhs-accent-faint text-tvhs-accent">{icon}</div>
      <div className="min-w-0">
        <div className="font-outfit truncate text-xl font-bold text-tvhs-accent">{value}</div>
        <div className="text-xs text-tvhs-text-secondary">{label}</div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, desc, onClick }: { icon: React.ReactNode; label: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex min-h-14 w-full items-center gap-3 rounded-lg border border-tvhs-border bg-tvhs-main/60 px-3 text-left transition-colors hover:border-tvhs-accent/30 hover:bg-tvhs-elevated">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-tvhs-accent-faint text-tvhs-accent">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-tvhs-text">{label}</span>
        <span className="block truncate text-xs text-tvhs-text-muted">{desc}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-tvhs-text-muted" />
    </button>
  );
}

function TypeRow({ icon, label, count, total }: { icon: React.ReactNode; label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="rounded-lg border border-tvhs-border bg-tvhs-main/60 p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-tvhs-accent">{icon}</span>
        <span className="flex-1 text-sm font-semibold text-tvhs-text">{label}</span>
        <span className="font-mono text-xs text-tvhs-text-secondary">{count}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-tvhs-elevated">
        <div className="h-full rounded-full bg-tvhs-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
