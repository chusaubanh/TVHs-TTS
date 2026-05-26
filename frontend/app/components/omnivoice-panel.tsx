"use client";

import { Radio, Zap, Loader2, Upload, Play } from "lucide-react";
import { OV_LANGUAGES, GRADIENT_GOLD } from "../lib/constants";

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
  setOvText: (v: string) => void;
  setOvMode: (v: "tts" | "clone") => void;
  setOvRefFile: (f: File | null) => void;
  setOvLanguage: (v: string) => void;
  setOvSpeed: (v: number) => void;
  handleOvDownload: () => void;
  handleOvLoad: () => void;
  handleOvUnload: () => void;
  handleOvGenerate: () => void;
}

export function OmniVoicePanel(props: OmniVoicePanelProps) {
  const {
    ovLoaded, ovLoading, ovDownloaded, ovDownloading,
    ovDownloadProgress, ovDownloadMsg, ovText, ovGenerating,
    ovAudioUrl, ovMode, ovRefFile, ovLanguage, ovSpeed,
    setOvText, setOvMode, setOvRefFile, setOvLanguage, setOvSpeed,
    handleOvDownload, handleOvLoad, handleOvUnload, handleOvGenerate,
  } = props;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-tvhs-text">OmniVoice TTS</h1>
          <p className="text-sm text-tvhs-text-muted">Engine tổng hợp giọng nói 0.6B, hỗ trợ 600+ ngôn ngữ</p>
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

      {/* Download status */}
      {!ovDownloaded && !ovDownloading && (
        <div className="rounded-xl p-4" style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
          <p className="text-sm font-medium" style={{ color: "#f59e0b" }}>Chưa có model OmniVoice</p>
          <p className="mt-1 text-xs text-tvhs-text-muted">Cần tải model (~1.5GB) trước khi sử dụng. Hoặc chạy install.bat để tự động tải.</p>
        </div>
      )}

      {/* Download progress */}
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

      {/* Load/Download/Unload */}
      {!ovLoaded ? (
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
      ) : (
        <div className="flex gap-2">
          <button onClick={handleOvUnload} className="rounded-lg px-4 py-2 text-xs font-medium transition-colors" style={{ border: "1px solid var(--color-tvhs-border)", color: "var(--color-tvhs-text-muted)" }}>Gỡ model</button>
        </div>
      )}

      {ovLoaded && (
        <>
          {/* Mode tabs */}
          <div className="flex gap-1 rounded-lg p-1" style={{ background: "var(--color-tvhs-surface)", border: "1px solid var(--color-tvhs-border)" }}>
            {([ { id: "tts" as const, label: "TTS" }, { id: "clone" as const, label: "Voice Clone" } ]).map((tab) => (
              <button key={tab.id} onClick={() => setOvMode(tab.id)} className="flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-all" style={{ background: ovMode === tab.id ? GRADIENT_GOLD : "transparent", color: ovMode === tab.id ? "#000" : "var(--color-tvhs-text-secondary)" }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Clone: reference audio upload */}
          {ovMode === "clone" && (
            <div className="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl p-6 text-center transition-colors" style={{ border: "2px dashed var(--color-tvhs-border)", background: "var(--color-tvhs-elevated)" }}>
              <input type="file" accept="audio/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={(e) => setOvRefFile(e.target.files?.[0] || null)} />
              <Upload className="h-6 w-6 text-tvhs-text-muted" />
              <span className="text-sm font-medium text-tvhs-text-secondary">{ovRefFile ? ovRefFile.name : "Tải lên audio tham chiếu"}</span>
              <span className="text-[10px] text-tvhs-text-muted">WAV, MP3 (3-10s)</span>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-tvhs-text-muted">Ngôn ngữ</label>
              <select value={ovLanguage} onChange={(e) => setOvLanguage(e.target.value)} className="tts-select">
                {OV_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-tvhs-text-muted">Tốc độ: {ovSpeed.toFixed(1)}x</label>
              <input type="range" min="0.5" max="2.0" step="0.1" value={ovSpeed} onChange={(e) => setOvSpeed(parseFloat(e.target.value))} className="tts-range" />
            </div>
          </div>

          {/* Text input */}
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-tvhs-text-muted">Văn bản</label>
            <textarea className="tts-textarea" rows={5} placeholder="Nhập văn bản cần đọc..." value={ovText} onChange={(e) => setOvText(e.target.value)} />
          </div>

          {/* Generate button */}
          <button onClick={handleOvGenerate} disabled={ovGenerating || !ovText.trim()} className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-50" style={{ background: GRADIENT_GOLD, color: "#000" }}>
            {ovGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang tạo...</> : <><Play className="h-4 w-4" /> Tạo giọng nói</>}
          </button>

          {/* Audio player */}
          {ovAudioUrl && (
            <div className="rounded-xl p-4" style={{ background: "var(--color-tvhs-surface)", border: "1px solid var(--color-tvhs-border)" }}>
              <audio controls src={ovAudioUrl} className="w-full" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
