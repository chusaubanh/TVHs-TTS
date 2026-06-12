"use client";

import { useEffect, useRef } from "react";
import { Zap, Loader2, Upload, Mic, Layers } from "lucide-react";
import { GRADIENT_GOLD } from "../../../lib/constants";
import { Player } from "../../../components/player";
import { useV3 } from "../hooks/useV3";

export function V3Panel() {
  const {
    v3Loaded,
    v3Loading,
    v3Text,
    v3Generating,
    v3AudioUrl,
    v3PresetVoices,
    v3SelectedVoice,
    v3RefFile,
    v3Mode,
    v3IsPlaying,
    setV3Text,
    setV3SelectedVoice,
    setV3RefFile,
    setV3Mode,
    checkV3Status,
    handleV3Load,
    handleV3Unload,
    handleV3Generate,
    handleV3PlayPause,
    handleV3DownloadAudio,
  } = useV3();

  useEffect(() => {
    checkV3Status();
  }, [checkV3Status]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!v3Loaded) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-tvhs-text">v3 Turbo (Preview)</h1>
            <p className="text-sm text-tvhs-text-muted">Trải nghiệm engine VieNeu-TTS v3 mới nhất</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-tvhs-elevated px-3 py-1 text-xs font-medium text-tvhs-text-muted">Chưa tải</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={handleV3Load} disabled={v3Loading} className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-50" style={{ background: GRADIENT_GOLD, color: "#000" }}>
            {v3Loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang khởi động...</> : <><Zap className="h-4 w-4" /> Khởi động v3 Turbo</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="flex w-72 shrink-0 flex-col gap-3 overflow-y-auto border-r border-tvhs-border bg-tvhs-surface p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-tvhs-text">v3 Studio</h2>
          <button onClick={handleV3Unload} className="rounded-md px-2 py-1 text-[10px] font-medium text-tvhs-text-muted transition-colors hover:bg-tvhs-elevated hover:text-tvhs-text">
            Gỡ model
          </button>
        </div>

        {v3Mode === "tts" && (
          <div className="rounded-lg p-2.5" style={{ background: "var(--color-tvhs-surface)", border: "1px solid var(--color-tvhs-border)" }}>
            <h3 className="mb-2 text-[9px] font-medium uppercase tracking-wider text-tvhs-text-muted">Giọng đọc</h3>
            <select value={v3SelectedVoice} onChange={(e) => setV3SelectedVoice(e.target.value)} className="tts-select">
              <option value="">-- Mặc định --</option>
              {v3PresetVoices.map((v) => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-auto pt-3" style={{ borderTop: "1px solid var(--color-tvhs-border)" }}>
          <div className="flex items-center gap-1">
            <Zap className="h-2.5 w-2.5 text-tvhs-success" />
            <span className="text-[10px] text-tvhs-text-muted">v3 Turbo sẵn sàng</span>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-1 border-b border-tvhs-border bg-tvhs-surface px-5 py-2">
          {([
            { id: "tts" as const, icon: Layers, label: "TTS" },
            { id: "clone" as const, icon: Mic, label: "Voice Clone" },
          ]).map((tab) => (
            <button key={tab.id} onClick={() => setV3Mode(tab.id)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all" style={{ background: v3Mode === tab.id ? GRADIENT_GOLD : "transparent", color: v3Mode === tab.id ? "#000" : "var(--color-tvhs-text-secondary)", boxShadow: v3Mode === tab.id ? "0 2px 12px rgba(197, 160, 89, 0.2)" : "none" }}>
              <tab.icon className="h-3.5 w-3.5" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5" style={{ background: "var(--color-tvhs-main)" }}>
          {v3Mode === "tts" && (
            <div className="flex flex-1 flex-col gap-2">
              <h2 className="text-sm font-semibold text-tvhs-text">Nhập văn bản</h2>
              <textarea
                ref={textareaRef}
                className="tts-textarea flex-1 min-h-[140px]"
                placeholder="Nhập văn bản cần đọc..."
                value={v3Text}
                onChange={(e) => setV3Text(e.target.value)}
              />
            </div>
          )}

          {v3Mode === "clone" && (
            <>
              <h2 className="text-sm font-semibold text-tvhs-text">Tạo giọng mới</h2>
              <div className="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl p-6 text-center transition-colors" style={{ border: "2px dashed var(--color-tvhs-border)", background: "var(--color-tvhs-elevated)" }}>
                <input type="file" accept="audio/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={(e) => setV3RefFile(e.target.files?.[0] || null)} />
                <Upload className="h-8 w-8 text-tvhs-text-muted" />
                <span className="text-sm font-medium text-tvhs-text-secondary">{v3RefFile ? v3RefFile.name : "Tải lên audio tham chiếu"}</span>
                <span className="text-[10px] text-tvhs-text-muted">WAV, MP3 (3-10s) — Nói rõ ràng, ít tạp âm</span>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-tvhs-text-muted">Văn bản cần đọc</label>
                <textarea
                  className="tts-textarea"
                  rows={4}
                  placeholder="Nhập văn bản mà voice clone sẽ đọc..."
                  value={v3Text}
                  onChange={(e) => setV3Text(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <Player
          audioUrl={v3AudioUrl}
          isPlaying={v3IsPlaying}
          loading={v3Generating}
          onPlayPause={handleV3PlayPause}
          onRestart={() => {}}
          onDownload={handleV3DownloadAudio}
          onGenerate={handleV3Generate}
        />
      </div>
    </div>
  );
}
