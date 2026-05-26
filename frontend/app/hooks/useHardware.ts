import { useState } from "react";
import { api } from "../lib/api";
import type { HardwareInfo } from "../types";

export function useHardware() {
  const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo | null>(null);
  const [detecting, setDetecting] = useState(false);

  const handleDetectHardware = async () => {
    setDetecting(true);
    try {
      const data = await api.detectHardware();
      if (data) setHardwareInfo(data);
    } finally {
      setDetecting(false);
    }
  };

  return { hardwareInfo, detecting, handleDetectHardware };
}
