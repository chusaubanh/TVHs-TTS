import type { LoRAAdapter } from "./audio";

export interface DownloadProgress {
  [key: string]: { status: string; progress: number; message: string };
}

export interface SystemStatus {
  base_model: {
    downloaded: boolean;
    loaded: boolean;
    local_path: string;
    remote_repo: string;
  };
  current_model?: { type: string; supports_lora: boolean };
  lora: { active: string | null; available: LoRAAdapter[] };
  download_progress: DownloadProgress;
  outputs_dir: string;
  saved_audio_count: number;
}

export interface HardwareInfo {
  cpu: string;
  ram_gb: number;
  gpu_name?: string | null;
  vram_gb: number;
  recommendation: string;
  reason: string;
}
