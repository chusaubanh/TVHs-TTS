export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export const LOGO_URL =
  "https://w.ladicdn.com/s400x400/5c7362c6c417ab07e5196b05/logo-1-20240518015947-i31s7.jpg";

export const GRADIENT_GOLD = "linear-gradient(135deg, #c5a059, #e0c286)";

export const OV_LANGUAGES = [
  { code: "vie", label: "Tiếng Việt" },
  { code: "eng", label: "English" },
  { code: "cmn", label: "中文" },
  { code: "jpn", label: "日本語" },
  { code: "kor", label: "한국어" },
  { code: "fra", label: "Français" },
  { code: "deu", label: "Deutsch" },
];

export const MODEL_ENGINES = [
  { id: "gguf", name: "CPU", desc: "GGUF Q4" },
  { id: "pytorch", name: "GPU", desc: "PyTorch" },
  { id: "turbo", name: "Turbo", desc: "0.1B" },
];

export const SAMPLE_RATE = 24000;
export const POLL_INTERVAL_MS = 1500;
export const WAVEFORM_BAR_COUNT = 44;
export const TOAST_DURATION_MS = 4000;
