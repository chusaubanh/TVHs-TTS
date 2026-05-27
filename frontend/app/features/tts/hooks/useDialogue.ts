import { useState } from "react";
import type { DialogueLine, Voice } from "../../../shared/types";

export function useDialogue(voices: Voice[]) {
  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([
    { id: 1, text: "Xin chào bạn!", voice: "Vinh", pauseAfter: 0.5, emotion: "natural" },
    { id: 2, text: "Chào bạn, hôm nay bạn khỏe không?", voice: "Binh", pauseAfter: 0.5, emotion: "natural" },
  ]);

  const addDialogueLine = () => {
    const newId = Math.max(...dialogueLines.map((l) => l.id), 0) + 1;
    setDialogueLines([
      ...dialogueLines,
      { id: newId, text: "", voice: voices[0]?.id || "Vinh", pauseAfter: 0.5, emotion: "natural" },
    ]);
  };

  const removeDialogueLine = (id: number) =>
    setDialogueLines(dialogueLines.filter((l) => l.id !== id));

  const updateDialogueLine = (id: number, field: keyof DialogueLine, value: string | number) =>
    setDialogueLines(dialogueLines.map((l) => (l.id === id ? { ...l, [field]: value } : l)));

  return {
    dialogueLines,
    addDialogueLine,
    removeDialogueLine,
    updateDialogueLine,
  };
}
