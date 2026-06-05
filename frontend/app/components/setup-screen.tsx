"use client";

import { Loader2, Download, RefreshCw, HardDrive, AlertCircle, ShieldCheck } from "lucide-react";
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
    <main className="tvhs-app-bg flex min-h-[100dvh] w-full items-center justify-center p-6">
      <section className="studio-panel grid w-full max-w-4xl overflow-hidden md:grid-cols-[320px_1fr]">
        <div className="border-b border-tvhs-border bg-tvhs-main/55 p-8 md:border-b-0 md:border-r">
          <div className="mb-8 flex items-center gap-3">
            <img src={LOGO_URL} alt="Thanh Vinh Studio" className="h-12 w-12 rounded-full border border-tvhs-border object-cover" />
            <div>
              <h1 className="font-outfit text-xl font-bold text-tvhs-text">ThanhVinh Studio</h1>
              <p className="text-xs text-tvhs-text-muted">Local voice workstation</p>
            </div>
          </div>

          <div className="space-y-3">
            <SetupStep active done={!backendDown} label="Khởi động ứng dụng" desc="Backend local chạy trong cùng bộ cài." />
            <SetupStep active={!!status && !status.base_model.downloaded} done={!!status?.base_model.downloaded} label="Tải model lần đầu" desc="Model nằm trên máy, không đóng vào installer." />
            <SetupStep active={!!status?.base_model.downloaded} done={!!status?.base_model.loaded} label="Nạp model" desc="Sẵn sàng tạo audio offline." />
          </div>
        </div>

        <div className="p-8">
          <p className="tvhs-caption">First run setup</p>
          <h2 className="font-outfit mt-2 text-2xl font-bold text-tvhs-text">Chuẩn bị model local</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-tvhs-text-secondary">
            Ứng dụng chỉ cần tải model một lần. Sau khi hoàn tất, text và audio được xử lý trên chính máy này.
          </p>

          <div className="mt-6 space-y-3">
            {backendDown && (
              <StatusBox tone="danger" icon={<AlertCircle className="h-5 w-5" />} title="Backend chưa sẵn sàng">
                Không kết nối được backend local. Hãy chờ vài giây rồi thử lại.
              </StatusBox>
            )}

            {status && !status.base_model.downloaded && !isDownloading && (
              <StatusBox tone="warning" icon={<HardDrive className="h-5 w-5" />} title="Cần tải model AI">
                Model khoảng 300MB và sẽ được lưu trong thư mục ứng dụng.
              </StatusBox>
            )}

            {downloadError && (
              <StatusBox tone="danger" icon={<AlertCircle className="h-5 w-5" />} title="Lỗi tải model">
                {downloadError}
              </StatusBox>
            )}

            <StatusBox tone="neutral" icon={<ShieldCheck className="h-5 w-5" />} title="Chạy local">
              Sau khi có model, ứng dụng có thể tạo audio mà không cần gửi dữ liệu ra server bên ngoài.
            </StatusBox>
          </div>

          {isDownloading && baseProgress && (
            <div className="mt-6 rounded-lg border border-tvhs-border bg-tvhs-main/70 p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-tvhs-text-secondary">{baseProgress.message || "Đang tải model..."}</span>
                <span className="font-mono font-semibold text-tvhs-text">{baseProgress.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-tvhs-elevated">
                <div className="h-full rounded-full bg-tvhs-accent transition-all duration-500" style={{ width: `${baseProgress.progress}%` }} />
              </div>
              <p className="mt-3 text-xs text-tvhs-text-muted">Không tắt ứng dụng trong khi tải.</p>
            </div>
          )}

          {reloading && (
            <div className="mt-6 flex items-center gap-2 text-sm text-tvhs-text-secondary">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang nạp model...
            </div>
          )}

          {!isDownloading && !reloading && (
            <button onClick={backendDown ? onRetry : onDownload} className="btn-primary mt-6 min-h-12 w-full text-base">
              {backendDown ? <RefreshCw className="h-5 w-5" /> : <Download className="h-5 w-5" />}
              {backendDown ? "Thử lại" : status?.base_model.downloaded ? "Tải lại và nạp model" : "Tải model và bắt đầu"}
            </button>
          )}

          <p className="mt-6 text-xs text-tvhs-text-muted">VieNeu-TTS-v2 · GGUF Q4 · CPU optimized</p>
        </div>
      </section>
    </main>
  );
}

function SetupStep({ label, desc, active, done }: { label: string; desc: string; active: boolean; done: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${done ? "border-tvhs-accent/30 bg-tvhs-accent-faint" : active ? "border-tvhs-border bg-tvhs-elevated" : "border-tvhs-border bg-transparent"}`}>
      <div className="text-sm font-semibold text-tvhs-text">{label}</div>
      <div className="mt-1 text-xs leading-5 text-tvhs-text-muted">{desc}</div>
    </div>
  );
}

function StatusBox({ tone, icon, title, children }: { tone: "neutral" | "warning" | "danger"; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  const style = {
    neutral: "border-tvhs-border bg-tvhs-main/60 text-tvhs-text-secondary",
    warning: "border-amber-500/25 bg-amber-500/10 text-amber-200",
    danger: "border-red-500/25 bg-red-500/10 text-red-200",
  }[tone];
  return (
    <div className={`flex gap-3 rounded-lg border p-4 ${style}`}>
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <div className="text-sm font-semibold text-tvhs-text">{title}</div>
        <div className="mt-1 text-sm leading-5 opacity-85">{children}</div>
      </div>
    </div>
  );
}
