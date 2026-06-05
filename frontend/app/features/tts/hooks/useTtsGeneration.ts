import { useState } from "react";
import { showToast } from "../../../components/toast";
import { API_BASE } from "../../../shared/constants/app";

export function useTtsGeneration(
  selectedVoice: string,
  fetchAudioHistory: () => Promise<void>,
) {
  const [text, setText] = useState(
    "Xin chào, đây là Thành Vinh Studio, ứng dụng tổng hợp giọng nói tiếng Việt tiên tiến nhất.",
  );
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"preset" | "clone" | "dialogue">("preset");
  const [silenceP, setSilenceP] = useState(0.15);
  const [emotion, setEmotion] = useState("natural");
  const [refText, setRefText] = useState("");
  const [refFile, setRefFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const readErrorMessage = async (response: Response) => {
    try {
      const data = await response.json();
      return data?.detail || data?.error || "Lỗi tạo âm thanh.";
    } catch {
      return "Lỗi tạo âm thanh.";
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      showToast("error", "Vui lòng nhập văn bản cần đọc.");
      return;
    }

    setLoading(true);
    try {
      let response: Response;
      if (mode === "clone") {
        if (!refFile || !refText.trim()) {
          showToast("error", "Vui lòng upload file mẫu và nhập văn bản mẫu.");
          setLoading(false);
          return;
        }
        const fd = new FormData();
        fd.append("text", text);
        fd.append("reference_text", refText);
        fd.append("reference_audio", refFile);
        response = await fetch(`${API_BASE}/v1/audio/clone`, { method: "POST", body: fd });
      } else {
        response = await fetch(`${API_BASE}/v1/audio/speech`, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({
            text,
            voice: selectedVoice,
            silence_p: silenceP,
            emotion,
          }),
        });
      }

      if (!response.ok) {
        showToast("error", await readErrorMessage(response));
        return;
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error("Backend trả về audio rỗng.");
      }

      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(URL.createObjectURL(blob));
      setIsPlaying(true);
      fetchAudioHistory();
    } catch (error) {
      showToast("error", error instanceof Error ? error.message : "Không thể kết nối backend.");
    } finally {
      setLoading(false);
    }
  };

  const insertPause = (ms: number, textareaRef: React.RefObject<HTMLTextAreaElement | null>) => {
    const marker = `[pause:${ms}]`;
    const ta = textareaRef.current;
    if (ta) {
      const { selectionStart: s, selectionEnd: e } = ta;
      setText(text.substring(0, s) + marker + text.substring(e));
      setTimeout(() => {
        ta.focus();
        ta.selectionStart = ta.selectionEnd = s + marker.length;
      }, 0);
    } else {
      setText(text + marker);
    }
  };

  const handlePlayPause = () => setIsPlaying(!isPlaying);

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `thanhvinh_${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return {
    text,
    loading,
    mode,
    silenceP,
    emotion,
    refText,
    refFile,
    audioUrl,
    isPlaying,
    setText,
    setMode,
    setSilenceP,
    setEmotion,
    setRefText,
    setRefFile,
    setAudioUrl,
    handleGenerate,
    insertPause,
    handlePlayPause,
    handleDownload,
  };
}
