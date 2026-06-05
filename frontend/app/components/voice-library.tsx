"use client";

import type { Voice } from "../types";

interface Props {
  voices: Voice[];
  selectedVoice: string;
  onSelect: (id: string) => void;
}

const VOICE_META: Record<string, { initial: string; desc: string; tags: string[] }> = {
  default: { initial: "D", desc: "Giọng mặc định", tags: ["default"] },
  Vinh: { initial: "V", desc: "Giọng nam miền Bắc, trầm ấm", tags: ["nam", "Bắc"] },
  Binh: { initial: "B", desc: "Giọng nam miền Trung, rõ ràng", tags: ["nam", "Trung"] },
  Linh: { initial: "L", desc: "Giọng nữ miền Nam, nhẹ nhàng", tags: ["nữ", "Nam"] },
  Hà: { initial: "H", desc: "Giọng nữ miền Bắc, truyền cảm", tags: ["nữ", "Bắc"] },
  Tuấn: { initial: "T", desc: "Giọng nam miền Nam, mạnh mẽ", tags: ["nam", "Nam"] },
  Minh: { initial: "M", desc: "Giọng nam trung tính", tags: ["nam"] },
};

export function VoiceLibrary({ voices, selectedVoice, onSelect }: Props) {
  return (
    <div className="saas-page mx-auto max-w-7xl">
      <div className="mb-5">
        <p className="tvhs-caption">Voice Library</p>
        <h1 className="font-outfit mt-1 text-2xl font-bold text-tvhs-text">Thư viện giọng nói</h1>
        <p className="mt-1 text-sm text-tvhs-text-secondary">Chọn giọng đọc mặc định cho chế độ preset.</p>
      </div>

      {voices.length === 0 ? (
        <div className="studio-panel flex min-h-64 flex-col items-center justify-center text-center">
          <p className="text-sm text-tvhs-text-muted">Chưa có giọng nào. Hãy tải model trước.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {voices.map((voice) => {
            const meta = VOICE_META[voice.name] || VOICE_META[voice.id] || { initial: voice.name[0]?.toUpperCase() || "?", desc: "Voice", tags: [] };
            const isSelected = voice.id === selectedVoice;
            return (
              <button
                key={voice.id}
                onClick={() => onSelect(voice.id)}
                className={`studio-panel flex min-h-40 flex-col items-start gap-3 p-4 text-left transition-colors ${isSelected ? "border-tvhs-accent ring-1 ring-tvhs-accent/30" : "hover:border-tvhs-accent/30"}`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-tvhs-accent-faint font-outfit text-lg font-extrabold text-tvhs-accent">
                  {meta.initial}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-tvhs-text">{voice.name}</div>
                  <div className="mt-1 text-xs leading-5 text-tvhs-text-muted">{meta.desc}</div>
                </div>
                <div className="mt-auto flex flex-wrap gap-1">
                  {isSelected && <span className="rounded-md bg-tvhs-accent-faint px-2 py-1 text-[10px] font-bold text-tvhs-accent">Đang chọn</span>}
                  {meta.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-tvhs-elevated px-2 py-1 text-[10px] text-tvhs-text-muted">{tag}</span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
