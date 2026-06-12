"use client";

import { useRef } from "react";
import { Radio, Zap, Loader2, Upload, Mic, Layers, Volume2 } from "lucide-react";
import { GRADIENT_GOLD } from "../../../lib/constants";
import { OV_LANGUAGES } from "../constants";
import { Player } from "../../../components/player";
import { NonVerbalTagsPanel } from "./NonVerbalTagsPanel";
import { SavedVoicesSidebar } from "./SavedVoicesSidebar";
import { VoiceDesignPanel } from "./VoiceDesignPanel";
import type { SavedVoice } from "../types";

interface OmniVoicePanelProps {
  ovLoaded: boolean;
  ovLoading: boolean;
  ovDownloaded: boolean;
  ovDownloading: boolean;
  ovDownloadProgress: number;
  ovDownloadMsg: string;
  ovText: string;
  ovGenerating: boolean;
  ovAudioUrl: string | null;
  ovMode: "tts" | "clone";
  ovRefFile: File | null;
  ovLanguage: string;
  ovSpeed: number;
  ovSelectedVoice: string;
  ovSaveName: string;
  ovSavedVoices: SavedVoice[];
  ovIsPlaying: boolean;
  ovVoiceGender: string;
  ovVoiceAge: string;
  ovVoicePitch: string;
  ovVoiceAccent: string;
  ovVoiceStyle: string;
  ovInstruct: string;
  setOvText: (v: string) => void;
  setOvMode: (v: "tts" | "clone") => void;
  setOvRefFile: (f: File | null) => void;
  setOvLanguage: (v: string) => void;
  setOvSpeed: (v: number) => void;
  setOvSelectedVoice: (v: string) => void;
  setOvSaveName: (v: string) => void;
  setOvVoiceGender: (v: string) => void;
  setOvVoiceAge: (v: string) => void;
  setOvVoicePitch: (v: string) => void;
  setOvVoiceAccent: (v: string) => void;
  setOvVoiceStyle: (v: string) => void;
  handleOvDownload: () => void;
  handleOvLoad: () => void;
  handleOvUnload: () => void;
  handleOvGenerate: () => void;
  handleOvDeleteVoice: (name: string) => void;
  handleOvPlayPause: () => void;
  handleOvDownloadAudio: () => void;
}

