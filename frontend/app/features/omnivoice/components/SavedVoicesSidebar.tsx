import { Mic, Trash2 } from "lucide-react";

import type { SavedVoice } from "../types";

interface SavedVoicesSidebarProps {
  voices: SavedVoice[];
  selectedVoice: string;
  onSelectVoice: (name: string) => void;
  onDeleteVoice: (name: string) => void;
}

export function SavedVoicesSidebar({
  voices,
  selectedVoice,
  onSelectVoice,
  onDeleteVoice,
}: SavedVoicesSidebarProps) {
  return (
    <div className="rounded-lg p-2.5" style={{ background: "var(--color-tvhs-surface)", border: "1px solid var(--color-tvhs-border)" }}>
      <h3 className="mb-2 text-[9px] font-medium uppercase tracking-wider text-tvhs-text-muted">Giọng đã lưu ({voices.length})</h3>
      {voices.length === 0 ? (
        <p className="py-2 text-center text-[10px] text-tvhs-text-muted">Chưa có giọng nào. Tạo voice ở tab Clone.</p>
      ) : (
        <div className="space-y-1">
          {voices.map((voice) => (
            <div
              key={voice.name}
              className={`flex cursor-pointer items-center justify-between rounded-md p-2 transition-all ${selectedVoice === voice.name ? "bg-tvhs-accent-faint" : "hover:bg-tvhs-hover"}`}
              onClick={() => onSelectVoice(selectedVoice === voice.name ? "" : voice.name)}
            >
              <div className="flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded-md text-xs ${selectedVoice === voice.name ? "bg-tvhs-accent text-black" : "bg-tvhs-elevated text-tvhs-text-muted"}`}>
                  <Mic className="h-3 w-3" />
                </div>
                <div>
                  <p className="text-xs font-medium text-tvhs-text">{voice.name}</p>
                  <p className="text-[9px] text-tvhs-text-muted">{voice.language}</p>
                </div>
              </div>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onDeleteVoice(voice.name);
                }}
                className="rounded p-1 text-tvhs-text-muted transition-colors hover:text-red-400"
                title="Xóa voice"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
