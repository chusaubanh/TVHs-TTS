import { SlidersHorizontal } from "lucide-react";

import { VOICE_ACCENTS, VOICE_AGES, VOICE_GENDERS, VOICE_PITCHES, VOICE_PRESETS, VOICE_STYLES } from "../constants";

interface VoiceDesignPanelProps {
  gender: string;
  age: string;
  pitch: string;
  accent: string;
  style: string;
  instruct: string;
  onGenderChange: (value: string) => void;
  onAgeChange: (value: string) => void;
  onPitchChange: (value: string) => void;
  onAccentChange: (value: string) => void;
  onStyleChange: (value: string) => void;
}

export function VoiceDesignPanel({
  gender,
  age,
  pitch,
  accent,
  style,
  instruct,
  onGenderChange,
  onAgeChange,
  onPitchChange,
  onAccentChange,
  onStyleChange,
}: VoiceDesignPanelProps) {
  const applyPreset = (hint: string) => {
    const parts = hint.split(",").map((part) => part.trim());
    const presetGender = VOICE_GENDERS.find((option) => parts.includes(option.value));
    if (presetGender) onGenderChange(presetGender.value);
    const presetAge = VOICE_AGES.find((option) => parts.includes(option.value));
    if (presetAge) onAgeChange(presetAge.value);
    const presetPitch = VOICE_PITCHES.find((option) => parts.includes(option.value));
    onPitchChange(presetPitch?.value || "");
    const presetAccent = VOICE_ACCENTS.find((option) => option.value && parts.includes(option.value));
    onAccentChange(presetAccent?.value || "");
    const presetStyle = VOICE_STYLES.find((option) => option.value && parts.includes(option.value));
    onStyleChange(presetStyle?.value || "");
  };

  return (
    <div className="studio-panel flex flex-col gap-3.5 p-4">
      <div className="flex items-center gap-2 text-xs font-bold text-tvhs-text uppercase tracking-wide">
        <SlidersHorizontal className="h-4 w-4 text-tvhs-accent" />
        Thiết lập giọng nói
      </div>
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold text-tvhs-text-muted uppercase tracking-wider">Giới tính</span>
          <select value={gender} onChange={(event) => onGenderChange(event.target.value)} className="tts-select">
            {VOICE_GENDERS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold text-tvhs-text-muted uppercase tracking-wider">Độ tuổi</span>
          <select value={age} onChange={(event) => onAgeChange(event.target.value)} className="tts-select">
            {VOICE_AGES.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold text-tvhs-text-muted uppercase tracking-wider">Cao độ</span>
          <select value={pitch} onChange={(event) => onPitchChange(event.target.value)} className="tts-select">
            <option value="">Mặc định</option>
            {VOICE_PITCHES.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold text-tvhs-text-muted uppercase tracking-wider">Giọng / Accent</span>
          <select value={accent} onChange={(event) => onAccentChange(event.target.value)} className="tts-select">
            {VOICE_ACCENTS.map((option) => (
              <option key={option.label} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold text-tvhs-text-muted uppercase tracking-wider">Chất giọng</span>
          <select value={style} onChange={(event) => onStyleChange(event.target.value)} className="tts-select">
            {VOICE_STYLES.map((option) => (
              <option key={option.label} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold text-tvhs-text-muted uppercase tracking-wider">Prompt giọng tự động (instruct)</span>
        <input
          type="text"
          value={instruct}
          disabled
          className="w-full rounded-md border border-tvhs-border bg-tvhs-elevated/40 px-3 py-2 text-xs text-tvhs-text-secondary outline-none opacity-80"
          placeholder="female, young adult, moderate pitch"
        />
      </div>

      <div className="mt-1 flex flex-wrap gap-2">
        {VOICE_PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => applyPreset(preset.hint)}
            className="rounded-lg bg-tvhs-elevated px-3 py-1.5 text-[10px] font-medium text-tvhs-text-secondary transition-colors hover:bg-tvhs-hover"
          >
            <span className="font-semibold text-tvhs-accent">{preset.name}</span>
            <span className="ml-1 text-[9px] text-tvhs-text-muted">({preset.accent})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
