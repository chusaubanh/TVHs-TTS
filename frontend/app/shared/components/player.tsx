"use client";

import { useRef, useEffect, useState } from "react";
import { Play, Pause, Download, SkipBack, Sparkles } from "lucide-react";
import { formatTime } from "../../lib/format";

interface Props {
  audioUrl: string | null;
  isPlaying: boolean;
  loading: boolean;
  onPlayPause: () => void;
  onRestart: () => void;
  onDownload: () => void;
  onGenerate: () => void;
}

export function Player({ audioUrl, isPlaying, loading, onPlayPause, onRestart, onDownload, onGenerate }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    audio.src = audioUrl;
    audio.load();
    audio.oncanplay = () => {
      if (isFinite(audio.duration)) setDuration(audio.duration);
      audio.play().catch(() => {});
    };
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onEnded = () => setCurrentTime(0);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying && audio.paused && audioUrl && audio.readyState >= 2) {
      audio.play().catch(() => {});
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying, audioUrl]);

  const playerProgress = audioUrl && duration > 0
    ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
    : 0;

  return (
    <div className="shrink-0 border-t border-tvhs-border bg-tvhs-surface p-3">
      <div className="flex min-h-[88px] flex-col gap-3 rounded-lg border border-tvhs-border bg-tvhs-main/70 p-3 xl:flex-row xl:items-center">
        <button
          onClick={onGenerate}
          disabled={loading}
          className="btn-primary min-h-11 shrink-0 px-5 py-2.5 text-sm xl:w-44"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
              <span>Đang tạo</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Tạo giọng</span>
            </>
          )}
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-tvhs-border bg-tvhs-surface p-2.5">
          <button
            onClick={onPlayPause}
            disabled={!audioUrl}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tvhs-accent-faint text-tvhs-accent transition-colors hover:bg-tvhs-accent/20 disabled:cursor-not-allowed disabled:opacity-40"
            title={isPlaying ? "Tạm dừng" : "Phát"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between gap-3 text-xs text-tvhs-text-muted">
              <span className="truncate font-medium">
                {loading ? "Đang tổng hợp..." : isPlaying ? "Đang phát..." : audioUrl ? "Sẵn sàng phát audio" : "Chưa có audio"}
              </span>
              <span className="shrink-0 font-mono tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="relative h-8">
              <div className={`pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center gap-[2px] px-1${isPlaying ? " animate-wave" : ""}`}>
                {Array.from({ length: 48 }).map((_, index) => {
                  const height = 7 + ((index * 7) % 20);
                  const active = audioUrl && index <= Math.round((playerProgress / 100) * 47);
                  return (
                    <span
                      key={index}
                      className={`block w-[3px] rounded-full transition-colors duration-200${active && isPlaying ? " animate-bar" : ""}`}
                      style={{
                        height: `${height}px`,
                        background: active ? "#c5a059" : "rgba(197, 160, 89, 0.14)",
                        animationDelay: active && isPlaying ? `${(index % 5) * 0.1}s` : "0s",
                      }}
                    />
                  );
                })}
              </div>
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.01"
                value={currentTime}
                onChange={(e) => {
                  const time = parseFloat(e.target.value);
                  if (audioRef.current) audioRef.current.currentTime = time;
                  setCurrentTime(time);
                }}
                disabled={!audioUrl}
                className="tts-range tvhs-wave-range relative z-10 h-8 opacity-0"
                aria-label="Tua audio"
              />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={onRestart} disabled={!audioUrl} className="tvhs-icon-button disabled:cursor-not-allowed disabled:opacity-40" title="Phát lại từ đầu">
              <SkipBack className="h-4 w-4" />
            </button>
            <button onClick={onDownload} disabled={!audioUrl} className="tvhs-icon-button disabled:cursor-not-allowed disabled:opacity-40" title="Tải về">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
