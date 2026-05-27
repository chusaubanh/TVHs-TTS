import { useState, useCallback } from "react";
import { api, pollDownloadProgress } from "../../../lib/api";
import type { SystemStatus, DownloadProgress } from "../../../shared/types";

export function useSystemStatus() {
  const [appReady, setAppReady] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({});
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [reloading, setReloading] = useState(false);

  const checkStatus = useCallback(async () => {
    const data = await api.checkStatus();
    if (data) {
      setStatus(data);
      setAppReady(data.base_model.loaded);
    }
    return data;
  }, []);

  const handleDownloadBase = async (onReady?: () => Promise<void>) => {
    setDownloading(true);
    setDownloadError(null);
    try {
      const data = await api.downloadBase() as { status?: string } | null;
      if (data?.status === "already_downloaded") {
        await handleReloadModel(onReady);
        return;
      }
      await pollDownloadProgress(setDownloadProgress);
      await handleReloadModel(onReady);
    } catch {
      setDownloadError("Không thể kết nối backend.");
    } finally {
      setDownloading(false);
    }
  };

  const handleReloadModel = async (onReady?: () => Promise<void>) => {
    setReloading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ""}/v1/models/reload`,
        { method: "POST" },
      );
      if (res.ok) {
        setAppReady(true);
        await checkStatus();
        await onReady?.();
      } else {
        const err = await res.json();
        setDownloadError(err.error || "Failed to reload model");
      }
    } catch {
      setDownloadError("Không thể reload model.");
    } finally {
      setReloading(false);
    }
  };

  return {
    appReady,
    statusLoading,
    status,
    downloading,
    downloadProgress,
    downloadError,
    reloading,
    setStatusLoading,
    checkStatus,
    handleDownloadBase,
    handleReloadModel,
  };
}
