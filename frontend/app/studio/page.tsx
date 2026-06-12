"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { Layers, Mic, MessageSquare, Sparkles, LayoutDashboard, Clock, Settings, Star, BookOpen, Search, Bell, Radio, FolderOpen, RefreshCw, Activity } from "lucide-react";
import { showToast, ToastContainer } from "../components/toast";
import { SetupScreen } from "../components/setup-screen";
import { Sidebar } from "../components/sidebar";
import { Player } from "../components/player";
import { Dashboard } from "../components/dashboard";
import { VoiceLibrary } from "../components/voice-library";
import { History } from "../components/history";
import { Settings as SettingsPage } from "../components/settings";
import { OmniVoicePanel } from "../components/omnivoice-panel";
import { V3Panel } from "../components/v3-panel";
import { useSystemStatus, useVoices, useModelSwitch, useHardware, useLora, useAudioHistory, useDialogue, useOmniVoice, useTtsGeneration } from "../hooks";
import { LOGO_URL } from "../lib/constants";
import { api } from "../lib/api";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, breadcrumb: "Tổng quan", href: null },
  { id: "studio", label: "Studio", icon: Sparkles, breadcrumb: "Tạo giọng nói", href: null },
  { id: "omnivoice", label: "Custom Voice", icon: Radio, breadcrumb: "Thiết kế giọng riêng", href: null },
  { id: "v3_preview", label: "v3 Turbo", icon: Activity, breadcrumb: "v3 Turbo (Preview)", href: null },
  { id: "voices", label: "Voices", icon: Mic, breadcrumb: "Thư viện giọng", href: null },
  { id: "history", label: "History", icon: Clock, breadcrumb: "Lịch sử audio", href: null },
  { id: "features", label: "Features", icon: Star, breadcrumb: "Tính năng", href: "/features" },
  { id: "guide", label: "Guide", icon: BookOpen, breadcrumb: "Hướng dẫn", href: "/guide" },
];

