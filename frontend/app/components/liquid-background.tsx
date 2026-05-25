interface LiquidBackgroundProps {
  className?: string;
  intensity?: "subtle" | "hero";
}

export function LiquidBackground({
  className = "",
  intensity = "hero",
}: LiquidBackgroundProps) {
  return (
    <div
      className={[
        "liquid-bg",
        intensity === "subtle" ? "liquid-bg-subtle" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      <div className="liquid-blob liquid-blob-1" />
      <div className="liquid-blob liquid-blob-2" />
      <div className="liquid-blob liquid-blob-3" />
      <div className="liquid-blob liquid-blob-4" />
      <div className="liquid-frost" />
    </div>
  );
}
