import { API_BASE } from "./constants";
import type { SystemStatus, Voice, LoRAAdapter, HardwareInfo, DownloadProgress } from "../types";

async function get<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

async function post<T>(path: string, body?: unknown): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  } catch {
    return null;
  }
}

export const api = {
  // Status
  checkStatus: () => get<SystemStatus>("/v1/status"),
  fetchVoices: () => get<{ data: Voice[] }>("/v1/models"),
  fetchLoras: () => get<{ data: LoRAAdapter[]; active: string | null }>("/v1/lora"),
  fetchAudioHistory: () => get<{ files: Array<{ filename: string; size_kb: number; created: string }>; total: number }>("/v1/audio/history"),
  detectHardware: () => get<HardwareInfo>("/v1/hardware/detect"),

  // Downloads
  downloadBase: () => post("/v1/download/base"),
  downloadLora: (name: string) => post("/v1/download/lora", { name }),
  downloadOmniVoice: () => post("/v1/download/omnivoice"),
  getDownloadProgress: () => get<DownloadProgress>("/v1/download/progress"),

  // Model
  switchModel: (type: string) => post("/v1/models/switch", { type }),
  reloadModel: () => post("/v1/models/reload"),

  // LoRA
  loadLora: (name: string) => post("/v1/lora/load", { name }),
  unloadLora: () => post("/v1/lora/unload"),

  // OmniVoice
  ovDownloadStatus: () => get<{ downloaded: boolean; download: DownloadProgress["omnivoice"] }>("/v1/omnivoice/download-status"),
  ovLoad: () => post("/v1/omnivoice/load"),
  ovUnload: () => post("/v1/omnivoice/unload"),
  ovStatus: () => get<{ loaded: boolean; has_cuda: boolean }>("/v1/omnivoice/status"),
  ovVoices: () => get<{ voices: Array<{ name: string; language: string; created: string; audio_file: string }> }>("/v1/omnivoice/voices"),
  ovDeleteVoice: (name: string) => fetch(`${API_BASE}/v1/omnivoice/voice/${encodeURIComponent(name)}`, { method: "DELETE" }),

  // Delete
  deleteAudio: (filename: string) =>
    fetch(`${API_BASE}/v1/audio/file/${filename}`, { method: "DELETE" }),
};
