import { useState, useCallback } from "react";
import { api } from "../lib/api";
import type { Voice } from "../types";

export function useVoices() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState("default");

  const fetchVoices = useCallback(async () => {
    setVoicesLoading(true);
    try {
      const data = await api.fetchVoices();
      if (data) {
        const list = data.data || [];
        setVoices(list);
        if (list.length > 0 && !list.some((v) => v.id === selectedVoice)) {
          setSelectedVoice(list[0].id);
        }
      }
    } finally {
      setVoicesLoading(false);
    }
  }, [selectedVoice]);

  return {
    voices,
    voicesLoading,
    selectedVoice,
    setSelectedVoice,
    fetchVoices,
  };
}
