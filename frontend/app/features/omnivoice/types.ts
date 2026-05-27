export interface SavedVoice {
  name: string;
  language: string;
  created: string;
  audio_file: string;
}

export interface VoiceOption {
  label: string;
  value: string;
}

export interface VoicePreset {
  name: string;
  hint: string;
  accent: string;
}

export interface NonVerbalTag {
  label: string;
  tag: string;
}
