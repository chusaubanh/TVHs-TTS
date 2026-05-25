"use client";

import { Play, Trash2 } from "lucide-react";

interface AudioFile { filename: string; size_kb: number; created: string }

interface Props {
  audioHistory: AudioFile[];
  onPlay: (filename: string) => void;
  onDelete: (filename: string) => void;
}

function classifyAudio(filename: string): { type: string; badge: string } {
  if (filename.startsWith("clone_")) return { type: "Clone", badge: "bg-blue-500/10 text-blue-400" };
  if (filename.startsWith("dialogue_")) return { type: "Dialogue", badge: "bg-purple-500/10 text-purple-400" };
  return { type: "Preset", badge: "bg-tvhs-accent-faint text-tvhs-accent" };
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) + " " + d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  } catch { return dateStr; }
}

export function History({ audioHistory, onPlay, onDelete }: Props) {
  const sorted = [...audioHistory].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

  return (
    <div className="saas-page">
      <div className="mb-5">
        <h1 className="font-outfit text-xl font-bold text-tvhs-text">Lịch sử Audio</h1>
        <p className="text-xs text-tvhs-text-secondary">{audioHistory.length} file đã tạo</p>
      </div>

      {sorted.length === 0 ? (
        <div className="studio-panel flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-tvhs-text-muted">Chưa có audio nào được tạo</p>
        </div>
      ) : (
        <div className="studio-panel overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-tvhs-border">
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-tvhs-text-muted"></th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-tvhs-text-muted">Tên file</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-tvhs-text-muted">Loại</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-tvhs-text-muted">Kích thước</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-tvhs-text-muted">Thời gian</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-tvhs-text-muted"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((f) => {
                const { type, badge } = classifyAudio(f.filename);
                return (
                  <tr key={f.filename} className="border-b border-tvhs-border/50 transition hover:bg-tvhs-hover">
                    <td className="px-4 py-2.5">
                      <button onClick={() => onPlay(f.filename)} className="flex h-7 w-7 items-center justify-center rounded-md bg-tvhs-accent-faint text-tvhs-accent transition hover:bg-tvhs-accent hover:text-black">
                        <Play className="h-3 w-3 fill-current" />
                      </button>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-2.5 text-xs font-medium text-tvhs-text">{f.filename}</td>
                    <td className="px-4 py-2.5"><span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${badge}`}>{type}</span></td>
                    <td className="px-4 py-2.5 font-mono text-xs text-tvhs-text-secondary">{f.size_kb >= 1024 ? `${(f.size_kb / 1024).toFixed(1)} MB` : `${f.size_kb} KB`}</td>
                    <td className="px-4 py-2.5 text-xs text-tvhs-text-muted">{formatDate(f.created)}</td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => onDelete(f.filename)} className="rounded p-1.5 text-tvhs-text-muted transition hover:bg-red-500/10 hover:text-red-400" title="Xóa">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
