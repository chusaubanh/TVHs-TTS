"use client";

import { useState } from "react";
import {
  Loader2, Sparkles, X, Check, RefreshCw, Volume2,
  Upload, Plus, Trash2, Timer, Zap, Play,
} from "lucide-react";
import type { Voice, LoRAAdapter, HardwareInfo, AudioFile, DialogueLine } from "../../../shared/types";

interface Props {
  mode: "preset" | "clone" | "dialogue";
  currentModel: string;
  switchingModel: boolean;
  onSwitchModel: (t: string) => void;

  emotion: string;
  onEmotionChange: (e: string) => void;

  voices: Voice[];
  voicesLoading: boolean;
  selectedVoice: string;
  onVoiceChange: (v: string) => void;

  silenceP: number;
  onSilenceChange: (v: number) => void;

  audioHistory: AudioFile[];
  onPlayHistory: (f: string) => void;

  loras: LoRAAdapter[];
  activeLora: string | null;
  loraLoading: boolean;
  onLoadLora: (id: string, downloaded: boolean) => void;
  onUnloadLora: () => void;

  hardwareInfo: HardwareInfo | null;
  detecting: boolean;
  onDetectHardware: () => void;

  // Clone
  refFile: File | null;
  refText: string;
  onRefFileChange: (f: File | null) => void;
  onRefTextChange: (t: string) => void;

  // Dialogue
  dialogueLines: DialogueLine[];
  onAddLine: () => void;
  onRemoveLine: (id: number) => void;
  onUpdateLine: (id: number, field: keyof DialogueLine, value: string | number) => void;

  onRefresh: () => void;
}