export function OmniVoicePanel(props: OmniVoicePanelProps) {
  const {
    ovLoaded, ovLoading, ovDownloaded, ovDownloading,
    ovDownloadProgress, ovDownloadMsg, ovText, ovGenerating,
    ovAudioUrl, ovMode, ovRefFile, ovLanguage, ovSpeed,
    ovSelectedVoice, ovSaveName, ovSavedVoices, ovIsPlaying,
    ovVoiceGender, ovVoiceAge, ovVoicePitch, ovVoiceAccent, ovVoiceStyle, ovInstruct,
    setOvText, setOvMode, setOvRefFile, setOvLanguage, setOvSpeed,
    setOvSelectedVoice, setOvSaveName,
    setOvVoiceGender, setOvVoiceAge, setOvVoicePitch, setOvVoiceAccent, setOvVoiceStyle,
    handleOvDownload, handleOvLoad, handleOvUnload, handleOvGenerate,
    handleOvDeleteVoice, handleOvPlayPause, handleOvDownloadAudio,
  } = props;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const insertAtCursor = (value: string) => {
    const field = textareaRef.current;
    if (!field) {
      setOvText(`${ovText}${value}`);
      return;
    }
    const start = field.selectionStart;
    const end = field.selectionEnd;
    setOvText(`${ovText.slice(0, start)}${value}${ovText.slice(end)}`);
    requestAnimationFrame(() => {
      field.focus();
      field.selectionStart = field.selectionEnd = start + value.length;
    });
  };

  // Not loaded yet — show setup
  if (!ovLoaded) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-tvhs-text">Design Your Custom Voice</h1>
            <p className="text-sm text-tvhs-text-muted">Tạo giọng nói AI cá nhân hóa với OmniVoice</p>
          </div>
          <div className="flex items-center gap-2">
            {ovLoaded ? (
              <span className="flex items-center gap-1.5 rounded-full bg-tvhs-success/15 px-3 py-1 text-xs font-semibold text-tvhs-success">
                <Zap className="h-3 w-3" /> Đã tải
              </span>
            ) : (
              <span className="rounded-full bg-tvhs-elevated px-3 py-1 text-xs font-medium text-tvhs-text-muted">Chưa tải</span>
            )}
          </div>
        </div>

        {!ovDownloaded && !ovDownloading && (
          <div className="rounded-xl p-4" style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
            <p className="text-sm font-medium" style={{ color: "#f59e0b" }}>Chưa có model OmniVoice</p>
            <p className="mt-1 text-xs text-tvhs-text-muted">Cần tải model (~1.5GB) trước khi sử dụng. Hoặc chạy install.bat để tự động tải.</p>
          </div>
        )}

        {ovDownloading && (
          <div className="rounded-xl p-4" style={{ background: "var(--color-tvhs-surface)", border: "1px solid var(--color-tvhs-border)" }}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-tvhs-text">Đang tải model OmniVoice...</span>
              <span className="text-xs font-mono text-tvhs-text-muted">{ovDownloadProgress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--color-tvhs-elevated)" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${ovDownloadProgress}%`, background: GRADIENT_GOLD }} />
            </div>
            <p className="mt-2 text-[10px] text-tvhs-text-muted">{ovDownloadMsg}</p>
          </div>
        )}

        <div className="flex gap-2">
          {!ovDownloaded ? (
            <button onClick={handleOvDownload} disabled={ovDownloading} className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-50" style={{ background: GRADIENT_GOLD, color: "#000" }}>
              {ovDownloading ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang tải...</> : <><Radio className="h-4 w-4" /> Tải model OmniVoice</>}
            </button>
          ) : (
            <button onClick={handleOvLoad} disabled={ovLoading} className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-50" style={{ background: GRADIENT_GOLD, color: "#000" }}>
              {ovLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang khởi động...</> : <><Zap className="h-4 w-4" /> Khởi động OmniVoice</>}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Loaded — show Studio-like layout
  return (
    <div className="flex h-full overflow-hidden">
      {/* ═══ Left Sidebar ═══ */}
      <aside className="flex w-72 shrink-0 flex-col gap-3 overflow-y-auto border-r border-tvhs-border bg-tvhs-surface p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-tvhs-text">Voice Studio</h2>
          <button onClick={handleOvUnload} className="rounded-md px-2 py-1 text-[10px] font-medium text-tvhs-text-muted transition-colors hover:bg-tvhs-elevated hover:text-tvhs-text">
            Gỡ model
          </button>
        </div>

        <SavedVoicesSidebar
          voices={ovSavedVoices}
          selectedVoice={ovSelectedVoice}
          onSelectVoice={setOvSelectedVoice}
          onDeleteVoice={handleOvDeleteVoice}
        />

        {/* Language */}
        <div className="rounded-lg p-2.5" style={{ background: "var(--color-tvhs-surface)", border: "1px solid var(--color-tvhs-border)" }}>
          <h3 className="mb-2 text-[9px] font-medium uppercase tracking-wider text-tvhs-text-muted">Ngôn ngữ</h3>
          <select value={ovLanguage} onChange={(e) => setOvLanguage(e.target.value)} className="tts-select">
            {OV_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        </div>

        {/* Speed */}
        <div className="rounded-lg p-2.5" style={{ background: "var(--color-tvhs-surface)", border: "1px solid var(--color-tvhs-border)" }}>
          <div className="mb-1.5 flex items-center gap-1.5">
            <Volume2 className="h-3 w-3 text-tvhs-text-muted" />
            <span className="text-[9px] font-medium uppercase tracking-wider text-tvhs-text-muted">Tốc độ: {ovSpeed.toFixed(1)}x</span>
          </div>
          <input type="range" min="0.5" max="2.0" step="0.1" value={ovSpeed} onChange={(e) => setOvSpeed(parseFloat(e.target.value))} className="tts-range" />
        </div>

        {ovMode === "tts" && (
          <>
            <VoiceDesignPanel
              gender={ovVoiceGender}
              age={ovVoiceAge}
              pitch={ovVoicePitch}
              accent={ovVoiceAccent}
              style={ovVoiceStyle}
              instruct={ovInstruct}
              onGenderChange={setOvVoiceGender}
              onAgeChange={setOvVoiceAge}
              onPitchChange={setOvVoicePitch}
              onAccentChange={setOvVoiceAccent}
              onStyleChange={setOvVoiceStyle}
            />

            <NonVerbalTagsPanel onInsertTag={insertAtCursor} />
          </>
        )}

        {/* Status */}
        <div className="mt-auto pt-3" style={{ borderTop: "1px solid var(--color-tvhs-border)" }}>
          <div className="flex items-center gap-1">
            <Zap className="h-2.5 w-2.5 text-tvhs-success" />
            <span className="text-[10px] text-tvhs-text-muted">OmniVoice sẵn sàng</span>
          </div>
        </div>
      </aside>

      {/* ═══ Main Content ═══ */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mode Tabs */}
        <div className="flex items-center gap-1 border-b border-tvhs-border bg-tvhs-surface px-5 py-2">
          {([
            { id: "tts" as const, icon: Layers, label: "TTS" },
            { id: "clone" as const, icon: Mic, label: "Voice Clone" },
          ]).map((tab) => (
            <button key={tab.id} onClick={() => setOvMode(tab.id)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all" style={{ background: ovMode === tab.id ? GRADIENT_GOLD : "transparent", color: ovMode === tab.id ? "#000" : "var(--color-tvhs-text-secondary)", boxShadow: ovMode === tab.id ? "0 2px 12px rgba(197, 160, 89, 0.2)" : "none" }}>
              <tab.icon className="h-3.5 w-3.5" /> {tab.label}
            </button>
          ))}
          {ovSelectedVoice && (
            <div className="flex-1" />
          )}
          {ovSelectedVoice && (
            <span className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium" style={{ background: "rgba(197, 160, 89, 0.15)", color: "#c5a059" }}>
              <Mic className="h-2.5 w-2.5" /> {ovSelectedVoice}
            </span>
          )}
        </div>

        {/* Content Area */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5" style={{ background: "var(--color-tvhs-main)" }}>
          {ovMode === "tts" && (
            <>
              {/* Textarea */}
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-tvhs-text">Nhập văn bản</h2>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-tvhs-text-muted">
                    {ovSelectedVoice ? `Voice: ${ovSelectedVoice}` : "Default Voice"}
                  </span>
                </div>
                <textarea
                  ref={textareaRef}
                  className="tts-textarea flex-1 min-h-[140px]"
                  placeholder={ovSelectedVoice ? `Nhập văn bản để đọc bằng voice "${ovSelectedVoice}"...` : "Nhập văn bản cần đọc..."}
                  value={ovText}
                  onChange={(e) => setOvText(e.target.value)}
                />
              </div>
            </>
          )}

          {ovMode === "clone" && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-tvhs-text">Tạo giọng mới</h2>
                <span className="text-[10px] font-medium uppercase tracking-wide text-tvhs-text-muted">VOICE CLONE</span>
              </div>

              {/* Reference audio upload */}
              <div className="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl p-6 text-center transition-colors" style={{ border: "2px dashed var(--color-tvhs-border)", background: "var(--color-tvhs-elevated)" }}>
                <input type="file" accept="audio/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={(e) => setOvRefFile(e.target.files?.[0] || null)} />
                <Upload className="h-8 w-8 text-tvhs-text-muted" />
                <span className="text-sm font-medium text-tvhs-text-secondary">{ovRefFile ? ovRefFile.name : "Tải lên audio tham chiếu"}</span>
                <span className="text-[10px] text-tvhs-text-muted">WAV, MP3 (3-10s) — Nói rõ ràng, ít tạp âm</span>
              </div>

              {/* Save voice name */}
              <div className="rounded-lg p-3" style={{ background: "var(--color-tvhs-surface)", border: "1px solid var(--color-tvhs-border)" }}>
                <label className="mb-1.5 block text-[9px] font-medium uppercase tracking-wider text-tvhs-text-muted">Tên voice (tùy chọn — lưu để dùng lại)</label>
                <input
                  type="text"
                  placeholder="VD: Giọng chị Lan, Voice MC..."
                  value={ovSaveName}
                  onChange={(e) => setOvSaveName(e.target.value)}
                  className="w-full rounded-md border border-tvhs-border bg-tvhs-elevated px-3 py-2 text-sm text-tvhs-text outline-none transition-colors focus:border-tvhs-accent"
                />
                <p className="mt-1.5 text-[10px] text-tvhs-text-muted">Đặt tên để lưu voice này. Sau khi tạo, voice sẽ tự động xuất hiện ở sidebar trái.</p>
              </div>

              {/* Text to read */}
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-tvhs-text-muted">Văn bản cần đọc</label>
                <textarea
                  className="tts-textarea"
                  rows={4}
                  placeholder="Nhập văn bản mà voice clone sẽ đọc..."
                  value={ovText}
                  onChange={(e) => setOvText(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {/* Player */}
        <Player
          audioUrl={ovAudioUrl}
          isPlaying={ovIsPlaying}
          loading={ovGenerating}
          onPlayPause={handleOvPlayPause}
          onRestart={() => {}}
          onDownload={handleOvDownloadAudio}
          onGenerate={handleOvGenerate}
        />
      </div>
    </div>
  );
}
