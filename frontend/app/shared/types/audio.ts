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

export interface DialogueLine {
  id: number;
  text: string;
  voice: string;
  pauseAfter: number;
  emotion: string;
}
