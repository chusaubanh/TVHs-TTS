import { useState, useCallback } from "react";
import { api, pollDownloadProgress } from "../lib/api";
import { showToast } from "../components/toast";
import type { LoRAAdapter } from "../types";

export function useLora(fetchVoices: () => Promise<void>) {
  const [loras, setLoras] = useState<LoRAAdapter[]>([]);
  const [activeLora, setActiveLora] = useState<string | null>(null);
  const [loraLoading, setLoraLoading] = useState(false);

  const fetchLoras = useCallback(async () => {
    const data = await api.fetchLoras();
    if (data) {
      setLoras(data.data || []);
      setActiveLora(data.active || null);
    }
  }, []);

  const handleLoadLora = async (loraId: string, downloaded: boolean) => {
    setLoraLoading(true);
    try {
      if (!downloaded) {
        const dlData = await api.downloadLora(loraId) as { status?: string } | null;
        if (dlData?.status === "started") await pollDownloadProgress();
      }
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ""}/v1/lora/load`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: loraId }),
        },
      );
      if (res.ok) {
        setActiveLora(loraId);
        await fetchVoices();
        await fetchLoras();
      } else {
        const err = await res.json();
        showToast("error", err.error || "Lỗi tải LoRA");
      }
    } catch {
      showToast("error", "Lỗi kết nối backend.");
    } finally {
      setLoraLoading(false);
    }
  };

  const handleUnloadLora = async () => {
    setLoraLoading(true);
    try {
      await api.unloadLora();
      setActiveLora(null);
      await fetchVoices();
    } finally {
      setLoraLoading(false);
    }
  };

  return {
    loras,
    activeLora,
    loraLoading,
    fetchLoras,
    handleLoadLora,
    handleUnloadLora,
  };
}
