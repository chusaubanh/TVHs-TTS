import { useState, useRef } from "react";
import { showToast } from "../components/toast";
import { API_BASE } from "../lib/constants";
import { pcmToWav } from "../lib/audio";

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
  const [streamMode, setStreamMode] = useState(false);
  const [refText, setRefText] = useState("");
  const [refFile, setRefFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleStreamingPlayback = async (response: Response) => {
    if (!audioContextRef.current)
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    const ctx = audioContextRef.current;
    const reader = response.body?.getReader();
    if (!reader) return;
    const chunks: Float32Array[] = [];
    let totalLength = 0;
    setIsPlaying(true);
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const int16 = new Int16Array(value.buffer, value.byteOffset, value.byteLength / 2);
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32767.0;
        chunks.push(float32);
        totalLength += float32.length;
      }
      const combined = new Float32Array(totalLength);
      let offset = 0;
      for (const c of chunks) {
        combined.set(c, offset);
        offset += c.length;
      }
      const buf = ctx.createBuffer(1, combined.length, 24000);
      buf.getChannelData(0).set(combined);
      const source = ctx.createBufferSource();
      source.buffer = buf;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
      const wavBlob = pcmToWav(combined, 24000);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(URL.createObjectURL(wavBlob));
    } catch {
      setIsPlaying(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      let response: Response;
      if (mode === "clone") {
        if (!refFile || !refText) {
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            voice: selectedVoice,
            stream: streamMode,
            silence_p: silenceP,
            emotion,
          }),
        });
      }
      if (response.ok) {
        if (streamMode && mode !== "clone") {
          await handleStreamingPlayback(response);
        } else {
          const blob = await response.blob();
          if (audioUrl) URL.revokeObjectURL(audioUrl);
          setAudioUrl(URL.createObjectURL(blob));
          setIsPlaying(true);
        }
        fetchAudioHistory();
      } else {
        showToast("error", "Lỗi tạo âm thanh.");
      }
    } catch {
      showToast("error", "Không thể kết nối backend.");
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
    streamMode,
    refText,
    refFile,
    audioUrl,
    isPlaying,
    setText,
    setMode,
    setSilenceP,
    setEmotion,
    setStreamMode,
    setRefText,
    setRefFile,
    setAudioUrl,
    handleGenerate,
    insertPause,
    handlePlayPause,
    handleDownload,
    handleStreamingPlayback,
  };
}
