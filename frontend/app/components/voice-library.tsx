"use client";

interface Voice { id: string; name: string }

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
    <div className="saas-page">
      <div className="mb-5">
        <h1 className="font-outfit text-xl font-bold text-tvhs-text">Voice Library</h1>
        <p className="text-xs text-tvhs-text-secondary">Quản lý tất cả giọng nói có sẵn</p>
      </div>

      {voices.length === 0 ? (
        <div className="studio-panel flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-tvhs-text-muted">Chưa có giọng nào. Hãy tải model trước.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {voices.map((v) => {
            const meta = VOICE_META[v.name] || VOICE_META[v.id] || { initial: v.name[0]?.toUpperCase() || "?", desc: "Voice", tags: [] };
            const isSelected = v.id === selectedVoice;
            return (
              <button
                key={v.id}
                onClick={() => onSelect(v.id)}
                className={`studio-panel flex flex-col items-start gap-2.5 p-4 text-left transition-all hover:-translate-y-0.5 ${isSelected ? "border-tvhs-accent ring-1 ring-tvhs-accent/30" : "hover:border-tvhs-accent/30"}`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tvhs-accent-faint font-outfit text-lg font-extrabold text-tvhs-accent">
                  {meta.initial}
                </div>
                <div>
                  <div className="text-sm font-bold text-tvhs-text">{v.name}</div>
                  <div className="text-[10px] text-tvhs-text-muted">{meta.desc}</div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {isSelected && <span className="rounded bg-tvhs-accent-faint px-1.5 py-0.5 text-[9px] font-bold text-tvhs-accent">Đang chọn</span>}
                  {meta.tags.map((t) => (
                    <span key={t} className="rounded bg-tvhs-elevated px-1.5 py-0.5 text-[9px] text-tvhs-text-muted">{t}</span>
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