function HomeContent() {
  const statusHook = useSystemStatus();
  const voicesHook = useVoices();
  const modelHook = useModelSwitch(statusHook.checkStatus, voicesHook.fetchVoices);
  const hardwareHook = useHardware();
  const loraHook = useLora(voicesHook.fetchVoices);
  const historyHook = useAudioHistory();
  const dialogueHook = useDialogue(voicesHook.voices);
  const ovHook = useOmniVoice();
  const ttsHook = useTtsGeneration(voicesHook.selectedVoice, historyHook.fetchAudioHistory);

  const [activePage, setActivePage] = useState(() => {
    const tab = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("tab") : null;
    return tab && ["dashboard", "studio", "omnivoice", "v3_preview", "voices", "history", "settings"].includes(tab) ? tab : "dashboard";
  });
  const [choosingOutput, setChoosingOutput] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const navigateTo = useCallback((page: string) => {
    setActivePage(page);
    const url = page === "dashboard" ? "/studio" : `/studio?tab=${page}`;
    window.history.replaceState(null, "", url);
  }, []);

  const handleChooseOutputFolder = useCallback(async () => {
    setChoosingOutput(true);
    try {
      const result = await api.chooseOutputFolder();
      if (!result) {
        showToast("error", "Không thể mở hộp thoại chọn thư mục.");
        return;
      }
      if (result.status === "cancelled") return;
      if (result.status !== "ok") {
        showToast("error", result.error || "Không thể đổi thư mục lưu.");
        return;
      }
      await statusHook.checkStatus();
      await historyHook.fetchAudioHistory();
      showToast("success", "Đã đổi thư mục lưu audio.");
    } finally {
      setChoosingOutput(false);
    }
  }, [historyHook, statusHook]);

  useEffect(() => {
    (async () => {
      statusHook.setStatusLoading(true);
      const data = await statusHook.checkStatus();
      if (data?.base_model.loaded) {
        await voicesHook.fetchVoices();
        await loraHook.fetchLoras();
        await historyHook.fetchAudioHistory();
      }
      statusHook.setStatusLoading(false);
      ovHook.checkOvDownloadStatus();
    })();
  }, []);

  if (statusHook.statusLoading) {
    return (
      <main className="tvhs-app-bg flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" />
          <p className="text-sm text-tvhs-text-secondary">Đang kiểm tra trạng thái...</p>
        </div>
      </main>
    );
  }

  if (!statusHook.appReady) {
    return (
      <>
        <ToastContainer />
        <SetupScreen
          status={statusHook.status}
          statusLoading={statusHook.statusLoading}
          downloading={statusHook.downloading}
          downloadProgress={statusHook.downloadProgress}
          downloadError={statusHook.downloadError}
          reloading={statusHook.reloading}
          onDownload={() => statusHook.handleDownloadBase(async () => {
            await voicesHook.fetchVoices();
            await loraHook.fetchLoras();
            await historyHook.fetchAudioHistory();
          })}
          onRetry={async () => {
            statusHook.setStatusLoading(true);
            await statusHook.checkStatus();
            statusHook.setStatusLoading(false);
          }}
        />
      </>
    );
  }

  const currentNav = NAV_ITEMS.find((n) => n.id === activePage) || NAV_ITEMS[0];

  return (
    <>
      <ToastContainer />
      <main className="tvhs-app-bg flex h-screen w-full overflow-hidden text-tvhs-text">
        <nav className="tvhs-shell-nav flex shrink-0 flex-col items-center border-r border-tvhs-border bg-tvhs-surface py-3">
          <a href="/" className="mb-4 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-tvhs-border">
            <img src={LOGO_URL} alt="TVHS" className="h-full w-full object-cover" />
          </a>

          <div className="flex flex-col items-center gap-1">
            {NAV_ITEMS.slice(0, 6).map((item) => (
              <button key={item.id} onClick={() => navigateTo(item.id)} className={`group relative tvhs-icon-button ${activePage === item.id ? "tvhs-icon-button-active" : ""}`} title={item.label}>
                <item.icon className="h-5 w-5" />
                <Tooltip label={item.label} />
              </button>
            ))}
          </div>

          <div className="my-3 h-px w-7 bg-tvhs-border" />

          <div className="flex flex-col items-center gap-1">
            {NAV_ITEMS.slice(6).map((item) => (
              <a key={item.id} href={item.href || "#"} className="group relative tvhs-icon-button no-underline" title={item.label}>
                <item.icon className="h-5 w-5" />
                <Tooltip label={item.label} />
              </a>
            ))}
          </div>

          <div className="flex-1" />

          <button onClick={() => navigateTo("settings")} className={`group relative tvhs-icon-button ${activePage === "settings" ? "tvhs-icon-button-active" : ""}`} title="Settings">
            <Settings className="h-5 w-5" />
            <Tooltip label="Settings" />
          </button>
        </nav>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-14 shrink-0 items-center gap-3 border-b border-tvhs-border bg-tvhs-surface px-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-tvhs-text">{currentNav.label}</span>
                <span className="text-xs text-tvhs-text-muted">/ {currentNav.breadcrumb}</span>
              </div>
              <div className="mt-0.5 text-[11px] text-tvhs-text-muted">
                {statusHook.status?.outputs_dir ? `Output: ${statusHook.status.outputs_dir}` : "Output mặc định trong thư mục ứng dụng"}
              </div>
            </div>
            <div className="flex-1" />
            <div className="hidden h-9 items-center gap-2 rounded-lg border border-tvhs-border bg-tvhs-main/65 px-3 md:flex">
              <Search className="h-4 w-4 text-tvhs-text-muted" />
              <input type="text" placeholder="Tìm kiếm..." className="w-44 bg-transparent text-sm text-tvhs-text outline-none placeholder:text-tvhs-text-muted" />
            </div>
            <button
              onClick={handleChooseOutputFolder}
              disabled={choosingOutput}
              className="flex h-9 items-center gap-2 rounded-lg border border-tvhs-border bg-tvhs-main/65 px-3 text-xs font-semibold text-tvhs-text-secondary transition-colors hover:bg-tvhs-elevated hover:text-tvhs-text disabled:cursor-not-allowed disabled:opacity-60"
              title={statusHook.status?.outputs_dir ? `Đang lưu tại: ${statusHook.status.outputs_dir}` : "Chọn thư mục lưu audio"}
            >
              {choosingOutput ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FolderOpen className="h-4 w-4" />}
              <span>Lưu output</span>
            </button>
            <button className="tvhs-icon-button" title="Thông báo">
              <Bell className="h-4 w-4" />
            </button>
          </header>

          <div className="relative min-h-0 flex-1 overflow-hidden">
            {activePage === "studio" && (
              <div className="absolute inset-0 grid grid-cols-[336px_minmax(0,1fr)]">
                <Sidebar
                  mode={ttsHook.mode}
                  currentModel={modelHook.currentModel}
                  switchingModel={modelHook.switchingModel}
                  onSwitchModel={modelHook.handleSwitchModel}
                  emotion={ttsHook.emotion}
                  onEmotionChange={ttsHook.setEmotion}
                  voices={voicesHook.voices}
                  voicesLoading={voicesHook.voicesLoading}
                  selectedVoice={voicesHook.selectedVoice}
                  onVoiceChange={voicesHook.setSelectedVoice}
                  silenceP={ttsHook.silenceP}
                  onSilenceChange={ttsHook.setSilenceP}
                  audioHistory={historyHook.audioHistory}
                  onPlayHistory={historyHook.playHistoryFile}
                  loras={loraHook.loras}
                  activeLora={loraHook.activeLora}
                  loraLoading={loraHook.loraLoading}
                  onLoadLora={loraHook.handleLoadLora}
                  onUnloadLora={loraHook.handleUnloadLora}
                  hardwareInfo={hardwareHook.hardwareInfo}
                  detecting={hardwareHook.detecting}
                  onDetectHardware={hardwareHook.handleDetectHardware}
                  refFile={ttsHook.refFile}
                  refText={ttsHook.refText}
                  onRefFileChange={ttsHook.setRefFile}
                  onRefTextChange={ttsHook.setRefText}
                  dialogueLines={dialogueHook.dialogueLines}
                  onAddLine={dialogueHook.addDialogueLine}
                  onRemoveLine={dialogueHook.removeDialogueLine}
                  onUpdateLine={dialogueHook.updateDialogueLine}
                  onRefresh={() => { statusHook.checkStatus(); voicesHook.fetchVoices(); loraHook.fetchLoras(); }}
                />

                <div className="flex min-w-0 flex-col overflow-hidden">
                  <div className="flex h-12 shrink-0 items-center gap-1 border-b border-tvhs-border bg-tvhs-surface px-5">
                    {([
                      { id: "preset" as const, icon: Layers, label: "Giọng có sẵn" },
                      { id: "clone" as const, icon: Mic, label: "Clone" },
                      { id: "dialogue" as const, icon: MessageSquare, label: "Đối thoại" },
                    ]).map((tab) => (
                      <button key={tab.id} onClick={() => ttsHook.setMode(tab.id)} className={`flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors ${ttsHook.mode === tab.id ? "bg-tvhs-accent text-black" : "text-tvhs-text-secondary hover:bg-tvhs-elevated hover:text-tvhs-text"}`}>
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    ))}
                    <div className="flex-1" />
                    {loraHook.activeLora && (
                      <span className="rounded-lg border border-tvhs-accent/25 bg-tvhs-accent-faint px-2 py-1 text-xs font-semibold text-tvhs-accent">
                        LoRA: {loraHook.activeLora}
                      </span>
                    )}
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto p-5">
                    <section className="studio-panel flex h-full min-h-[420px] flex-col p-5">
                      {ttsHook.mode !== "dialogue" ? (
                        <>
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                              <h2 className="tvhs-panel-title">Nhập văn bản</h2>
                              <p className="text-xs text-tvhs-text-muted">Soạn nội dung tiếng Việt cần tạo giọng.</p>
                            </div>
                            <span className="text-xs font-semibold uppercase text-tvhs-text-muted">Vietnamese</span>
                          </div>
                          {ttsHook.mode === "preset" && (
                            <div className="mb-3 flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-semibold text-tvhs-text-muted">Chèn dừng:</span>
                              {[250, 500, 1000, 2000].map((ms) => (
                                <button key={ms} onClick={() => ttsHook.insertPause(ms, textareaRef)} className="rounded-md border border-tvhs-border bg-tvhs-elevated px-2 py-1 font-mono text-xs text-tvhs-text-secondary transition-colors hover:bg-tvhs-hover">
                                  {ms >= 1000 ? `${ms / 1000}s` : `${ms}ms`}
                                </button>
                              ))}
                            </div>
                          )}
                          <textarea
                            ref={textareaRef}
                            className="tts-textarea min-h-0 flex-1 resize-none !text-base"
                            placeholder="Nhập văn bản cần đọc..."
                            value={ttsHook.text}
                            onChange={(e) => ttsHook.setText(e.target.value)}
                          />
                        </>
                      ) : (
                        <DialoguePreview lines={dialogueHook.dialogueLines} />
                      )}
                    </section>
                  </div>

                  <Player
                    audioUrl={ttsHook.audioUrl}
                    isPlaying={ttsHook.isPlaying}
                    loading={ttsHook.loading}
                    onPlayPause={ttsHook.handlePlayPause}
                    onRestart={() => {}}
                    onDownload={ttsHook.handleDownload}
                    onGenerate={ttsHook.mode === "dialogue"
                      ? async () => {
                          if (dialogueHook.dialogueLines.length === 0) return;
                          ttsHook.setText("");
                        }
                      : ttsHook.handleGenerate
                    }
                  />
                </div>
              </div>
            )}

            {activePage !== "studio" && (
              <div className="h-full overflow-y-auto p-6">
                {activePage === "dashboard" && <Dashboard audioHistory={historyHook.audioHistory} voices={voicesHook.voices} status={statusHook.status} onNavigate={navigateTo} />}
                {activePage === "voices" && <VoiceLibrary voices={voicesHook.voices} selectedVoice={voicesHook.selectedVoice} onSelect={voicesHook.setSelectedVoice} />}
                {activePage === "history" && <History audioHistory={historyHook.audioHistory} onPlay={historyHook.playHistoryFile} onDelete={historyHook.handleDeleteAudio} />}
                {activePage === "settings" && <SettingsPage status={statusHook.status} hardwareInfo={hardwareHook.hardwareInfo} detecting={hardwareHook.detecting} onDetectHardware={hardwareHook.handleDetectHardware} onReloadModel={() => statusHook.handleReloadModel()} onRefreshStatus={statusHook.checkStatus} />}
                {activePage === "omnivoice" && <OmniVoicePanel {...ovHook} />}
                {activePage === "v3_preview" && <V3Panel />}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function Tooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute left-12 z-50 whitespace-nowrap rounded-md border border-tvhs-border bg-tvhs-elevated px-2.5 py-1 text-xs font-semibold text-tvhs-text opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
      {label}
    </span>
  );
}

function DialoguePreview({ lines }: { lines: { id: number; voice: string; emotion: string; pauseAfter: number; text: string }[] }) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="tvhs-panel-title">Kịch bản đối thoại</h2>
          <p className="text-xs text-tvhs-text-muted">Quản lý từng dòng ở sidebar bên trái.</p>
        </div>
        <span className="text-xs text-tvhs-text-muted">{lines.length} dòng</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {lines.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-tvhs-border text-sm text-tvhs-text-muted">
            Chưa có dòng nào. Bấm “Thêm dòng” ở sidebar để bắt đầu.
          </div>
        ) : (
          <div className="space-y-2">
            {lines.map((line, index) => (
              <div key={line.id} className="rounded-lg border border-tvhs-border bg-tvhs-main/60 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-tvhs-accent-faint text-xs font-bold text-tvhs-accent">{index + 1}</span>
                  <span className="rounded-md bg-tvhs-elevated px-2 py-1 text-xs font-semibold text-tvhs-text">{line.voice}</span>
                  <span className="rounded-md bg-tvhs-elevated px-2 py-1 text-xs text-tvhs-text-muted">{line.emotion === "natural" ? "Tự nhiên" : "Kể chuyện"}</span>
                  <span className="text-xs text-tvhs-text-muted">Dừng {line.pauseAfter}s</span>
                </div>
                <p className="text-sm leading-6 text-tvhs-text">{line.text || <span className="italic text-tvhs-text-muted">Chưa nhập nội dung</span>}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
