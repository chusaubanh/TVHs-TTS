"use client";

import { useEffect, useState, useCallback } from "react";
import { X, AlertCircle, CheckCircle2, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

let _toastId = 0;
let _addToast: ((t: Omit<ToastMessage, "id">) => void) | null = null;

export function showToast(type: ToastType, message: string) {
  _addToast?.({ type, message });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((t: Omit<ToastMessage, "id">) => {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    _addToast = addToast;
    return () => { _addToast = null; };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm shadow-lg backdrop-blur-md animate-[slideIn_0.25s_ease-out]"
          style={{
            background:
              t.type === "error"
                ? "rgba(239, 68, 68, 0.15)"
                : t.type === "success"
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(197, 160, 89, 0.15)",
            border: `1px solid ${
              t.type === "error"
                ? "rgba(239, 68, 68, 0.3)"
                : t.type === "success"
                ? "rgba(16, 185, 129, 0.3)"
                : "rgba(197, 160, 89, 0.3)"
            }`,
            color:
              t.type === "error"
                ? "#ef4444"
                : t.type === "success"
                ? "#10b981"
                : "#c5a059",
          }}
        >
          {t.type === "error" && <AlertCircle className="h-4 w-4 shrink-0" />}
          {t.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
          {t.type === "info" && <Info className="h-4 w-4 shrink-0" />}
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
