"use client";

import { Loader2, Download, RefreshCw, HardDrive, AlertCircle } from "lucide-react";
import type { SystemStatus, DownloadProgress } from "../types";
import { LOGO_URL } from "../lib/constants";

interface Props {
  status: SystemStatus | null;
  statusLoading: boolean;
  downloading: boolean;
  downloadProgress: DownloadProgress;
  downloadError: string | null;
  reloading: boolean;
  onDownload: () => void;
  onRetry: () => void;
}

export function SetupScreen({
  status, downloading, downloadProgress, downloadError, reloading,
  onDownload, onRetry,
}: Props) {
  const baseProgress = downloadProgress.base;
  const isDownloading = downloading || baseProgress?.status === "downloading";
  const backendDown = status === null;

  return (
    <main className="flex h-screen w-full items-center justify-center bg-tvhs-main p-8">
      <div className="glass-card w-full max-w-lg space-y-8 rounded-3xl p-10 text-center">
        <div>
          <div className="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full shadow-xl" style={{ border: "1px solid var(--color-tvhs-border)" }}>
            <img
              src={LOGO_URL}
              alt="Thành Vinh Studio"
              className="h-full w-full object-cover"
            />
          </div>
          <h1 className="font-outfit text-2xl font-bold text-tvhs-text">Thành Vinh Studio</h1>
          <p className="mt-1 text-sm text-tvhs-text-secondary">Tổng hợp giọng nói tiếng Việt • VieNeu-TTS-v2</p>
        </div>

        {backendDown && (
          <div className="flex items-start gap-3 rounded-xl p-4 text-left" style={{ background: "var(--color-tvhs-danger-bg)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-tvhs-danger" />
            <div>
              <p className="text-sm font-medium text-tvhs-danger">Backend chưa chạy</p>
              <p className="mt-1 text-xs text-tvhs-text-secondary">
                Không thể kết nối tới backend. Hãy chờ ứng dụng khởi động hoặc kiểm tra lại.
              </p>
              <p className="mt-2 rounded-lg p-2 font-mono text-xs" style={{ background: "var(--color-tvhs-elevated)" }}>
                Đang khởi động...
              </p>
            </div>
          </div>
        )}

        {status && !status.base_model.downloaded && !isDownloading && (
          <div className="flex items-start gap-3 rounded-xl p-4 text-left" style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
            <HardDrive className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
            <div>
              <p className="text-sm font-medium" style={{ color: "#f59e0b" }}>Cần tải model AI</p>
              <p className="mt-1 text-xs text-tvhs-text-secondary">
                Ứng dụng cần tải model ~300MB về máy để hoạt động offline. Chỉ cần tải 1 lần.
              </p>
            </div>
          </div>
        )}

        {downloadError && (
          <div className="flex items-start gap-3 rounded-xl p-4 text-left" style={{ background: "var(--color-tvhs-danger-bg)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-tvhs-danger" />
            <div>
              <p className="text-sm font-medium text-tvhs-danger">Lỗi</p>
              <p className="mt-1 text-xs text-tvhs-text-secondary">{downloadError}</p>
            </div>
          </div>
        )}

        {isDownloading && baseProgress && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-tvhs-text-secondary">{baseProgress.message || "Đang tải..."}</span>
              <span className="font-medium text-tvhs-text">{baseProgress.progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--color-tvhs-elevated)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${baseProgress.progress}%`, background: "linear-gradient(90deg, #c5a059, #e0c286)" }}
              />
            </div>
            <p className="text-xs text-tvhs-text-muted">Không tắt ứng dụng trong khi tải...</p>
          </div>
        )}

        {reloading && (
          <div className="flex items-center justify-center gap-2 text-sm text-tvhs-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang khởi động model...
          </div>
        )}

        {!isDownloading && !reloading && (
          <div className="space-y-3">
            {backendDown ? (
              <button onClick={onRetry} className="btn-primary w-full px-6 py-4 text-base">
                <RefreshCw className="h-5 w-5" />
                Thử lại
              </button>
            ) : (
              <button onClick={onDownload} className="btn-primary w-full px-6 py-4 text-base">
                <Download className="h-5 w-5" />
                {status?.base_model.downloaded ? "Tải lại & Khởi động" : "Tải model & Bắt đầu"}
              </button>
            )}
          </div>
        )}

        <p className="text-[10px] text-tvhs-text-muted">
          VieNeu-TTS-v2 • GGUF Q4 • CPU Optimized
        </p>
      </div>
    </main>
  );
}
