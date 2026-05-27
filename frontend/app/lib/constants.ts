export {
  API_BASE,
  LOGO_URL,
  POLL_INTERVAL_MS,
  SAMPLE_RATE,
  TOAST_DURATION_MS,
  WAVEFORM_BAR_COUNT,
} from "../shared/constants/app";

export {
  NON_VERBAL_TAGS,
  OV_LANGUAGES,
  VOICE_ACCENTS,
  VOICE_AGES,
  VOICE_GENDERS,
  VOICE_PITCHES,
  VOICE_PRESETS,
  VOICE_STYLES,
} from "../features/omnivoice/constants";

export const GRADIENT_GOLD = "linear-gradient(135deg, #c5a059, #e0c286)";

export const MODEL_ENGINES = [
  { id: "gguf", name: "CPU", desc: "GGUF Q4" },
  { id: "pytorch", name: "GPU", desc: "PyTorch" },
  { id: "turbo", name: "Turbo", desc: "0.1B" },
];
