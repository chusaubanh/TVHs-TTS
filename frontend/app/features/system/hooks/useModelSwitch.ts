import { useState } from "react";
import { api } from "../../../lib/api";
import { showToast } from "../../../components/toast";

export function useModelSwitch(checkStatus: () => Promise<unknown>, fetchVoices: () => Promise<void>) {
  const [currentModel, setCurrentModel] = useState("gguf");
  const [switchingModel, setSwitchingModel] = useState(false);

  const handleSwitchModel = async (modelType: string) => {
    if (modelType === currentModel || switchingModel) return;
    setSwitchingModel(true);
    try {
      const data = await api.switchModel(modelType) as { status?: string; detail?: string } | null;
      if (data?.status === "ok") {
        setCurrentModel(modelType);
        await checkStatus();
        await fetchVoices();
      } else {
        showToast("error", `Lỗi chuyển model: ${data?.detail || "Unknown"}`);
      }
    } catch {
      showToast("error", "Không thể kết nối backend.");
    } finally {
      setSwitchingModel(false);
    }
  };

  return { currentModel, setCurrentModel, switchingModel, handleSwitchModel };
}
