import { useState, useCallback } from "react";
import { api } from "../../../lib/api";
import { showToast } from "../../../components/toast";
import { API_BASE } from "../../../shared/constants/app";
import type { AudioFile } from "../../../shared/types";

export function useAudioHistory() {
  const [audioHistory, setAudioHistory] = useState<AudioFile[]>([]);

  const fetchAudioHistory = useCallback(async () => {
    const data = await api.fetchAudioHistory();
    if (data) setAudioHistory(data.files || []);
  }, []);

  const playHistoryFile = (filename: string) => {
    return `${API_BASE}/v1/audio/file/${filename}`;
  };

  const handleDeleteAudio = async (filename: string) => {
    try {
      const res = await api.deleteAudio(filename);
      if (res?.ok) {
        showToast("success", "Đã xóa file");
        await fetchAudioHistory();
      } else {
        showToast("error", "Lỗi xóa file");
      }
    } catch {
      showToast("error", "Không thể kết nối backend.");
    }
  };

  return { audioHistory, fetchAudioHistory, playHistoryFile, handleDeleteAudio };
}
