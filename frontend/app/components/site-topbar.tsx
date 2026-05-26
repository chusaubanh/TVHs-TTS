"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOGO_URL } from "../lib/constants";

const NAV_ITEMS = [
  { href: "/features", label: "Tính năng" },
  { href: "/guide", label: "Hướng dẫn" },
  { href: "/studio", label: "Studio" },
];

interface SiteTopbarProps {
  variant?: "landing" | "studio";
}

export function SiteTopbar({ variant = "studio" }: SiteTopbarProps) {
  const pathname = usePathname();

  return (
    <header
      className={[
        "sticky top-0 z-50 flex h-[72px] items-center justify-between px-6 lg:px-8",
        variant === "landing"
          ? "border-b border-tvhs-border bg-black/60 shadow-2xl backdrop-blur-md"
          : "border-b border-tvhs-border bg-tvhs-surface",
      ].join(" ")}
    >
      <Link href="/" className="group flex items-center gap-3">
        <img
          src={LOGO_URL}
          alt="Thành Vinh Holdings"
          className="h-10 w-10 rounded-full border border-tvhs-border object-cover transition group-hover:border-tvhs-accent"
        />
        <div className="flex flex-col gap-0.5 text-left">
          <span className="font-outfit text-sm font-bold uppercase tracking-wider text-tvhs-text">
            Thành Vinh Holdings
          </span>
          <span className="text-[11px] font-medium tracking-[1px] text-tvhs-accent">
            TTS Studio · Voice AI
          </span>
        </div>
      </Link>

      <nav className="hidden items-center gap-2 md:flex">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                active
                  ? "bg-tvhs-accent-faint text-tvhs-accent"
                  : "text-tvhs-text-secondary hover:bg-tvhs-elevated hover:text-tvhs-accent",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
