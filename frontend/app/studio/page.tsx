"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { Layers, Mic, MessageSquare, Sparkles, LayoutDashboard, Clock, Settings, Star, BookOpen, Search, Bell, ChevronLeft, Radio, Upload, Loader2, Play, Square, Zap } from "lucide-react";
import { showToast, ToastContainer } from "../components/toast";
import { SetupScreen } from "../components/setup-screen";
import { Sidebar } from "../components/sidebar";
import { Player } from "../components/player";
import { Dashboard } from "../components/dashboard";
import { VoiceLibrary } from "../components/voice-library";
import { History } from "../components/history";
import { Settings as SettingsPage } from "../components/settings";

interface Voice { id: string; name: string }
interface LoRAAdapter { id: string; name: string; source: string; downloaded?: boolean }
interface SystemStatus {
  base_model: { downloaded: boolean; loaded: boolean; local_path: string; remote_repo: string };
  current_model?: { type: string };
  lora: { active: string | null; available: LoRAAdapter[] };
}
interface DownloadProgress { [key: string]: { status: string; progress: number; message: string } }
interface HardwareInfo { cpu: string; ram_gb: number; gpu_name?: string | null; vram_gb: number; recommendation: string; reason: string }
interface DialogueLine { id: number; text: string; voice: string; pauseAfter: number; emotion: string }

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, breadcrumb: "/ Tổng quan", href: null },
  { id: "studio", label: "Studio", icon: Sparkles, breadcrumb: "/ Tạo giọng nói", href: null },
  { id: "omnivoice", label: "OmniVoice", icon: Radio, breadcrumb: "/ OmniVoice TTS", href: null },
  { id: "voices", label: "Voice Library", icon: Mic, breadcrumb: "/ Quản lý giọng", href: null },
  { id: "history", label: "History", icon: Clock, breadcrumb: "/ Lịch sử audio", href: null },
  { id: "features", label: "Tính năng", icon: Star, breadcrumb: "/ Features", href: "/features" },
  { id: "guide", label: "Hướng dẫn", icon: BookOpen, breadcrumb: "/ Guide", href: "/guide" },
];

const LOGO_URL = "https://w.ladicdn.com/s400x400/5c7362c6c417ab07e5196b05/logo-1-20240518015947-i31s7.jpg";

