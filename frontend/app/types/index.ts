export interface Voice {
  id: string;
  name: string;
}

export interface LoRAAdapter {
  id: string;
  name: string;
  source: string;
  downloaded?: boolean;
}

export interface AudioFile {
  filename: string;
  size_kb: number;
  created: string;
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

export interface DownloadProgress {
  [key: string]: { status: string; progress: number; message: string };
}

export interface HardwareInfo {
  cpu: string;
  ram_gb: number;
  gpu_name?: string | null;
  vram_gb: number;
  recommendation: string;
  reason: string;
}

export interface DialogueLine {
  id: number;
  text: string;
  voice: string;
  pauseAfter: number;
  emotion: string;
}
