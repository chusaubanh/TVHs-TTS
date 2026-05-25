"use client";

import { Cpu, Settings as SettingsIcon, Download, Info, RefreshCw } from "lucide-react";
import { useState } from "react";

interface SystemStatus {
  base_model: { downloaded: boolean; loaded: boolean; local_path: string; remote_repo: string };
  current_model?: { type: string };
}

interface HardwareInfo { cpu: string; ram_gb: number; gpu_name?: string | null; vram_gb: number; recommendation: string; reason: string }

interface Props {
  status: SystemStatus | null;
  hardwareInfo: HardwareInfo | null;
  detecting: boolean;
  onDetectHardware: () => void;
  onReloadModel: () => void;
}

const SETTINGS_TABS = [
  { id: "model", label: "Model", icon: Cpu },
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "export", label: "Export", icon: Download },
  { id: "about", label: "About", icon: Info },
];

export function Settings({ status, hardwareInfo, detecting, onDetectHardware, onReloadModel }: Props) {
  const [activeTab, setActiveTab] = useState("model");
  const currentModel = status?.current_model?.type?.toUpperCase() || "GGUF";

  return (
    <div className="saas-page">
      <h1 className="mb-5 font-outfit text-xl font-bold text-tvhs-text">Settings</h1>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[200px_1fr]">
        <nav className="flex flex-col gap-1">
          {SETTINGS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${activeTab === tab.id ? "bg-tvhs-accent-faint text-tvhs-accent" : "text-tvhs-text-secondary hover:bg-tvhs-elevated hover:text-tvhs-text"}`}
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex flex-col gap-4">
          {activeTab === "model" && (
            <>
              <div className="studio-panel p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-tvhs-text"><Cpu className="h-4 w-4 text-tvhs-accent" /> Model Engine</div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div><div className="text-xs font-semibold text-tvhs-text">Engine hiện tại</div><div className="text-[10px] text-tvhs-text-muted">{currentModel} — tối ưu cho CPU</div></div>
                    <span className="rounded bg-tvhs-accent-faint px-2 py-1 text-[10px] font-bold text-tvhs-accent">{currentModel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div><div className="text-xs font-semibold text-tvhs-text">Hardware Detection</div><div className="text-[10px] text-tvhs-text-muted">Phát hiện GPU và đề xuất engine</div></div>
                    <button onClick={onDetectHardware} disabled={detecting} className="btn-primary !rounded-lg !px-3 !py-1.5 !text-[10px]">
                      {detecting ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Cpu className="h-3 w-3" />} Detect
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div><div className="text-xs font-semibold text-tvhs-text">Base Model</div><div className="text-[10px] text-tvhs-text-muted">VieNeu-TTS-v2 · {status?.base_model.downloaded ? "Đã tải" : "Chưa tải"}</div></div>
                    <button onClick={onReloadModel} className="rounded-lg border border-tvhs-border bg-tvhs-elevated px-3 py-1.5 text-[10px] font-semibold text-tvhs-text-secondary transition hover:bg-tvhs-hover hover:text-tvhs-text">
                      <RefreshCw className="h-3 w-3" /> Tải lại
                    </button>
                  </div>
                </div>
              </div>
              {hardwareInfo && (
                <div className="studio-panel p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-bold text-tvhs-text"><Cpu className="h-4 w-4 text-tvhs-accent" /> Hardware Info</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-tvhs-text-muted">CPU</span><span className="text-tvhs-text">{hardwareInfo.cpu}</span></div>
                    <div className="flex justify-between"><span className="text-tvhs-text-muted">RAM</span><span className="text-tvhs-text">{hardwareInfo.ram_gb} GB</span></div>
                    <div className="flex justify-between"><span className="text-tvhs-text-muted">GPU</span><span className="text-tvhs-text">{hardwareInfo.gpu_name || "Không có"}</span></div>
                    <div className="flex justify-between"><span className="text-tvhs-text-muted">VRAM</span><span className="text-tvhs-text">{hardwareInfo.vram_gb} GB</span></div>
                    <div className="mt-2 rounded-lg bg-tvhs-accent-faint p-2 text-[10px] text-tvhs-accent">{hardwareInfo.recommendation} — {hardwareInfo.reason}</div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "general" && (
            <div className="studio-panel p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-tvhs-text"><SettingsIcon className="h-4 w-4 text-tvhs-accent" /> General Settings</div>
              <div className="space-y-4">
                <div className="flex items-center justify-between"><div><div className="text-xs font-semibold text-tvhs-text">Ngôn ngữ</div><div className="text-[10px] text-tvhs-text-muted">Giao diện tiếng Việt</div></div><span className="rounded bg-tvhs-elevated px-2 py-1 text-[10px] text-tvhs-text-secondary">Vietnamese</span></div>
                <div className="flex items-center justify-between"><div><div className="text-xs font-semibold text-tvhs-text">Theme</div><div className="text-[10px] text-tvhs-text-muted">Gold Dark</div></div><span className="rounded bg-tvhs-elevated px-2 py-1 text-[10px] text-tvhs-text-secondary">Dark</span></div>
              </div>
            </div>
          )}

          {activeTab === "export" && (
            <div className="studio-panel p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-tvhs-text"><Download className="h-4 w-4 text-tvhs-accent" /> Export Settings</div>
              <div className="space-y-4">
                <div className="flex items-center justify-between"><div><div className="text-xs font-semibold text-tvhs-text">Định dạng</div><div className="text-[10px] text-tvhs-text-muted">WAV 24kHz mono 16-bit</div></div><span className="rounded bg-tvhs-elevated px-2 py-1 text-[10px] text-tvhs-text-secondary">WAV</span></div>
                <div className="flex items-center justify-between"><div><div className="text-xs font-semibold text-tvhs-text">Thư mục lưu</div><div className="text-[10px] text-tvhs-text-muted">Tự động lưu vào audio/</div></div><span className="rounded bg-tvhs-elevated px-2 py-1 text-[10px] text-tvhs-text-secondary">Default</span></div>
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div className="studio-panel p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-tvhs-text"><Info className="h-4 w-4 text-tvhs-accent" /> Thông tin</div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between"><span className="text-tvhs-text-muted">Version</span><span className="font-semibold text-tvhs-text">ThanhVinhStudio v2.0</span></div>
                <div className="flex justify-between"><span className="text-tvhs-text-muted">Engine</span><span className="text-tvhs-text">VieNeu-TTS-v2</span></div>
                <div className="flex justify-between"><span className="text-tvhs-text-muted">Backend</span><span className="text-tvhs-text">FastAPI</span></div>
                <div className="flex justify-between"><span className="text-tvhs-text-muted">Frontend</span><span className="text-tvhs-text">Next.js Static Export</span></div>
                <div className="mt-2 rounded-lg bg-tvhs-elevated p-3 text-[10px] text-tvhs-text-muted">© 2026 Thành Vinh Holdings · Powered by VieNeu-TTS</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
