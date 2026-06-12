import { useState, useCallback } from "react";
import { API_BASE } from "../../../shared/constants/app";
import { showToast } from "../../../components/toast";

interface V3PresetVoice {
  label: string;
  id: string;
}

export function useV3() {
  const [v3Loaded, setV3Loaded] = useState(false);
  const [v3Loading, setV3Loading] = useState(false);
  const [v3Text, setV3Text] = useState("VieNeu-TTS v3 Turbo là phiên bản mới nhất, cho phép tạo giọng nói với tần số 48kHz và hỗ trợ cảm xúc [cười].");
  const [v3Generating, setV3Generating] = useState(false);
  const [v3AudioUrl, setV3AudioUrl] = useState<string | null>(null);
  const [v3PresetVoices, setV3PresetVoices] = useState<V3PresetVoice[]>([]);
  const [v3SelectedVoice, setV3SelectedVoice] = useState("");
  const [v3RefFile, setV3RefFile] = useState<File | null>(null);
  const [v3Mode, setV3Mode] = useState<"tts" | "clone">("tts");
  const [v3IsPlaying, setV3IsPlaying] = useState(false);

  const checkV3Status = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v3/status`);
      const data = await res.json();
      setV3Loaded(data.loaded);
      if (data.loaded) {
        fetchV3Voices();
      }
    } catch (error) {
      console.error("Failed to check v3 status", error);
    }
  }, []);

  const fetchV3Voices = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v3/voices`);
      const data = await res.json();
      setV3PresetVoices(data.voices || []);
    } catch (error) {
      console.error("Failed to fetch v3 voices", error);
    }
  };

  const handleV3Load = async () => {
    setV3Loading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v3/load`, { method: "POST" });
      const data = await res.json();
      if (data.status === "ok" || data.status === "already_loaded") {
        setV3Loaded(true);
        fetchV3Voices();
        showToast("success", "Đã tải mô hình v3 Turbo!");
      } else {
        showToast("error", "Lỗi tải mô hình: " + (data.message || "Unknown error"));
      }
    } catch {
      showToast("error", "Không thể kết nối đến server.");
    } finally {
      setV3Loading(false);
    }
  };

  const handleV3Unload = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v3/unload`, { method: "POST" });
      if (res.ok) {
        setV3Loaded(false);
        setV3PresetVoices([]);
        if (v3AudioUrl) {
          URL.revokeObjectURL(v3AudioUrl);
          setV3AudioUrl(null);
        }
        showToast("success", "Đã giải phóng mô hình v3 Turbo.");
      }
    } catch {
      showToast("error", "Không thể giải phóng mô hình.");
    }
  };

  const handleV3Generate = async () => {
    if (!v3Text.trim()) {
      showToast("error", "Vui lòng nhập văn bản!");
      return;
    }
    
    setV3Generating(true);
    
    try {
      let response: Response;
      const formData = new FormData();
      formData.append("text", v3Text);

      if (v3Mode === "clone") {
        if (!v3RefFile) {
          showToast("error", "Vui lòng chọn file âm thanh mẫu!");
          setV3Generating(false);
          return;
        }
        formData.append("reference_audio", v3RefFile);
        response = await fetch(`${API_BASE}/api/v3/clone`, {
          method: "POST",
          body: formData,
        });
      } else {
        if (v3SelectedVoice) {
          formData.append("voice", v3SelectedVoice);
        }
        response = await fetch(`${API_BASE}/api/v3/generate`, {
          method: "POST",
          body: formData,
        });
      }

      if (response.ok) {
        const blob = await response.blob();
        if (v3AudioUrl) URL.revokeObjectURL(v3AudioUrl);
        setV3AudioUrl(URL.createObjectURL(blob));
        showToast("success", "Tạo giọng nói thành công!");
      } else {
        const err = await response.json().catch(() => null);
        showToast("error", err?.detail || "Lỗi tạo giọng nói");
      }
    } catch {
      showToast("error", "Lỗi kết nối");
    } finally {
      setV3Generating(false);
    }
  };

  const handleV3PlayPause = () => {
    if (!v3AudioUrl) return;
    setV3IsPlaying(!v3IsPlaying);
  };

  const handleV3DownloadAudio = () => {
    if (!v3AudioUrl) return;
    const a = document.createElement("a");
    a.href = v3AudioUrl;
    a.download = `v3turbo_${new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-")}.wav`;
    a.click();
  };

  return {
    v3Loaded,
    v3Loading,
    v3Text,
    v3Generating,
    v3AudioUrl,
    v3PresetVoices,
    v3SelectedVoice,
    v3RefFile,
    v3Mode,
    v3IsPlaying,
    setV3Text,
    setV3SelectedVoice,
    setV3RefFile,
    setV3Mode,
    checkV3Status,
    handleV3Load,
    handleV3Unload,
    handleV3Generate,
    handleV3PlayPause,
    handleV3DownloadAudio,
  };
}
