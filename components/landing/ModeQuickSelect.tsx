"use client";
import Link from "next/link";
import { useDeepsearchStore } from "@/store/useDeepsearch";
import { GlassCard } from "./GlassCard";
import type { DomainMode } from "@/lib/domainModeStore";

/**
 * ModeQuickSelect - Quick select buttons for domain modes
 * Clicking redirects to /chat?mode=...
 */
const modes: DomainMode[] = ["bicycle", "auto", "moto", "tech"];

const modeLabels: Record<DomainMode, string> = {
  bicycle: "Bicycle",
  auto: "Auto",
  moto: "Moto",
  tech: "Tech",
};

export function ModeQuickSelect() {
  const deepsearch = useDeepsearchStore((state) => state.mode);

  const buildChatUrl = (mode: DomainMode) => {
    const params = new URLSearchParams();
    params.set("mode", mode);
    if (deepsearch && deepsearch !== "off") {
      params.set("deepsearch", deepsearch);
    }
    return `/chat?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-2xl font-display font-semibold text-text1 text-center mb-6">
        Quick Start
      </h2>
      <div className="flex flex-wrap justify-center gap-4">
        {modes.map((mode) => (
          <Link
            key={mode}
            href={buildChatUrl(mode)}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
          >
            <GlassCard className="px-6 py-4 hover:scale-105 transition-transform cursor-pointer">
              <span className="text-lg font-medium text-text1">
                {modeLabels[mode]}
              </span>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}

