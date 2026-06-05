"use client";

import { Play, Trash2 } from "lucide-react";
import type { AudioFile } from "../types";
import { formatDate } from "../lib/format";

interface Props {
  audioHistory: AudioFile[];
  onPlay: (filename: string) => void;
  onDelete: (filename: string) => void;
}

function classifyAudio(filename: string): string {
  if (filename.startsWith("clone_")) return "Clone";
  if (filename.startsWith("dialogue_")) return "Dialogue";
  return "Preset";
}

export function History({ audioHistory, onPlay, onDelete }: Props) {
  const sorted = [...audioHistory].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

  return (
    <div className="saas-page mx-auto max-w-7xl">
      <div className="mb-5">
        <p className="tvhs-caption">History</p>
        <h1 className="font-outfit mt-1 text-2xl font-bold text-tvhs-text">Lịch sử audio</h1>
        <p className="mt-1 text-sm text-tvhs-text-secondary">{audioHistory.length} file đã tạo</p>
      </div>

      {sorted.length === 0 ? (
        <div className="studio-panel flex min-h-64 flex-col items-center justify-center text-center">
          <p className="text-sm text-tvhs-text-muted">Chưa có audio nào được tạo.</p>
        </div>
      ) : (
        <div className="studio-panel overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-tvhs-border bg-tvhs-main/40">
                <th className="w-14 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-tvhs-text-muted" />
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-tvhs-text-muted">Tên file</th>
                <th className="w-28 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-tvhs-text-muted">Loại</th>
                <th className="w-28 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-tvhs-text-muted">Kích thước</th>
                <th className="w-48 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-tvhs-text-muted">Thời gian</th>
                <th className="w-14 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((file) => (
                <tr key={file.filename} className="border-b border-tvhs-border/60 transition-colors last:border-b-0 hover:bg-tvhs-hover">
                  <td className="px-4 py-3">
                    <button onClick={() => onPlay(file.filename)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-tvhs-accent-faint text-tvhs-accent transition-colors hover:bg-tvhs-accent hover:text-black" title="Phát">
                      <Play className="h-3.5 w-3.5 fill-current" />
                    </button>
                  </td>
                  <td className="truncate px-4 py-3 text-sm font-medium text-tvhs-text">{file.filename}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-tvhs-accent-faint px-2 py-1 text-[10px] font-semibold text-tvhs-accent">{classifyAudio(file.filename)}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-tvhs-text-secondary">{file.size_kb >= 1024 ? `${(file.size_kb / 1024).toFixed(1)} MB` : `${file.size_kb} KB`}</td>
                  <td className="px-4 py-3 text-xs text-tvhs-text-muted">{formatDate(file.created)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => onDelete(file.filename)} className="tvhs-icon-button !h-8 !w-8 hover:!text-red-400" title="Xóa">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
