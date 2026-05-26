"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { Layers, Mic, MessageSquare, Sparkles, LayoutDashboard, Clock, Settings, Star, BookOpen, Search, Bell, ChevronLeft, Radio } from "lucide-react";
import { showToast, ToastContainer } from "../components/toast";
import { SetupScreen } from "../components/setup-screen";
import { Sidebar } from "../components/sidebar";
import { Player } from "../components/player";
import { Dashboard } from "../components/dashboard";
import { VoiceLibrary } from "../components/voice-library";
import { History } from "../components/history";
import { Settings as SettingsPage } from "../components/settings";
import { OmniVoicePanel } from "../components/omnivoice-panel";
import { useSystemStatus, useVoices, useModelSwitch, useHardware, useLora, useAudioHistory, useDialogue, useOmniVoice, useTtsGeneration } from "../hooks";
import { LOGO_URL } from "../lib/constants";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, breadcrumb: "/ Tổng quan", href: null },
  { id: "studio", label: "Studio", icon: Sparkles, breadcrumb: "/ Tạo giọng nói", href: null },
  { id: "omnivoice", label: "OmniVoice", icon: Radio, breadcrumb: "/ OmniVoice TTS", href: null },
  { id: "voices", label: "Voice Library", icon: Mic, breadcrumb: "/ Quản lý giọng", href: null },
  { id: "history", label: "History", icon: Clock, breadcrumb: "/ Lịch sử audio", href: null },
  { id: "features", label: "Tính năng", icon: Star, breadcrumb: "/ Features", href: "/features" },
  { id: "guide", label: "Hướng dẫn", icon: BookOpen, breadcrumb: "/ Guide", href: "/guide" },
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
    return tab && ["dashboard", "studio", "omnivoice", "voices", "history", "settings"].includes(tab) ? tab : "dashboard";
  });
  const [pageVisible, setPageVisible] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const navigateTo = useCallback((page: string) => {
    setPageVisible(false);
    setTimeout(() => {
      setActivePage(page);
      setPageVisible(true);
      if (page === "studio") setSidebarOpen(true);
      else setSidebarOpen(false);
      const url = page === "dashboard" ? "/studio" : `/studio?tab=${page}`;
      window.history.replaceState(null, "", url);
    }, 200);
  }, []);

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

  // ─── Loading screen ────────────────────────────────────────
  if (statusHook.statusLoading) {
    return (
      <main className="flex h-screen w-full items-center justify-center bg-tvhs-main">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" />
          <p className="text-sm text-tvhs-text-secondary">Đang kiểm tra trạng thái...</p>
        </div>
      </main>
    );
  }

  // ─── Setup screen (model not downloaded) ───────────────────
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
      <main className="flex h-screen w-full bg-tvhs-main">
        {/* ═══ Icon Nav Sidebar ═══ */}
        <nav className="flex w-16 shrink-0 flex-col items-center border-r border-tvhs-border bg-tvhs-surface py-4 gap-1">
          <a href="/" className="mb-4 flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full ring-1 ring-tvhs-border transition hover:ring-tvhs-accent/50">
            <img src={LOGO_URL} alt="TVHS" className="h-full w-full object-cover" />
          </a>

          {NAV_ITEMS.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`group relative flex h-10 w-11 items-center justify-center rounded-lg transition ${activePage === item.id ? "bg-tvhs-accent-faint text-tvhs-accent" : "text-tvhs-text-muted hover:bg-tvhs-elevated hover:text-tvhs-text-secondary"}`}
              title={item.label}
            >
              <item.icon className="h-5 w-5" />
              <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-md border border-tvhs-border bg-tvhs-elevated px-2.5 py-1 text-xs font-semibold text-tvhs-text opacity-0 shadow-lg transition-opacity group-hover:opacity-100">{item.label}</span>
            </button>
          ))}

          <div className="my-1 h-px w-6 bg-tvhs-border" />

          {NAV_ITEMS.slice(5).map((item) => (
            <a
              key={item.id}
              href={item.href || "#"}
              className={`group relative flex h-10 w-11 items-center justify-center rounded-lg transition no-underline ${activePage === item.id ? "bg-tvhs-accent-faint text-tvhs-accent" : "text-tvhs-text-muted hover:bg-tvhs-elevated hover:text-tvhs-text-secondary"}`}
              title={item.label}
            >
              <item.icon className="h-5 w-5" />
              <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-md border border-tvhs-border bg-tvhs-elevated px-2.5 py-1 text-xs font-semibold text-tvhs-text opacity-0 shadow-lg transition-opacity group-hover:opacity-100">{item.label}</span>
            </a>
          ))}

          <div className="flex-1" />

          <button
            onClick={() => navigateTo("settings")}
            className={`group relative flex h-10 w-11 items-center justify-center rounded-lg transition ${activePage === "settings" ? "bg-tvhs-accent-faint text-tvhs-accent" : "text-tvhs-text-muted hover:bg-tvhs-elevated hover:text-tvhs-text-secondary"}`}
            title="Settings"
          >
            <Settings className="h-5 w-5" />
            <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-md border border-tvhs-border bg-tvhs-elevated px-2.5 py-1 text-xs font-semibold text-tvhs-text opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Settings</span>
          </button>
        </nav>

        {/* ═══ Main Area ═══ */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Topbar */}
          <header className="flex h-12 shrink-0 items-center gap-3 border-b border-tvhs-border bg-tvhs-surface px-5">
            {activePage === "studio" && sidebarOpen && (
              <button onClick={() => setSidebarOpen(false)} className="mr-1 flex h-7 w-7 items-center justify-center rounded-md text-tvhs-text-muted transition hover:bg-tvhs-elevated hover:text-tvhs-text lg:hidden">
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <span className="text-sm font-bold text-tvhs-text">{currentNav.label}</span>
            <span className="text-[11px] text-tvhs-text-muted">{currentNav.breadcrumb}</span>
            <div className="flex-1" />
            <div className="flex items-center gap-1.5 rounded-lg border border-tvhs-border bg-tvhs-elevated px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 text-tvhs-text-muted" />
              <input type="text" placeholder="Tìm kiếm..." className="w-40 bg-transparent text-xs text-tvhs-text outline-none placeholder:text-tvhs-text-muted" />
            </div>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-tvhs-text-muted transition hover:bg-tvhs-elevated hover:text-tvhs-text">
              <Bell className="h-4 w-4" />
            </button>
          </header>

          {/* Content */}
          <div className="relative flex-1 overflow-hidden">
            {/* Studio page with sidebar */}
            {activePage === "studio" && (
              <div className={`absolute inset-0 flex transition-all duration-300 ${pageVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                <div className={`transition-all duration-300 ${sidebarOpen ? "w-80" : "w-0"} overflow-hidden border-r border-tvhs-border bg-tvhs-surface lg:w-80`}>
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
                    streamMode={ttsHook.streamMode}
                    onStreamChange={ttsHook.setStreamMode}
                    onRefresh={() => { statusHook.checkStatus(); voicesHook.fetchVoices(); loraHook.fetchLoras(); }}
                  />
                </div>

                <div className="flex flex-1 flex-col overflow-hidden">
                  {/* Mode Tabs */}
                  <div className="flex items-center gap-1 border-b border-tvhs-border bg-tvhs-surface px-5 py-2">
                    {([
                      { id: "preset" as const, icon: Layers, label: "Giọng có sẵn" },
                      { id: "clone" as const, icon: Mic, label: "Clone" },
                      { id: "dialogue" as const, icon: MessageSquare, label: "Đối thoại" },
                    ]).map((tab) => (
                      <button key={tab.id} onClick={() => ttsHook.setMode(tab.id)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all" style={{ background: ttsHook.mode === tab.id ? "linear-gradient(135deg, #c5a059, #e0c286)" : "transparent", color: ttsHook.mode === tab.id ? "#000" : "var(--color-tvhs-text-secondary)", boxShadow: ttsHook.mode === tab.id ? "0 2px 12px rgba(197, 160, 89, 0.2)" : "none" }}>
                        <tab.icon className="h-3.5 w-3.5" /> {tab.label}
                      </button>
                    ))}
                    <div className="flex-1" />
                    {loraHook.activeLora && (
                      <span className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium" style={{ background: "rgba(167, 139, 250, 0.15)", color: "#a78bfa" }}>
                        <Sparkles className="h-2.5 w-2.5" /> {loraHook.activeLora}
                      </span>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5" style={{ background: "var(--color-tvhs-main)" }}>
                    {ttsHook.mode === "preset" && (
                      <>
                        <div className="flex items-center justify-between">
                          <h2 className="text-sm font-semibold text-tvhs-text">Nhập văn bản</h2>
                          <span className="text-[10px] font-medium uppercase tracking-wide text-tvhs-text-muted">VIETNAMESE</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[9px] font-medium uppercase tracking-wider text-tvhs-text-muted">Chèn dừng:</span>
                          {[250, 500, 1000, 2000].map((ms) => (
                            <button key={ms} onClick={() => ttsHook.insertPause(ms, textareaRef)} className="rounded px-2 py-0.5 font-mono text-[10px]" style={{ background: "var(--color-tvhs-elevated)", color: "var(--color-tvhs-text-secondary)" }}>
                              {ms >= 1000 ? `${ms / 1000}s` : `${ms}ms`}
                            </button>
                          ))}
                        </div>
                        <textarea ref={textareaRef} className="tts-textarea flex-1" placeholder="Nhập văn bản cần đọc..." value={ttsHook.text} onChange={(e) => ttsHook.setText(e.target.value)} />
                      </>
                    )}

                    {ttsHook.mode === "clone" && (
                      <>
                        <div className="flex items-center justify-between">
                          <h2 className="text-sm font-semibold text-tvhs-text">Nhập văn bản</h2>
                          <span className="text-[10px] font-medium uppercase tracking-wide text-tvhs-text-muted">VIETNAMESE</span>
                        </div>
                        <textarea ref={textareaRef} className="tts-textarea flex-1" placeholder="Nhập văn bản cần đọc..." value={ttsHook.text} onChange={(e) => ttsHook.setText(e.target.value)} />
                      </>
                    )}

                    {ttsHook.mode === "dialogue" && (
                      <>
                        <div className="flex items-center justify-between">
                          <h2 className="text-sm font-semibold text-tvhs-text">Kịch bản đối thoại</h2>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-tvhs-text-muted">{dialogueHook.dialogueLines.length} dòng</span>
                            <span className="text-xs text-tvhs-text-muted">~{Math.ceil(dialogueHook.dialogueLines.reduce((s, l) => s + l.pauseAfter, 0) + dialogueHook.dialogueLines.length * 2)}s</span>
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                          {dialogueHook.dialogueLines.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-sm text-tvhs-text-muted">
                              Chưa có dòng nào. Bấm &quot;+ Thêm dòng&quot; ở sidebar để bắt đầu.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {dialogueHook.dialogueLines.map((line, index) => (
                                <div key={line.id}>
                                  <div className="flex items-start gap-3 rounded-xl p-4 transition-colors hover:bg-tvhs-elevated/50" style={{ background: "var(--color-tvhs-surface)", border: "1px solid var(--color-tvhs-border)" }}>
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tvhs-accent-faint text-xs font-bold text-tvhs-accent">{index + 1}</div>
                                    <div className="min-w-0 flex-1">
                                      <div className="mb-1.5 flex items-center gap-2">
                                        <span className="rounded-md bg-tvhs-accent-faint px-2 py-0.5 text-xs font-bold text-tvhs-accent">{line.voice}</span>
                                        <span className="rounded-md bg-tvhs-elevated px-2 py-0.5 text-[10px] font-medium text-tvhs-text-muted">{line.emotion === "natural" ? "Tự nhiên" : line.emotion === "storytelling" ? "Kể chuyện" : line.emotion}</span>
                                        <span className="text-[10px] text-tvhs-text-muted">⏸ {line.pauseAfter}s</span>
                                      </div>
                                      <p className="text-sm leading-relaxed text-tvhs-text">{line.text || <span className="italic text-tvhs-text-muted">(chưa nhập nội dung)</span>}</p>
                                    </div>
                                  </div>
                                  {index < dialogueHook.dialogueLines.length - 1 && (
                                    <div className="flex justify-center py-0.5">
                                      <div className="h-4 w-px bg-tvhs-border" />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
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
                          ttsHook.setText(""); // placeholder
                        }
                      : ttsHook.handleGenerate
                    }
                  />
                </div>
              </div>
            )}

            {/* Other pages */}
            {activePage !== "studio" && (
              <div className={`h-full overflow-y-auto p-6 transition-all duration-300 ${pageVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                {activePage === "dashboard" && <Dashboard audioHistory={historyHook.audioHistory} voices={voicesHook.voices} status={statusHook.status} onNavigate={navigateTo} />}
                {activePage === "voices" && <VoiceLibrary voices={voicesHook.voices} selectedVoice={voicesHook.selectedVoice} onSelect={voicesHook.setSelectedVoice} />}
                {activePage === "history" && <History audioHistory={historyHook.audioHistory} onPlay={historyHook.playHistoryFile} onDelete={historyHook.handleDeleteAudio} />}
                {activePage === "settings" && <SettingsPage status={statusHook.status} hardwareInfo={hardwareHook.hardwareInfo} detecting={hardwareHook.detecting} onDetectHardware={hardwareHook.handleDetectHardware} onReloadModel={() => statusHook.handleReloadModel()} />}
                {activePage === "omnivoice" && <OmniVoicePanel {...ovHook} />}
              </div>
            )}
          </div>
        </div>
      </main>
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