export function Sidebar(props: Props) {
  const {
    mode, currentModel, switchingModel, onSwitchModel,
    emotion, onEmotionChange,
    voices, voicesLoading, selectedVoice, onVoiceChange,
    silenceP, onSilenceChange,
    audioHistory, onPlayHistory,
    loras, activeLora, loraLoading, onLoadLora, onUnloadLora,
    hardwareInfo, detecting, onDetectHardware,
    refFile, refText, onRefFileChange, onRefTextChange,
    dialogueLines, onAddLine, onRemoveLine, onUpdateLine,
    onRefresh,
  } = props;

  const [showHistory, setShowHistory] = useState(false);
  const [showLoraPanel, setShowLoraPanel] = useState(false);

  const getVoiceEmoji = (name: string) => {
    if (name.includes("nam")) return "👨";
    if (name.includes("nữ") || name.includes("nu")) return "👩";
    return "🎙️";
  };

  return (
    <aside className="flex h-full w-[340px] min-w-[340px] max-w-[340px] flex-col gap-4 overflow-hidden p-4" style={{ background: "var(--color-tvhs-surface)", borderRight: "1px solid var(--color-tvhs-border)", borderBottom: "1px solid var(--color-tvhs-border)" }}>
      {/* LoRA Section */}
      <div className="rounded-xl p-3 transition-opacity" style={{ background: "var(--color-tvhs-surface)", border: "1px solid var(--color-tvhs-border)", opacity: currentModel !== "pytorch" ? 0.5 : 1 }}>
        <button onClick={() => setShowLoraPanel(!showLoraPanel)} className="flex w-full items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: "#a78bfa" }} />
            <span className="text-sm font-semibold text-tvhs-text-secondary">LoRA Adapter</span>
          </div>
          <span className="rounded px-1.5 py-0.5 text-[9px] font-medium" style={{ background: currentModel === "pytorch" ? "rgba(167, 139, 250, 0.15)" : "var(--color-tvhs-elevated)", color: currentModel === "pytorch" ? "#a78bfa" : "var(--color-tvhs-text-muted)" }}>
            {currentModel === "pytorch" ? "Sẵn sàng" : "Cần GPU"}
          </span>
        </button>

        {showLoraPanel && (
          <div className="mt-3 space-y-2">
            {currentModel !== "pytorch" && (
              <div className="rounded-lg p-3" style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                <p className="text-[11px] font-medium" style={{ color: "#f59e0b" }}>Cần chuyển sang model PyTorch</p>
                <p className="mt-1 text-[10px] text-tvhs-text-muted">GGUF không hỗ trợ LoRA. Bấm nút GPU ở mục Model để chuyển.</p>
              </div>
            )}
            {loras.map((lora) => (
              <div
                key={lora.id}
                className="flex items-center justify-between rounded-lg p-2.5 transition-all"
                style={{ background: activeLora === lora.id ? "rgba(167, 139, 250, 0.1)" : "transparent", border: `1px solid ${activeLora === lora.id ? "rgba(167, 139, 250, 0.3)" : "var(--color-tvhs-border)"}`, cursor: currentModel !== "pytorch" ? "not-allowed" : "pointer", opacity: currentModel !== "pytorch" ? 0.5 : 1 }}
                onClick={() => {
                  if (currentModel !== "pytorch") return;
                  if (activeLora === lora.id) onUnloadLora();
                  else onLoadLora(lora.id, lora.downloaded ?? lora.source === "local");
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md text-xs" style={{ background: activeLora === lora.id ? "#a78bfa" : "var(--color-tvhs-elevated)", color: activeLora === lora.id ? "#fff" : "var(--color-tvhs-text-muted)" }}>
                    {activeLora === lora.id ? <Check className="h-3 w-3" /> : lora.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-tvhs-text">{lora.name}</p>
                    <p className="text-[10px] text-tvhs-text-muted">{lora.downloaded || lora.source === "local" ? "Đã tải" : "Chưa tải"}</p>
                  </div>
                </div>
                {loraLoading && <Loader2 className="h-3 w-3 animate-spin text-tvhs-text-muted" />}
              </div>
            ))}
            {activeLora && (
              <button onClick={onUnloadLora} disabled={loraLoading} className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs transition-colors" style={{ color: "var(--color-tvhs-danger)" }}>
                <X className="h-3 w-3" />
                Gỡ LoRA
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {/* Model Selector */}
        <div className="rounded-lg p-2.5" style={{ background: "var(--color-tvhs-surface)", border: "1px solid var(--color-tvhs-border)" }}>
          <h3 className="mb-2 text-[9px] font-medium uppercase tracking-wider text-tvhs-text-muted">Model</h3>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: "gguf", name: "CPU", desc: "GGUF Q4" },
              { id: "pytorch", name: "GPU", desc: "PyTorch" },
              { id: "turbo", name: "Turbo", desc: "0.1B" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => onSwitchModel(m.id)}
                disabled={switchingModel}
                className="rounded-md px-2 py-1.5 text-[10px] font-medium transition-all disabled:opacity-50"
                style={{ background: currentModel === m.id ? "linear-gradient(135deg, #c5a059, #e0c286)" : "var(--color-tvhs-elevated)", color: currentModel === m.id ? "#000" : "var(--color-tvhs-text-secondary)", boxShadow: currentModel === m.id ? "0 2px 12px rgba(197, 160, 89, 0.3)" : "none" }}
              >
                {switchingModel && currentModel !== m.id ? (
                  <Loader2 className="mx-auto h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <div className="font-bold">{m.name}</div>
                    <div className="text-[8px] opacity-70">{m.desc}</div>
                  </>
                )}
              </button>
            ))}
          </div>
          <button onClick={onDetectHardware} disabled={detecting} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-[10px] font-medium transition-all" style={{ color: "var(--color-tvhs-text-muted)", border: "1px dashed var(--color-tvhs-border)" }}>
            {detecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            {detecting ? "Đang quét..." : "Tự động phát hiện phần cứng"}
          </button>
          {hardwareInfo && (
            <div className="mt-2 space-y-1 rounded-md p-2" style={{ background: "var(--color-tvhs-elevated)", border: "1px solid var(--color-tvhs-border)" }}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-tvhs-text-muted">CPU</span>
                <span className="max-w-[150px] truncate text-[9px] font-medium text-tvhs-text-secondary">{hardwareInfo.cpu}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-tvhs-text-muted">RAM</span>
                <span className="text-[9px] font-medium text-tvhs-text-secondary">{hardwareInfo.ram_gb} GB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-tvhs-text-muted">GPU</span>
                <span className="text-[9px] font-medium text-tvhs-text-secondary">{hardwareInfo.gpu_name || "Không có"}</span>
              </div>
              {hardwareInfo.vram_gb > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-tvhs-text-muted">VRAM</span>
                  <span className="text-[9px] font-medium text-tvhs-text-secondary">{hardwareInfo.vram_gb} GB</span>
                </div>
              )}
              <div className="mt-1 pt-1" style={{ borderTop: "1px solid var(--color-tvhs-border)" }}>
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-tvhs-success" />
                  <span className="text-[9px] font-semibold text-tvhs-success">
                    Khuyến nghị: {hardwareInfo.recommendation === "pytorch" ? "GPU (PyTorch)" : hardwareInfo.recommendation === "gguf" ? "CPU (GGUF)" : "Turbo"}
                  </span>
                </div>
                <p className="mt-0.5 text-[8px] text-tvhs-text-muted">{hardwareInfo.reason}</p>
                {hardwareInfo.recommendation !== currentModel && (
                  <button onClick={() => onSwitchModel(hardwareInfo.recommendation)} className="mt-1.5 w-full rounded-md py-1.5 text-[10px] font-medium transition-all" style={{ background: "var(--color-tvhs-success)", color: "#fff" }}>
                    Chuyển sang {hardwareInfo.recommendation === "pytorch" ? "GPU" : hardwareInfo.recommendation === "gguf" ? "CPU" : "Turbo"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Preset Mode */}
        {mode === "preset" && (
          <>
            <div className="rounded-lg p-2.5" style={{ background: "var(--color-tvhs-surface)", border: "1px solid var(--color-tvhs-border)" }}>
              <h3 className="mb-2 text-[9px] font-medium uppercase tracking-wider text-tvhs-text-muted">Phong cách</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {["natural", "storytelling"].map((e) => (
                  <button key={e} onClick={() => onEmotionChange(e)} className="rounded-md px-2 py-1.5 text-[11px] font-medium transition-all" style={{ background: emotion === e ? "linear-gradient(135deg, #c5a059, #e0c286)" : "var(--color-tvhs-elevated)", color: emotion === e ? "#000" : "var(--color-tvhs-text-secondary)" }}>
                    {e === "natural" ? "Tự nhiên" : "Kể chuyện"}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg p-2.5" style={{ background: "var(--color-tvhs-surface)", border: "1px solid var(--color-tvhs-border)" }}>
              <h3 className="mb-2 text-[9px] font-medium uppercase tracking-wider text-tvhs-text-muted">Giọng nói</h3>
              {voicesLoading ? (
                <div className="flex items-center justify-center gap-2 p-3 text-tvhs-text-muted">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs">Đang tải...</span>
                </div>
              ) : (
                <select value={selectedVoice} onChange={(e) => onVoiceChange(e.target.value)} className="tts-select">
                  {voices.map((v) => (
                    <option key={v.id} value={v.id}>{getVoiceEmoji(v.name)} {v.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="rounded-lg p-2.5" style={{ background: "var(--color-tvhs-surface)", border: "1px solid var(--color-tvhs-border)" }}>
              <div className="mb-1.5 flex items-center gap-1.5">
                <Volume2 className="h-3 w-3 text-tvhs-text-muted" />
                <span className="text-[9px] font-medium uppercase tracking-wider text-tvhs-text-muted">Im lặng: {silenceP}s</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={silenceP} onChange={(e) => onSilenceChange(parseFloat(e.target.value))} className="tts-range" />
            </div>

            {/* Audio History */}
            <div className="rounded-lg p-2.5" style={{ background: "var(--color-tvhs-surface)", border: "1px solid var(--color-tvhs-border)" }}>
              <button onClick={() => setShowHistory(!showHistory)} className="flex w-full items-center justify-between text-left">
                <h3 className="text-[9px] font-medium uppercase tracking-wider text-tvhs-text-muted">Lịch sử ({audioHistory.length})</h3>
                <span className="text-[9px] text-tvhs-text-muted">{showHistory ? "▲" : "▼"}</span>
              </button>
              {showHistory && (
                <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                  {audioHistory.length === 0 ? (
                    <p className="py-2 text-center text-[10px] text-tvhs-text-muted">Chưa có audio nào</p>
                  ) : (
                    audioHistory.slice(0, 10).map((file) => (
                      <div key={file.filename} onClick={() => onPlayHistory(file.filename)} className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 transition-colors hover:bg-tvhs-hover">
                        <Play className="h-3 w-3 text-tvhs-text-muted" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] text-tvhs-text-secondary">{file.filename.replace(".wav", "")}</p>
                          <p className="text-[8px] text-tvhs-text-muted">{file.size_kb}KB</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Clone Mode */}
        {mode === "clone" && (
          <>
            <h2 className="mt-1 text-xs font-bold uppercase tracking-widest text-tvhs-text-muted">Voice Cloning</h2>
            <div className="flex flex-col gap-4">
              <div className="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl p-6 text-center transition-colors" style={{ border: "2px dashed var(--color-tvhs-border)", background: "var(--color-tvhs-elevated)" }}>
                <input type="file" accept="audio/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={(e) => onRefFileChange(e.target.files?.[0] || null)} />
                <Upload className="h-8 w-8 text-tvhs-text-muted" />
                <span className="text-sm font-medium text-tvhs-text-secondary">{refFile ? refFile.name : "Tải lên audio tham chiếu"}</span>
                <span className="text-[10px] text-tvhs-text-muted">WAV, MP3 (3-10s)</span>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-tvhs-text-secondary">Văn bản tham chiếu</label>
                <textarea className="tts-textarea" rows={3} placeholder="Nhập chính xác nội dung audio trên..." value={refText} onChange={(e) => onRefTextChange(e.target.value)} />
                <p className="text-[10px] text-tvhs-text-muted">Văn bản phải khớp 100% với audio.</p>
              </div>
            </div>
          </>
        )}

        {/* Dialogue Mode */}
        {mode === "dialogue" && (
          <>
            <h2 className="mt-1 text-xs font-bold uppercase tracking-widest text-tvhs-text-muted">Đối thoại ({dialogueLines.length} dòng)</h2>
            <div className="flex flex-col gap-3">
              {dialogueLines.map((line, index) => (
                <div key={line.id} className="space-y-2 rounded-xl p-3" style={{ background: "var(--color-tvhs-surface)", border: "1px solid var(--color-tvhs-border)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-tvhs-text-muted">Dòng {index + 1}</span>
                    <button onClick={() => onRemoveLine(line.id)} className="rounded p-1 text-tvhs-text-muted transition-colors"><Trash2 className="h-3 w-3" /></button>
                  </div>
                  <select value={line.voice} onChange={(e) => onUpdateLine(line.id, "voice", e.target.value)} className="tts-select">
                    {voices.map((v) => (<option key={v.id} value={v.id}>{v.name}</option>))}
                  </select>
                  <select value={line.emotion} onChange={(e) => onUpdateLine(line.id, "emotion", e.target.value)} className="tts-select">
                    <option value="natural">Tự nhiên</option>
                    <option value="storytelling">Kể chuyện</option>
                  </select>
                  <textarea value={line.text} onChange={(e) => onUpdateLine(line.id, "text", e.target.value)} placeholder="Nhập nội dung..." className="tts-textarea" rows={2} />
                  <div className="flex items-center gap-2">
                    <Timer className="h-3 w-3 text-tvhs-text-muted" />
                    <span className="text-[10px] text-tvhs-text-muted">Dừng sau:</span>
                    <input type="range" min="0" max="3" step="0.1" value={line.pauseAfter} onChange={(e) => onUpdateLine(line.id, "pauseAfter", parseFloat(e.target.value))} className="tts-range flex-1" />
                    <span className="w-8 font-mono text-[10px] text-tvhs-text-secondary">{line.pauseAfter}s</span>
                  </div>
                </div>
              ))}
              <button onClick={onAddLine} className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs transition-all" style={{ border: "1px dashed var(--color-tvhs-border)", color: "var(--color-tvhs-text-muted)" }}>
                <Plus className="h-3.5 w-3.5" />
                Thêm dòng
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-auto pt-3" style={{ borderTop: "1px solid var(--color-tvhs-border)" }}>
        <div className="flex items-center justify-between text-[10px] text-tvhs-text-muted">
          <div className="flex items-center gap-1">
            <Zap className="h-2.5 w-2.5 text-tvhs-success" />
            <span>Sẵn sàng</span>
          </div>
          <button onClick={onRefresh} className="text-tvhs-text-muted transition-colors hover:text-tvhs-text"><RefreshCw className="h-3 w-3" /></button>
        </div>
      </div>
    </aside>
  );
}
