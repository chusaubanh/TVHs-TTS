import { useState, useCallback } from "react";
import { api } from "../lib/api";
import { showToast } from "../components/toast";
import { API_BASE } from "../lib/constants";

interface SavedVoice {
  name: string;
  language: string;
  created: string;
  audio_file: string;
}

export function useOmniVoice() {
  const [ovLoaded, setOvLoaded] = useState(false);
  const [ovLoading, setOvLoading] = useState(false);
  const [ovDownloaded, setOvDownloaded] = useState(false);
  const [ovDownloading, setOvDownloading] = useState(false);
  const [ovDownloadProgress, setOvDownloadProgress] = useState(0);
  const [ovDownloadMsg, setOvDownloadMsg] = useState("");
  const [ovText, setOvText] = useState("Xin chào, đây là OmniVoice, engine TTS hỗ trợ hơn 600 ngôn ngữ.");
  const [ovGenerating, setOvGenerating] = useState(false);
  const [ovAudioUrl, setOvAudioUrl] = useState<string | null>(null);
  const [ovMode, setOvMode] = useState<"tts" | "clone">("tts");
  const [ovRefFile, setOvRefFile] = useState<File | null>(null);
  const [ovLanguage, setOvLanguage] = useState("vie");
  const [ovSpeed, setOvSpeed] = useState(1.0);
  const [ovSelectedVoice, setOvSelectedVoice] = useState<string>("");
  const [ovSaveName, setOvSaveName] = useState("");
  const [ovSavedVoices, setOvSavedVoices] = useState<SavedVoice[]>([]);
  const [ovIsPlaying, setOvIsPlaying] = useState(false);

  const checkOvDownloadStatus = useCallback(async () => {
    const data = await api.ovDownloadStatus();
    if (data) setOvDownloaded(data.downloaded);
  }, []);

  const fetchOvVoices = useCallback(async () => {
    const data = await api.ovVoices();
    if (data?.voices) setOvSavedVoices(data.voices);
  }, []);

  const pollOvDownload = async () => {
    const poll = async () => {
      const progress = await api.getDownloadProgress();
      if (progress) {
        const ov = progress.omnivoice;
        setOvDownloadProgress(ov?.progress || 0);
        setOvDownloadMsg(ov?.message || "");
        if (ov?.status === "done") {
          setOvDownloaded(true);
          setOvDownloading(false);
          showToast("success", "Tải xong model OmniVoice!");
          return true;
        }
        if (ov?.status === "error") {
          setOvDownloading(false);
          showToast("error", ov?.message || "Lỗi tải model");
          return true;
        }
      }
      return false;
    };
    while (!(await poll())) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  };

  const handleOvDownload = async () => {
    setOvDownloading(true);
    setOvDownloadProgress(0);
    try {
      const data = await api.downloadOmniVoice() as { status?: string } | null;
      if (data?.status === "already_downloaded") {
        setOvDownloaded(true);
        setOvDownloading(false);
        return;
      }
      await pollOvDownload();
    } catch {
      setOvDownloading(false);
      showToast("error", "Không thể kết nối backend.");
    }
  };

  const handleOvLoad = async () => {
    setOvLoading(true);
    try {
      const res = await fetch(`${API_BASE}/v1/omnivoice/load`, { method: "POST" });
      if (res.ok) {
        setOvLoaded(true);
        await fetchOvVoices();
        showToast("success", "OmniVoice đã sẵn sàng!");
      } else {
        const d = await res.json();
        showToast("error", d.detail || "Lỗi tải OmniVoice");
      }
    } catch {
      showToast("error", "Không thể kết nối backend.");
    } finally {
      setOvLoading(false);
    }
  };

  const handleOvUnload = async () => {
    try {
      await api.ovUnload();
      setOvLoaded(false);
      if (ovAudioUrl) {
        URL.revokeObjectURL(ovAudioUrl);
        setOvAudioUrl(null);
      }
      showToast("success", "Đã gỡ OmniVoice");
    } catch {
      showToast("error", "Lỗi gỡ OmniVoice");
    }
  };

  const handleOvGenerate = async () => {
    if (!ovText.trim()) {
      showToast("error", "Vui lòng nhập văn bản");
      return;
    }
    setOvGenerating(true);
    try {
      let response: Response;
      if (ovMode === "clone") {
        if (!ovRefFile) {
          showToast("error", "Vui lòng upload audio tham chiếu");
          setOvGenerating(false);
          return;
        }
        const fd = new FormData();
        fd.append("text", ovText);
        fd.append("reference_audio", ovRefFile);
        fd.append("language", ovLanguage);
        fd.append("speed", String(ovSpeed));
        if (ovSaveName.trim()) fd.append("save_as", ovSaveName.trim());
        response = await fetch(`${API_BASE}/v1/omnivoice/clone`, { method: "POST", body: fd });
      } else {
        // TTS mode - use selected voice if available
        const body: Record<string, unknown> = { text: ovText, language: ovLanguage, speed: ovSpeed };
        if (ovSelectedVoice) body.voice_name = ovSelectedVoice;
        response = await fetch(`${API_BASE}/v1/omnivoice/tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      if (response.ok) {
        const blob = await response.blob();
        if (ovAudioUrl) URL.revokeObjectURL(ovAudioUrl);
        setOvAudioUrl(URL.createObjectURL(blob));
        // Auto-sync voices after successful clone with save
        if (ovMode === "clone" && ovSaveName.trim()) {
          await fetchOvVoices();
          setOvSaveName("");
          showToast("success", `Đã lưu voice "${ovSaveName.trim()}"!`);
        }
      } else {
        const d = await response.json().catch(() => null);
        showToast("error", d?.detail || "Lỗi tạo âm thanh");
      }
    } catch {
      showToast("error", "Không thể kết nối backend.");
    } finally {
      setOvGenerating(false);
    }
  };

  const handleOvDeleteVoice = async (name: string) => {
    try {
      const res = await api.ovDeleteVoice(name);
      if (res.ok) {
        await fetchOvVoices();
        if (ovSelectedVoice === name) setOvSelectedVoice("");
        showToast("success", `Đã xóa voice "${name}"`);
      } else {
        showToast("error", "Lỗi xóa voice");
      }
    } catch {
      showToast("error", "Lỗi kết nối");
    }
  };

  const handleOvPlayPause = () => {
    if (!ovAudioUrl) return;
    setOvIsPlaying(!ovIsPlaying);
  };

  const handleOvDownloadAudio = () => {
    if (!ovAudioUrl) return;
    const a = document.createElement("a");
    a.href = ovAudioUrl;
    a.download = `omnivoice_${new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-")}.wav`;
    a.click();
  };

  return {
    ovLoaded,
    ovLoading,
    ovDownloaded,
    ovDownloading,
    ovDownloadProgress,
    ovDownloadMsg,
    ovText,
    ovGenerating,
    ovAudioUrl,
    ovMode,
    ovRefFile,
    ovLanguage,
    ovSpeed,
    ovSelectedVoice,
    ovSaveName,
    ovSavedVoices,
    ovIsPlaying,
    setOvText,
    setOvMode,
    setOvRefFile,
    setOvLanguage,
    setOvSpeed,
    setOvSelectedVoice,
    setOvSaveName,
    checkOvDownloadStatus,
    fetchOvVoices,
    handleOvDownload,
    handleOvLoad,
    handleOvUnload,
    handleOvGenerate,
    handleOvDeleteVoice,
    handleOvPlayPause,
    handleOvDownloadAudio,
  };
}
