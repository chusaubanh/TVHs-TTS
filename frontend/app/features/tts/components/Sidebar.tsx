"use client";

import { useState } from "react";
import {
  Loader2, Sparkles, X, Check, RefreshCw, Volume2, Upload, Plus, Trash2,
  Timer, Zap, Play, Cpu, Mic, FileAudio, MessageSquare,
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
  refFile: File | null;
  refText: string;
  onRefFileChange: (f: File | null) => void;
  onRefTextChange: (t: string) => void;
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

  return (
    <aside className="flex h-full w-[336px] min-w-[336px] max-w-[336px] flex-col overflow-hidden border-r border-tvhs-border bg-tvhs-surface">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-tvhs-border px-4">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-tvhs-accent" />
          <span className="text-sm font-semibold text-tvhs-text">Điều khiển</span>
        </div>
        <button onClick={onRefresh} className="tvhs-icon-button !h-8 !w-8" title="Làm mới">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <SidebarSection title="LoRA Adapter">
          <button
            onClick={() => setShowLoraPanel(!showLoraPanel)}
            className="flex min-h-10 w-full items-center justify-between rounded-lg border border-tvhs-border bg-tvhs-main/55 px-3 text-left transition-colors hover:bg-tvhs-elevated"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-tvhs-text-secondary">
              <Sparkles className="h-4 w-4 text-tvhs-accent" />
              {activeLora || "Chưa bật adapter"}
            </span>
            <span className="rounded bg-tvhs-accent-faint px-2 py-1 text-[10px] font-semibold text-tvhs-accent">
              {currentModel === "pytorch" ? "Sẵn sàng" : "Cần GPU"}
            </span>
          </button>

          {showLoraPanel && (
            <div className="mt-2 space-y-2">
              {currentModel !== "pytorch" && (
                <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-3 text-xs leading-5 text-amber-200">
                  LoRA chỉ chạy với PyTorch. Chuyển sang GPU trước khi bật adapter.
                </div>
              )}
              {loras.length === 0 ? (
                <p className="rounded-lg border border-tvhs-border bg-tvhs-main/55 p-3 text-xs text-tvhs-text-muted">Chưa có LoRA nào.</p>
              ) : (
                loras.map((lora) => (
                  <button
                    key={lora.id}
                    disabled={currentModel !== "pytorch" || loraLoading}
                    className={`flex min-h-11 w-full items-center justify-between rounded-lg border px-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${activeLora === lora.id ? "border-tvhs-accent/40 bg-tvhs-accent-faint" : "border-tvhs-border bg-tvhs-main/55 hover:bg-tvhs-elevated"}`}
                    onClick={() => activeLora === lora.id ? onUnloadLora() : onLoadLora(lora.id, lora.downloaded ?? lora.source === "local")}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-tvhs-text">{lora.name}</span>
                      <span className="block text-[10px] text-tvhs-text-muted">{lora.downloaded || lora.source === "local" ? "Đã tải" : "Chưa tải"}</span>
                    </span>
                    {activeLora === lora.id ? <Check className="h-4 w-4 text-tvhs-accent" /> : loraLoading ? <Loader2 className="h-4 w-4 animate-spin text-tvhs-text-muted" /> : null}
                  </button>
                ))
              )}
              {activeLora && (
                <button onClick={onUnloadLora} disabled={loraLoading} className="flex min-h-9 w-full items-center justify-center gap-2 rounded-lg text-xs font-semibold text-tvhs-danger transition-colors hover:bg-red-500/10">
                  <X className="h-4 w-4" />
                  Gỡ LoRA
                </button>
              )}
            </div>
          )}
        </SidebarSection>

        <SidebarSection title="Model">
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: "gguf", name: "CPU", desc: "GGUF Q4" },
              { id: "pytorch", name: "GPU", desc: "PyTorch" },
              { id: "turbo", name: "Turbo", desc: "Nhanh" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => onSwitchModel(m.id)}
                disabled={switchingModel}
                className={`min-h-[48px] rounded-lg border px-2 text-center transition-colors disabled:opacity-50 ${currentModel === m.id ? "border-tvhs-accent bg-tvhs-accent text-black" : "border-tvhs-border bg-tvhs-elevated text-tvhs-text-secondary hover:bg-tvhs-hover"}`}
              >
                {switchingModel && currentModel !== m.id ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <div className="text-xs font-bold">{m.name}</div>
                    <div className="text-[10px] opacity-70">{m.desc}</div>
                  </>
                )}
              </button>
            ))}
          </div>
          <button onClick={onDetectHardware} disabled={detecting} className="mt-2 flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-tvhs-border text-xs font-semibold text-tvhs-text-muted transition-colors hover:bg-tvhs-elevated hover:text-tvhs-text">
            {detecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {detecting ? "Đang quét..." : "Tự động phát hiện phần cứng"}
          </button>
          {hardwareInfo && <HardwareSummary hardwareInfo={hardwareInfo} currentModel={currentModel} onSwitchModel={onSwitchModel} />}
        </SidebarSection>

        {mode === "preset" && (
          <>
            <SidebarSection title="Phong cách">
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "natural", label: "Tự nhiên" },
                  { id: "storytelling", label: "Kể chuyện" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onEmotionChange(item.id)}
                    className={`min-h-9 rounded-lg border text-xs font-semibold transition-colors ${emotion === item.id ? "border-tvhs-accent bg-tvhs-accent text-black" : "border-tvhs-border bg-tvhs-elevated text-tvhs-text-secondary hover:bg-tvhs-hover"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </SidebarSection>

            <SidebarSection title="Giọng nói">
              {voicesLoading ? (
                <div className="flex min-h-10 items-center justify-center gap-2 text-xs text-tvhs-text-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải...
                </div>
              ) : (
                <select value={selectedVoice} onChange={(e) => onVoiceChange(e.target.value)} className="tts-select min-h-10">
                  {voices.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              )}
            </SidebarSection>

            <SidebarSection title={`Im lặng: ${silenceP}s`}>
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-tvhs-text-muted" />
                <input type="range" min="0" max="1" step="0.05" value={silenceP} onChange={(e) => onSilenceChange(parseFloat(e.target.value))} className="tts-range" />
              </div>
            </SidebarSection>

            <SidebarSection title={`Lịch sử (${audioHistory.length})`}>
              <button onClick={() => setShowHistory(!showHistory)} className="flex min-h-9 w-full items-center justify-between rounded-lg border border-tvhs-border bg-tvhs-main/55 px-3 text-xs text-tvhs-text-secondary transition-colors hover:bg-tvhs-elevated">
                File đã tạo gần đây
                <span>{showHistory ? "Ẩn" : "Mở"}</span>
              </button>
              {showHistory && (
                <div className="mt-2 max-h-44 space-y-1 overflow-y-auto">
                  {audioHistory.length === 0 ? (
                    <p className="rounded-lg border border-tvhs-border bg-tvhs-main/55 p-3 text-center text-xs text-tvhs-text-muted">Chưa có audio nào.</p>
                  ) : (
                    audioHistory.slice(0, 10).map((file) => (
                      <button key={file.filename} onClick={() => onPlayHistory(file.filename)} className="flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-left transition-colors hover:bg-tvhs-elevated">
                        <Play className="h-4 w-4 shrink-0 text-tvhs-accent" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs text-tvhs-text-secondary">{file.filename.replace(".wav", "")}</span>
                          <span className="block text-[10px] text-tvhs-text-muted">{file.size_kb} KB</span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </SidebarSection>
          </>
        )}

        {mode === "clone" && (
          <SidebarSection title="Voice clone">
            <label className="relative flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-tvhs-border bg-tvhs-main/55 p-4 text-center transition-colors hover:bg-tvhs-elevated">
              <input type="file" accept="audio/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={(e) => onRefFileChange(e.target.files?.[0] || null)} />
              <Upload className="h-7 w-7 text-tvhs-accent" />
              <span className="max-w-full truncate text-sm font-medium text-tvhs-text-secondary">{refFile ? refFile.name : "Chọn audio tham chiếu"}</span>
              <span className="text-xs text-tvhs-text-muted">WAV, MP3, FLAC</span>
            </label>
            <div className="mt-3">
              <label className="mb-2 block text-xs font-semibold text-tvhs-text-secondary">Văn bản tham chiếu</label>
              <textarea className="tts-textarea" rows={4} placeholder="Nhập chính xác nội dung trong audio..." value={refText} onChange={(e) => onRefTextChange(e.target.value)} />
            </div>
          </SidebarSection>
        )}

        {mode === "dialogue" && (
          <SidebarSection title={`Đối thoại (${dialogueLines.length} dòng)`}>
            <div className="space-y-2">
              {dialogueLines.map((line, index) => (
                <div key={line.id} className="rounded-lg border border-tvhs-border bg-tvhs-main/55 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-tvhs-text-secondary">Dòng {index + 1}</span>
                    <button onClick={() => onRemoveLine(line.id)} className="tvhs-icon-button !h-7 !w-7" title="Xóa dòng">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <select value={line.voice} onChange={(e) => onUpdateLine(line.id, "voice", e.target.value)} className="tts-select mb-2 min-h-9">
                    {voices.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                  <select value={line.emotion} onChange={(e) => onUpdateLine(line.id, "emotion", e.target.value)} className="tts-select mb-2 min-h-9">
                    <option value="natural">Tự nhiên</option>
                    <option value="storytelling">Kể chuyện</option>
                  </select>
                  <textarea value={line.text} onChange={(e) => onUpdateLine(line.id, "text", e.target.value)} placeholder="Nhập nội dung..." className="tts-textarea mb-2" rows={2} />
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-tvhs-text-muted" />
                    <input type="range" min="0" max="3" step="0.1" value={line.pauseAfter} onChange={(e) => onUpdateLine(line.id, "pauseAfter", parseFloat(e.target.value))} className="tts-range flex-1" />
                    <span className="w-9 text-right font-mono text-xs text-tvhs-text-secondary">{line.pauseAfter}s</span>
                  </div>
                </div>
              ))}
              <button onClick={onAddLine} className="flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-tvhs-border text-xs font-semibold text-tvhs-text-secondary transition-colors hover:bg-tvhs-elevated hover:text-tvhs-text">
                <Plus className="h-4 w-4" />
                Thêm dòng
              </button>
            </div>
          </SidebarSection>
        )}
      </div>

      <div className="flex h-11 shrink-0 items-center justify-between border-t border-tvhs-border px-4 text-xs text-tvhs-text-muted">
        <span className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-tvhs-success" />
          Sẵn sàng
        </span>
        <span>{mode === "preset" ? <Mic className="h-4 w-4" /> : mode === "clone" ? <FileAudio className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}</span>
      </div>
    </aside>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-3 rounded-lg border border-tvhs-border bg-tvhs-surface p-3">
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-tvhs-text-muted">{title}</h3>
      {children}
    </section>
  );
}

function HardwareSummary({ hardwareInfo, currentModel, onSwitchModel }: { hardwareInfo: HardwareInfo; currentModel: string; onSwitchModel: (t: string) => void }) {
  return (
    <div className="mt-2 rounded-lg border border-tvhs-border bg-tvhs-main/55 p-3">
      <InfoRow label="CPU" value={hardwareInfo.cpu} />
      <InfoRow label="RAM" value={`${hardwareInfo.ram_gb} GB`} />
      <InfoRow label="GPU" value={hardwareInfo.gpu_name || "Không có"} />
      {hardwareInfo.vram_gb > 0 && <InfoRow label="VRAM" value={`${hardwareInfo.vram_gb} GB`} />}
      <div className="mt-2 border-t border-tvhs-border pt-2">
        <p className="text-xs font-semibold text-tvhs-success">
          Khuyến nghị: {hardwareInfo.recommendation === "pytorch" ? "GPU" : hardwareInfo.recommendation === "gguf" ? "CPU" : "Turbo"}
        </p>
        <p className="mt-1 text-[11px] leading-4 text-tvhs-text-muted">{hardwareInfo.reason}</p>
        {hardwareInfo.recommendation !== currentModel && (
          <button onClick={() => onSwitchModel(hardwareInfo.recommendation)} className="mt-2 min-h-8 w-full rounded-lg bg-tvhs-success px-3 text-xs font-semibold text-white">
            Chuyển model
          </button>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 text-xs">
      <span className="text-tvhs-text-muted">{label}</span>
      <span className="min-w-0 truncate text-right font-medium text-tvhs-text-secondary">{value}</span>
    </div>
  );
}