function HomeContent() {
  const [appReady, setAppReady] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({});
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [reloading, setReloading] = useState(false);

  const [text, setText] = useState("Xin chào, đây là Thành Vinh Studio, ứng dụng tổng hợp giọng nói tiếng Việt tiên tiến nhất.");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"preset" | "clone" | "dialogue">("preset");
  const [selectedVoice, setSelectedVoice] = useState("default");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [silenceP, setSilenceP] = useState(0.15);
  const [emotion, setEmotion] = useState("natural");

  const [currentModel, setCurrentModel] = useState("gguf");
  const [switchingModel, setSwitchingModel] = useState(false);
  const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo | null>(null);
  const [detecting, setDetecting] = useState(false);

  const [audioHistory, setAudioHistory] = useState<Array<{ filename: string; size_kb: number; created: string }>>([]);
  const [loras, setLoras] = useState<LoRAAdapter[]>([]);
  const [activeLora, setActiveLora] = useState<string | null>(null);
  const [loraLoading, setLoraLoading] = useState(false);

  const [refText, setRefText] = useState("");
  const [refFile, setRefFile] = useState<File | null>(null);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [streamMode, setStreamMode] = useState(false);

  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([
    { id: 1, text: "Xin chào bạn!", voice: "Vinh", pauseAfter: 0.5, emotion: "natural" },
    { id: 2, text: "Chào bạn, hôm nay bạn khỏe không?", voice: "Binh", pauseAfter: 0.5, emotion: "natural" },
  ]);

  // OmniVoice state
  const [ovLoaded, setOvLoaded] = useState(false);
  const [ovLoading, setOvLoading] = useState(false);
  const [ovText, setOvText] = useState("Xin chào, đây là OmniVoice, engine TTS hỗ trợ hơn 600 ngôn ngữ.");
  const [ovGenerating, setOvGenerating] = useState(false);
  const [ovAudioUrl, setOvAudioUrl] = useState<string | null>(null);
  const [ovMode, setOvMode] = useState<"tts" | "clone">("tts");
  const [ovRefFile, setOvRefFile] = useState<File | null>(null);
  const [ovLanguage, setOvLanguage] = useState("vie");
  const [ovSpeed, setOvSpeed] = useState(1.0);

  const [activePage, setActivePage] = useState(() => {
    const tab = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("tab") : null;
    return tab && ["dashboard", "studio", "omnivoice", "voices", "history", "settings"].includes(tab) ? tab : "dashboard";
  });
  const [pageVisible, setPageVisible] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // ─── API helpers ────────────────────────────────────────────

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/status`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        setAppReady(data.base_model.loaded);
        if (data.current_model) setCurrentModel(data.current_model.type);
        return data;
      }
    } catch { /* backend not ready */ }
    return null;
  }, []);

  const fetchVoices = async () => {
    setVoicesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/v1/models`);
      if (res.ok) {
        const data = await res.json();
        const list = data.data || [];
        setVoices(list);
        if (list.length > 0 && !list.some((v: Voice) => v.id === selectedVoice)) {
          setSelectedVoice(list[0].id);
        }
      }
    } catch { /* ignore */ } finally { setVoicesLoading(false); }
  };

  const fetchLoras = async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/lora`);
      if (res.ok) {
        const data = await res.json();
        setLoras(data.data || []);
        setActiveLora(data.active || null);
      }
    } catch { /* ignore */ }
  };

  const fetchAudioHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/audio/history`);
      if (res.ok) { const data = await res.json(); setAudioHistory(data.files || []); }
    } catch { /* ignore */ }
  };

  // ─── Download flow ──────────────────────────────────────────

  const pollDownloadProgress = (): Promise<void> =>
    new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/v1/download/progress`);
          if (!res.ok) return;
          const progress = (await res.json()) as DownloadProgress;
          setDownloadProgress(progress);
          const vals = Object.values(progress);
          if (vals.every((p) => ["done", "idle", "error"].includes(p.status))) {
            clearInterval(interval);
            const err = vals.filter((p) => p.status === "error").map((p) => p.message).join(", ");
            err ? reject(new Error(err)) : resolve();
          }
        } catch (e) { clearInterval(interval); reject(e); }
      }, 1500);
    });

  const handleDownloadBase = async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      const res = await fetch(`${API_BASE}/v1/download/base`, { method: "POST" });
      const data = await res.json();
      if (data.status === "already_downloaded") { await handleReloadModel(); return; }
      await pollDownloadProgress();
      await handleReloadModel();
    } catch { setDownloadError("Không thể kết nối backend."); }
    finally { setDownloading(false); }
  };

  const handleReloadModel = async () => {
    setReloading(true);
    try {
      const res = await fetch(`${API_BASE}/v1/models/reload`, { method: "POST" });
      if (res.ok) { setAppReady(true); await checkStatus(); await fetchVoices(); await fetchLoras(); }
      else { const err = await res.json(); setDownloadError(err.error || "Failed to reload model"); }
    } catch { setDownloadError("Không thể reload model."); }
    finally { setReloading(false); }
  };

  // ─── Model & LoRA ───────────────────────────────────────────

  const handleSwitchModel = async (modelType: string) => {
    if (modelType === currentModel || switchingModel) return;
    setSwitchingModel(true);
    try {
      const res = await fetch(`${API_BASE}/v1/models/switch`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: modelType }),
      });
      if (res.ok) { setCurrentModel(modelType); await checkStatus(); await fetchVoices(); }
      else { const err = await res.json(); showToast("error", `Lỗi chuyển model: ${err.detail || "Unknown"}`); }
    } catch { showToast("error", "Không thể kết nối backend."); }
    finally { setSwitchingModel(false); }
  };

  const handleDetectHardware = async () => {
    setDetecting(true);
    try {
      const res = await fetch(`${API_BASE}/v1/hardware/detect`);
      if (res.ok) setHardwareInfo(await res.json());
    } catch { /* ignore */ } finally { setDetecting(false); }
  };

  const handleLoadLora = async (loraId: string, downloaded: boolean) => {
    setLoraLoading(true);
    try {
      if (!downloaded) {
        const dlRes = await fetch(`${API_BASE}/v1/download/lora`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: loraId }),
        });
        const dlData = await dlRes.json();
        if (dlData.status === "started") await pollDownloadProgress();
      }
      const res = await fetch(`${API_BASE}/v1/lora/load`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: loraId }),
      });
      if (res.ok) { setActiveLora(loraId); await fetchVoices(); await fetchLoras(); }
      else { const err = await res.json(); showToast("error", err.error || "Lỗi tải LoRA"); }
    } catch { showToast("error", "Lỗi kết nối backend."); }
    finally { setLoraLoading(false); }
  };

  const handleUnloadLora = async () => {
    setLoraLoading(true);
    try { await fetch(`${API_BASE}/v1/lora/unload`, { method: "POST" }); setActiveLora(null); await fetchVoices(); }
    catch { /* ignore */ } finally { setLoraLoading(false); }
  };

  // ─── TTS Generation ─────────────────────────────────────────

  const handleGenerate = async () => {
    setLoading(true);
    try {
      let response: Response;
      if (mode === "clone") {
        if (!refFile || !refText) { showToast("error", "Vui lòng upload file mẫu và nhập văn bản mẫu."); setLoading(false); return; }
        const fd = new FormData();
        fd.append("text", text);
        fd.append("reference_text", refText);
        fd.append("reference_audio", refFile);
        response = await fetch(`${API_BASE}/v1/audio/clone`, { method: "POST", body: fd });
      } else {
        response = await fetch(`${API_BASE}/v1/audio/speech`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice: selectedVoice, stream: streamMode, silence_p: silenceP, emotion }),
        });
      }
      if (response.ok) {
        if (streamMode && mode !== "clone") {
          await handleStreamingPlayback(response);
        } else {
          const blob = await response.blob();
          if (audioUrl) URL.revokeObjectURL(audioUrl);
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          setIsPlaying(true);
        }
        fetchAudioHistory();
      } else { showToast("error", "Lỗi tạo âm thanh."); }
    } catch { showToast("error", "Không thể kết nối backend."); }
    finally { setLoading(false); }
  };

  const handleStreamingPlayback = async (response: Response) => {
    if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    const ctx = audioContextRef.current;
    const reader = response.body?.getReader();
    if (!reader) return;
    const chunks: Float32Array[] = [];
    let totalLength = 0;
    setIsPlaying(true);
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const int16 = new Int16Array(value.buffer, value.byteOffset, value.byteLength / 2);
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32767.0;
        chunks.push(float32);
        totalLength += float32.length;
      }
      const combined = new Float32Array(totalLength);
      let offset = 0;
      for (const c of chunks) { combined.set(c, offset); offset += c.length; }
      const buf = ctx.createBuffer(1, combined.length, 24000);
      buf.getChannelData(0).set(combined);
      const source = ctx.createBufferSource();
      source.buffer = buf;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
      const wavBlob = pcmToWav(combined, 24000);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(URL.createObjectURL(wavBlob));
    } catch { setIsPlaying(false); }
  };

  const pcmToWav = (samples: Float32Array, sr: number): Blob => {
    const buf = new ArrayBuffer(44 + samples.length * 2);
    const v = new DataView(buf);
    const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, "RIFF"); v.setUint32(4, 36 + samples.length * 2, true);
    w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true);
    v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true);
    v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    w(36, "data"); v.setUint32(40, samples.length * 2, true);
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return new Blob([buf], { type: "audio/wav" });
  };

  const handleGenerateDialogue = async () => {
    if (dialogueLines.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/v1/audio/dialogue`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: dialogueLines.map((l) => ({ text: l.text, voice: l.voice, pause_after: l.pauseAfter, emotion: l.emotion })) }),
      });
      if (res.ok) {
        const blob = await res.blob();
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob));
        setIsPlaying(true);
        fetchAudioHistory();
      } else { const err = await res.json(); showToast("error", err.detail || "Lỗi tạo dialogue"); }
    } catch { showToast("error", "Không thể kết nối backend."); }
    finally { setLoading(false); }
  };

  // ─── UI helpers ─────────────────────────────────────────────

  const insertPause = (ms: number) => {
    const marker = `[pause:${ms}]`;
    const ta = textareaRef.current;
    if (ta) {
      const { selectionStart: s, selectionEnd: e } = ta;
      setText(text.substring(0, s) + marker + text.substring(e));
      setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + marker.length; }, 0);
    } else { setText(text + marker); }
  };

  const playHistoryFile = (filename: string) => {
    const url = `${API_BASE}/v1/audio/file/${filename}`;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(url);
    setIsPlaying(true);
  };

  const handleDeleteAudio = async (filename: string) => {
    try {
      const res = await fetch(`${API_BASE}/v1/audio/file/${filename}`, { method: "DELETE" });
      if (res.ok) { showToast("success", "Đã xóa file"); fetchAudioHistory(); }
      else { showToast("error", "Lỗi xóa file"); }
    } catch { showToast("error", "Không thể kết nối backend."); }
  };

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleRestart = () => { /* Player handles internally */ };
  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `thanhvinh_${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const addDialogueLine = () => {
    const newId = Math.max(...dialogueLines.map((l) => l.id), 0) + 1;
    setDialogueLines([...dialogueLines, { id: newId, text: "", voice: voices[0]?.id || "Vinh", pauseAfter: 0.5, emotion: "natural" }]);
  };
  const removeDialogueLine = (id: number) => setDialogueLines(dialogueLines.filter((l) => l.id !== id));
  const updateDialogueLine = (id: number, field: keyof DialogueLine, value: string | number) =>
    setDialogueLines(dialogueLines.map((l) => (l.id === id ? { ...l, [field]: value } : l)));

  // ─── OmniVoice handlers ─────────────────────────────────────

  const handleOvLoad = async () => {
    setOvLoading(true);
    try {
      const res = await fetch(`${API_BASE}/v1/omnivoice/load`, { method: "POST" });
      if (res.ok) { setOvLoaded(true); showToast("success", "OmniVoice đã sẵn sàng!"); }
      else { const d = await res.json(); showToast("error", d.detail || "Lỗi tải OmniVoice"); }
    } catch { showToast("error", "Không thể kết nối backend."); }
    finally { setOvLoading(false); }
  };

  const handleOvUnload = async () => {
    try {
      await fetch(`${API_BASE}/v1/omnivoice/unload`, { method: "POST" });
      setOvLoaded(false);
      if (ovAudioUrl) { URL.revokeObjectURL(ovAudioUrl); setOvAudioUrl(null); }
      showToast("success", "Đã gỡ OmniVoice");
    } catch { showToast("error", "Lỗi gỡ OmniVoice"); }
  };

  const handleOvGenerate = async () => {
    if (!ovText.trim()) { showToast("error", "Vui lòng nhập văn bản"); return; }
    setOvGenerating(true);
    try {
      let response: Response;
      if (ovMode === "clone") {
        if (!ovRefFile) { showToast("error", "Vui lòng upload audio tham chiếu"); setOvGenerating(false); return; }
        const fd = new FormData();
        fd.append("text", ovText);
        fd.append("reference_audio", ovRefFile);
        fd.append("language", ovLanguage);
        fd.append("speed", String(ovSpeed));
        response = await fetch(`${API_BASE}/v1/omnivoice/clone`, { method: "POST", body: fd });
      } else {
        response = await fetch(`${API_BASE}/v1/omnivoice/tts`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: ovText, language: ovLanguage, speed: ovSpeed }),
        });
      }
      if (response.ok) {
        const blob = await response.blob();
        if (ovAudioUrl) URL.revokeObjectURL(ovAudioUrl);
        setOvAudioUrl(URL.createObjectURL(blob));
      } else { const d = await response.json().catch(() => null); showToast("error", d?.detail || "Lỗi tạo âm thanh"); }
    } catch { showToast("error", "Không thể kết nối backend."); }
    finally { setOvGenerating(false); }
  };

  // ─── Page navigation with transition ────────────────────────

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

  // ─── Init ───────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      setStatusLoading(true);
      const data = await checkStatus();
      if (data?.base_model.loaded) { await fetchVoices(); await fetchLoras(); await fetchAudioHistory(); }
      setStatusLoading(false);
    })();
  }, []);

  // ─── Render ─────────────────────────────────────────────────

  if (statusLoading) {
    return (
      <main className="flex h-screen w-full items-center justify-center bg-tvhs-main">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" />
          <p className="text-sm text-tvhs-text-secondary">Đang kiểm tra trạng thái...</p>
        </div>
      </main>
    );
  }

  if (!appReady) {
    return (
      <>
        <ToastContainer />
        <SetupScreen
          status={status}
          statusLoading={statusLoading}
          downloading={downloading}
          downloadProgress={downloadProgress}
          downloadError={downloadError}
          reloading={reloading}
          onDownload={handleDownloadBase}
          onRetry={async () => { setStatusLoading(true); await checkStatus(); setStatusLoading(false); }}
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
                    mode={mode}
                    currentModel={currentModel}
                    switchingModel={switchingModel}
                    onSwitchModel={handleSwitchModel}
                    emotion={emotion}
                    onEmotionChange={setEmotion}
                    voices={voices}
                    voicesLoading={voicesLoading}
                    selectedVoice={selectedVoice}
                    onVoiceChange={setSelectedVoice}
                    silenceP={silenceP}
                    onSilenceChange={setSilenceP}
                    audioHistory={audioHistory}
                    onPlayHistory={playHistoryFile}
                    loras={loras}
                    activeLora={activeLora}
                    loraLoading={loraLoading}
                    onLoadLora={handleLoadLora}
                    onUnloadLora={handleUnloadLora}
                    hardwareInfo={hardwareInfo}
                    detecting={detecting}
                    onDetectHardware={handleDetectHardware}
                    refFile={refFile}
                    refText={refText}
                    onRefFileChange={setRefFile}
                    onRefTextChange={setRefText}
                    dialogueLines={dialogueLines}
                    onAddLine={addDialogueLine}
                    onRemoveLine={removeDialogueLine}
                    onUpdateLine={updateDialogueLine}
                    streamMode={streamMode}
                    onStreamChange={setStreamMode}
                    onRefresh={() => { checkStatus(); fetchVoices(); fetchLoras(); }}
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
                      <button key={tab.id} onClick={() => setMode(tab.id)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all" style={{ background: mode === tab.id ? "linear-gradient(135deg, #c5a059, #e0c286)" : "transparent", color: mode === tab.id ? "#000" : "var(--color-tvhs-text-secondary)", boxShadow: mode === tab.id ? "0 2px 12px rgba(197, 160, 89, 0.2)" : "none" }}>
                        <tab.icon className="h-3.5 w-3.5" /> {tab.label}
                      </button>
                    ))}
                    <div className="flex-1" />
                    {activeLora && (
                      <span className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium" style={{ background: "rgba(167, 139, 250, 0.15)", color: "#a78bfa" }}>
                        <Sparkles className="h-2.5 w-2.5" /> {activeLora}
                      </span>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5" style={{ background: "var(--color-tvhs-main)" }}>
                    {mode === "preset" && (
                      <>
                        <div className="flex items-center justify-between">
                          <h2 className="text-sm font-semibold text-tvhs-text">Nhập văn bản</h2>
                          <span className="text-[10px] font-medium uppercase tracking-wide text-tvhs-text-muted">VIETNAMESE</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[9px] font-medium uppercase tracking-wider text-tvhs-text-muted">Chèn dừng:</span>
                          {[250, 500, 1000, 2000].map((ms) => (
                            <button key={ms} onClick={() => insertPause(ms)} className="rounded px-2 py-0.5 font-mono text-[10px]" style={{ background: "var(--color-tvhs-elevated)", color: "var(--color-tvhs-text-secondary)" }}>
                              {ms >= 1000 ? `${ms / 1000}s` : `${ms}ms`}
                            </button>
                          ))}
                        </div>
                        <textarea ref={textareaRef} className="tts-textarea flex-1" placeholder="Nhập văn bản cần đọc..." value={text} onChange={(e) => setText(e.target.value)} />
                      </>
                    )}

                    {mode === "clone" && (
                      <>
                        <div className="flex items-center justify-between">
                          <h2 className="text-sm font-semibold text-tvhs-text">Nhập văn bản</h2>
                          <span className="text-[10px] font-medium uppercase tracking-wide text-tvhs-text-muted">VIETNAMESE</span>
                        </div>
                        <textarea ref={textareaRef} className="tts-textarea flex-1" placeholder="Nhập văn bản cần đọc..." value={text} onChange={(e) => setText(e.target.value)} />
                      </>
                    )}

                    {mode === "dialogue" && (
                      <>
                        <div className="flex items-center justify-between">
                          <h2 className="text-sm font-semibold text-tvhs-text">Kịch bản đối thoại</h2>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-tvhs-text-muted">{dialogueLines.length} dòng</span>
                            <span className="text-xs text-tvhs-text-muted">~{Math.ceil(dialogueLines.reduce((s, l) => s + l.pauseAfter, 0) + dialogueLines.length * 2)}s</span>
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                          {dialogueLines.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-sm text-tvhs-text-muted">
                              Chưa có dòng nào. Bấm "+ Thêm dòng" ở sidebar để bắt đầu.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {dialogueLines.map((line, index) => (
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
                                  {index < dialogueLines.length - 1 && (
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
                    audioUrl={audioUrl}
                    isPlaying={isPlaying}
                    loading={loading}
                    onPlayPause={handlePlayPause}
                    onRestart={handleRestart}
                    onDownload={handleDownload}
                    onGenerate={mode === "dialogue" ? handleGenerateDialogue : handleGenerate}
                  />
                </div>
              </div>
            )}

            {/* Other pages */}
            {activePage !== "studio" && (
              <div className={`h-full overflow-y-auto p-6 transition-all duration-300 ${pageVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                {activePage === "dashboard" && <Dashboard audioHistory={audioHistory} voices={voices} status={status} onNavigate={navigateTo} />}
                {activePage === "voices" && <VoiceLibrary voices={voices} selectedVoice={selectedVoice} onSelect={setSelectedVoice} />}
                {activePage === "history" && <History audioHistory={audioHistory} onPlay={playHistoryFile} onDelete={handleDeleteAudio} />}
                {activePage === "settings" && <SettingsPage status={status} hardwareInfo={hardwareInfo} detecting={detecting} onDetectHardware={handleDetectHardware} onReloadModel={handleReloadModel} />}
                {activePage === "omnivoice" && (
                  <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-lg font-bold text-tvhs-text">OmniVoice TTS</h1>
                        <p className="text-sm text-tvhs-text-muted">Engine tổng hợp giọng nói 0.6B, hỗ trợ 600+ ngôn ngữ</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {ovLoaded ? (
                          <span className="flex items-center gap-1.5 rounded-full bg-tvhs-success/15 px-3 py-1 text-xs font-semibold text-tvhs-success">
                            <Zap className="h-3 w-3" /> Đã tải
                          </span>
                        ) : (
                          <span className="rounded-full bg-tvhs-elevated px-3 py-1 text-xs font-medium text-tvhs-text-muted">Chưa tải</span>
                        )}
                      </div>
                    </div>

                    {/* Load/Unload */}
                    {!ovLoaded ? (
                      <button onClick={handleOvLoad} disabled={ovLoading} className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-50" style={{ background: "linear-gradient(135deg, #c5a059, #e0c286)", color: "#000" }}>
                        {ovLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang tải model...</> : <><Radio className="h-4 w-4" /> Tải OmniVoice</>}
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={handleOvUnload} className="rounded-lg px-4 py-2 text-xs font-medium transition-colors" style={{ border: "1px solid var(--color-tvhs-border)", color: "var(--color-tvhs-text-muted)" }}>Gỡ model</button>
                      </div>
                    )}

                    {ovLoaded && (
                      <>
                        {/* Mode tabs */}
                        <div className="flex gap-1 rounded-lg p-1" style={{ background: "var(--color-tvhs-surface)", border: "1px solid var(--color-tvhs-border)" }}>
                          {([ { id: "tts" as const, label: "TTS" }, { id: "clone" as const, label: "Voice Clone" } ]).map((tab) => (
                            <button key={tab.id} onClick={() => setOvMode(tab.id)} className="flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-all" style={{ background: ovMode === tab.id ? "linear-gradient(135deg, #c5a059, #e0c286)" : "transparent", color: ovMode === tab.id ? "#000" : "var(--color-tvhs-text-secondary)" }}>
                              {tab.label}
                            </button>
                          ))}
                        </div>

                        {/* Clone: reference audio upload */}
                        {ovMode === "clone" && (
                          <div className="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl p-6 text-center transition-colors" style={{ border: "2px dashed var(--color-tvhs-border)", background: "var(--color-tvhs-elevated)" }}>
                            <input type="file" accept="audio/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={(e) => setOvRefFile(e.target.files?.[0] || null)} />
                            <Upload className="h-6 w-6 text-tvhs-text-muted" />
                            <span className="text-sm font-medium text-tvhs-text-secondary">{ovRefFile ? ovRefFile.name : "Tải lên audio tham chiếu"}</span>
                            <span className="text-[10px] text-tvhs-text-muted">WAV, MP3 (3-10s)</span>
                          </div>
                        )}

                        {/* Controls */}
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-tvhs-text-muted">Ngôn ngữ</label>
                            <select value={ovLanguage} onChange={(e) => setOvLanguage(e.target.value)} className="tts-select">
                              <option value="vie">Tiếng Việt</option>
                              <option value="eng">English</option>
                              <option value="cmn">中文</option>
                              <option value="jpn">日本語</option>
                              <option value="kor">한국어</option>
                              <option value="fra">Français</option>
                              <option value="deu">Deutsch</option>
                            </select>
                          </div>
                          <div className="flex-1">
                            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-tvhs-text-muted">Tốc độ: {ovSpeed.toFixed(1)}x</label>
                            <input type="range" min="0.5" max="2.0" step="0.1" value={ovSpeed} onChange={(e) => setOvSpeed(parseFloat(e.target.value))} className="tts-range" />
                          </div>
                        </div>

                        {/* Text input */}
                        <div>
                          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-tvhs-text-muted">Văn bản</label>
                          <textarea className="tts-textarea" rows={5} placeholder="Nhập văn bản cần đọc..." value={ovText} onChange={(e) => setOvText(e.target.value)} />
                        </div>

                        {/* Generate button */}
                        <button onClick={handleOvGenerate} disabled={ovGenerating || !ovText.trim()} className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-50" style={{ background: "linear-gradient(135deg, #c5a059, #e0c286)", color: "#000" }}>
                          {ovGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang tạo...</> : <><Play className="h-4 w-4" /> Tạo giọng nói</>}
                        </button>

                        {/* Audio player */}
                        {ovAudioUrl && (
                          <div className="rounded-xl p-4" style={{ background: "var(--color-tvhs-surface)", border: "1px solid var(--color-tvhs-border)" }}>
                            <audio controls src={ovAudioUrl} className="w-full" />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
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
