import { Sparkles } from "lucide-react";
import { NON_VERBAL_TAGS } from "../constants";

interface NonVerbalTagsPanelProps {
  onInsertTag: (tag: string) => void;
}

export function NonVerbalTagsPanel({ onInsertTag }: NonVerbalTagsPanelProps) {
  return (
    <div className="rounded-lg p-2.5 flex flex-col gap-2.5" style={{ background: "var(--color-tvhs-surface)", border: "1px solid var(--color-tvhs-border)" }}>
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-tvhs-text uppercase tracking-wide">
        <Sparkles className="h-3.5 w-3.5 text-tvhs-accent" />
        Cảm xúc giọng nói
      </div>
      <div className="flex flex-wrap gap-1.5">
        {NON_VERBAL_TAGS.map((item) => (
          <button
            key={item.tag}
            onClick={() => onInsertTag(`${item.tag} `)}
            className="rounded bg-tvhs-elevated px-2 py-1 text-left transition-colors hover:bg-tvhs-hover"
          >
            <span className="text-[9px] font-semibold text-tvhs-accent-light">{item.label}</span>
            <span className="ml-1 font-mono text-[8px] text-tvhs-text-muted">{item.tag}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
