"use client";
import type { DeepsearchMode } from "@/lib/chat/types";
import { useDeepsearchStore } from "@/store/useDeepsearch";
import { useEffect, useState } from "react";

type Size = "sm" | "md";

interface DeepsearchToggleProps {
  size?: Size;
  className?: string;
  source?: "landing" | "chat"; // For analytics
}

export function DeepsearchToggle({
  size = "md",
  className = "",
  source = "chat",
}: DeepsearchToggleProps) {
  const mode = useDeepsearchStore((state) => state.mode);
  const setMode = useDeepsearchStore((state) => state.set);
  const [mounted, setMounted] = useState(false);

  // SSR-safe: only render after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const modes: DeepsearchMode[] = ["off", "auto", "on"];
  const labels = { off: "Off", auto: "Auto", on: "On" };

  const handleClick = (newMode: DeepsearchMode) => {
    const previousMode = mode;
    setMode(newMode);
    
    // Analytics event (optional)
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "deepsearch_change", {
        from: previousMode,
        to: newMode,
        source,
      });
    }
  };

  // Size variants
  const sizeClasses = {
    sm: {
      container: "p-0.5",
      button: "px-2 py-1 text-[10px]",
    },
    md: {
      container: "p-1",
      button: "px-3 py-1.5 text-xs",
    },
  };

  const currentSize = sizeClasses[size];

  if (!mounted) {
    // SSR placeholder - avoids hydration mismatch
    return (
      <div
        className={`flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 ${currentSize.container} ${className}`}
        aria-hidden="true"
      >
        {modes.map((m) => (
          <div
            key={m}
            className={`${currentSize.button} font-medium rounded-md bg-white/5 text-white/40`}
          >
            {labels[m]}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 backdrop-blur ${currentSize.container} ${className}`}
      role="tablist"
      aria-label="Deepsearch mode selector"
    >
      {modes.map((m) => (
        <button
          key={m}
          onClick={() => handleClick(m)}
          role="tab"
          aria-label={`Set deepsearch to ${labels[m].toLowerCase()}`}
          aria-selected={mode === m}
          className={`
            ${currentSize.button} font-medium rounded-md transition-all
            ${
              mode === m
                ? "bg-white/20 text-white border border-white/30 shadow-sm"
                : "text-white/60 hover:text-white/80 hover:bg-white/5"
            }
            focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {labels[m]}
        </button>
      ))}
      {/* Tooltip/info (optional, can be shown on hover) */}
      <span className="sr-only">
        {mode === "auto" && "Auto: Enable or disable based on content"}
        {mode === "on" && "On: Always enabled"}
        {mode === "off" && "Off: Always disabled"}
      </span>
    </div>
  );
}

