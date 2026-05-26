"use client";

import { ReactNode } from "react";
import { Layers, Mic, MessageSquare, Sparkles, LayoutDashboard, Clock, Settings, Star, BookOpen, Search, Bell } from "lucide-react";
import { LOGO_URL } from "../lib/constants";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  breadcrumb: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, breadcrumb: "/ Tổng quan", href: "/studio" },
  { id: "studio", label: "Studio", icon: Sparkles, breadcrumb: "/ Tạo giọng nói", href: "/studio?tab=studio" },
  { id: "voices", label: "Voice Library", icon: Mic, breadcrumb: "/ Quản lý giọng", href: "/studio?tab=voices" },
  { id: "history", label: "History", icon: Clock, breadcrumb: "/ Lịch sử audio", href: "/studio?tab=history" },
  { id: "features", label: "Tính năng", icon: Star, breadcrumb: "/ Features", href: "/features" },
  { id: "guide", label: "Hướng dẫn", icon: BookOpen, breadcrumb: "/ Guide", href: "/guide" },
];

const BOTTOM_NAV: NavItem = { id: "settings", label: "Settings", icon: Settings, breadcrumb: "/ Cài đặt", href: "/studio?tab=settings" };

interface SaasShellProps {
  activeId: string;
  children: ReactNode;
  topbarLeft?: ReactNode;
  rightSlot?: ReactNode;
}

export function SaasShell({ activeId, children, topbarLeft, rightSlot }: SaasShellProps) {
  const current = NAV_ITEMS.find((n) => n.id === activeId) || NAV_ITEMS[0];

  return (
    <main className="flex h-screen w-full bg-tvhs-main">
      {/* ═══ Icon Nav Sidebar ═══ */}
      <nav className="flex w-16 shrink-0 flex-col items-center border-r border-tvhs-border bg-tvhs-surface py-4 gap-1">
        <a href="/" className="mb-4 flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full ring-1 ring-tvhs-border transition hover:ring-tvhs-accent/50">
          <img src={LOGO_URL} alt="TVHS" className="h-full w-full object-cover" />
        </a>

        {NAV_ITEMS.slice(0, 4).map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={`group relative flex h-10 w-11 items-center justify-center rounded-lg transition no-underline ${activeId === item.id ? "bg-tvhs-accent-faint text-tvhs-accent" : "text-tvhs-text-muted hover:bg-tvhs-elevated hover:text-tvhs-text-secondary"}`}
            title={item.label}
          >
            <item.icon className="h-5 w-5" />
            <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-md border border-tvhs-border bg-tvhs-elevated px-2.5 py-1 text-xs font-semibold text-tvhs-text opacity-0 shadow-lg transition-opacity group-hover:opacity-100">{item.label}</span>
          </a>
        ))}

        <div className="my-1 h-px w-6 bg-tvhs-border" />

        {NAV_ITEMS.slice(4).map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={`group relative flex h-10 w-11 items-center justify-center rounded-lg transition no-underline ${activeId === item.id ? "bg-tvhs-accent-faint text-tvhs-accent" : "text-tvhs-text-muted hover:bg-tvhs-elevated hover:text-tvhs-text-secondary"}`}
            title={item.label}
          >
            <item.icon className="h-5 w-5" />
            <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-md border border-tvhs-border bg-tvhs-elevated px-2.5 py-1 text-xs font-semibold text-tvhs-text opacity-0 shadow-lg transition-opacity group-hover:opacity-100">{item.label}</span>
          </a>
        ))}

        <div className="flex-1" />

        <a
          href={BOTTOM_NAV.href}
          className={`group relative flex h-10 w-11 items-center justify-center rounded-lg transition no-underline ${activeId === "settings" ? "bg-tvhs-accent-faint text-tvhs-accent" : "text-tvhs-text-muted hover:bg-tvhs-elevated hover:text-tvhs-text-secondary"}`}
          title="Settings"
        >
          <Settings className="h-5 w-5" />
          <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-md border border-tvhs-border bg-tvhs-elevated px-2.5 py-1 text-xs font-semibold text-tvhs-text opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Settings</span>
        </a>
      </nav>

      {/* ═══ Main Area ═══ */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-tvhs-border bg-tvhs-surface px-5">
          {topbarLeft}
          <span className="text-sm font-bold text-tvhs-text">{current.label}</span>
          <span className="text-[11px] text-tvhs-text-muted">{current.breadcrumb}</span>
          <div className="flex-1" />
          {rightSlot || (
            <div className="flex items-center gap-1.5 rounded-lg border border-tvhs-border bg-tvhs-elevated px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 text-tvhs-text-muted" />
              <input type="text" placeholder="Tìm kiếm..." className="w-40 bg-transparent text-xs text-tvhs-text outline-none placeholder:text-tvhs-text-muted" />
            </div>
          )}
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-tvhs-text-muted transition hover:bg-tvhs-elevated hover:text-tvhs-text">
            <Bell className="h-4 w-4" />
          </button>
        </header>

        {/* Content */}
        <div className="relative flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </main>
  );
}
