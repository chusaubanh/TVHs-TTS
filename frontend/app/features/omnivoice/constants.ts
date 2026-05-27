import type { NonVerbalTag, VoiceOption, VoicePreset } from "./types";

export const OV_LANGUAGES = [
  { code: "Vietnamese", label: "Tiếng Việt" },
  { code: "English", label: "English" },
  { code: "Chinese", label: "中文" },
  { code: "Japanese", label: "日本語" },
  { code: "Korean", label: "한국어" },
  { code: "French", label: "Français" },
  { code: "German", label: "Deutsch" },
  { code: "Khmer", label: "Campuchia / Khmer" },
  { code: "Indonesian", label: "Indonesia" },
  { code: "Thai", label: "Thái Lan" },
  { code: "Malay", label: "Malay / Malaysia" },
  { code: "Singapore", label: "Singapore / English" },
  { code: "Mexico", label: "Mexico / Spanish" },
  { code: "Bangladesh", label: "Bangladesh / Bengali" },
];

export const VOICE_PRESETS: VoicePreset[] = [
  { name: "Nam sâu lắng", hint: "male, low pitch, middle-aged", accent: "Trầm" },
  { name: "Buồn bã trầm tư", hint: "female, low pitch, middle-aged", accent: "Drama" },
  { name: "Hân hoan ấm áp", hint: "female, high pitch, young adult", accent: "Sáng" },
  { name: "Thì thầm bí ẩn", hint: "female, whisper", accent: "Whisper" },
  { name: "Lão nhân kể chuyện", hint: "male, elderly, low pitch", accent: "Story" },
  { name: "Nữ trẻ tự nhiên", hint: "female, young adult, moderate pitch", accent: "Clean" },
];

export const NON_VERBAL_TAGS: NonVerbalTag[] = [
  { label: "Cười", tag: "[laughter]" },
  { label: "Thở dài", tag: "[sigh]" },
  { label: "Ngạc nhiên", tag: "[surprise-oh]" },
  { label: "Khó chịu", tag: "[dissatisfaction-hnn]" },
  { label: "Đồng ý", tag: "[confirmation-en]" },
];

export const VOICE_GENDERS: VoiceOption[] = [
  { label: "Nữ", value: "female" },
  { label: "Nam", value: "male" },
];

export const VOICE_AGES: VoiceOption[] = [
  { label: "Trẻ em", value: "child" },
  { label: "Thiếu niên", value: "teenager" },
  { label: "Người trẻ", value: "young adult" },
  { label: "Trung niên", value: "middle-aged" },
  { label: "Lớn tuổi", value: "elderly" },
];

export const VOICE_PITCHES: VoiceOption[] = [
  { label: "Rất trầm", value: "very low pitch" },
  { label: "Trầm", value: "low pitch" },
  { label: "Vừa", value: "moderate pitch" },
  { label: "Cao", value: "high pitch" },
  { label: "Rất cao", value: "very high pitch" },
];

export const VOICE_ACCENTS: VoiceOption[] = [
  { label: "Mặc định", value: "" },
  { label: "Mỹ", value: "american accent" },
  { label: "Anh", value: "british accent" },
  { label: "Úc", value: "australian accent" },
  { label: "Canada", value: "canadian accent" },
  { label: "Ấn Độ", value: "indian accent" },
  { label: "Trung Quốc", value: "chinese accent" },
  { label: "Nhật", value: "japanese accent" },
  { label: "Hàn", value: "korean accent" },
];

export const VOICE_STYLES: VoiceOption[] = [
  { label: "Bình thường", value: "" },
  { label: "Thì thầm", value: "whisper" },
];
