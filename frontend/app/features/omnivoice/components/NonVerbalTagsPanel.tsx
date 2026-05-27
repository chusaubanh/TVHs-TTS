import { Sparkles } from "lucide-react";

import { NON_VERBAL_TAGS } from "../constants";

interface NonVerbalTagsPanelProps {
  onInsertTag: (tag: string) => void;
}

export function NonVerbalTagsPanel({ onInsertTag }: NonVerbalTagsPanelProps) {
  return (
    <div className="studio-panel flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2 text-xs font-bold text-tvhs-text uppercase tracking-wide">
        <Sparkles className="h-4 w-4 text-tvhs-accent" />
        Cảm xúc giọng nói (chèn vào văn bản)
      </div>
      <div className="flex flex-wrap gap-2">
        {NON_VERBAL_TAGS.map((item) => (
          <button
            key={item.tag}
            onClick={() => onInsertTag(`${item.tag} `)}
            className="rounded-lg bg-tvhs-elevated px-3 py-1.5 text-left transition hover:-translate-y-[1px] hover:bg-tvhs-hover"
          >
            <span className="text-[10px] font-semibold text-tvhs-accent-light">{item.label}</span>
            <span className="ml-1.5 font-mono text-[9px] text-tvhs-text-muted">{item.tag}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
