"use client";
import Link from "next/link";
import { useDomainMode } from "@/lib/domainModeStore";
import { useDeepsearchStore } from "@/store/useDeepsearch";
import { Orb } from "@/styles/ornaments";

/**
 * HeroSection - Main hero area
 * Title, description, CTA button, orb decoration
 */
export function HeroSection() {
  const { mode } = useDomainMode();
  const deepsearch = useDeepsearchStore((state) => state.mode);

  // Build chat URL with query params
  const buildChatUrl = () => {
    const params = new URLSearchParams();
    if (mode) params.set("mode", mode);
    if (deepsearch && deepsearch !== "off") {
      params.set("deepsearch", deepsearch);
    }
    const query = params.toString();
    return `/chat${query ? `?${query}` : ""}`;
  };

  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
      {/* Orb decoration */}
      <Orb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />

      <div className="relative z-10 text-center">
        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-text1 tracking-tight mb-6">
          Where Intelligence
          <br />
          <span className="text-accent">Operates</span>
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-text2 max-w-2xl mx-auto mb-10">
          Tell me what you need. I'll derive the optimum.
        </p>

        {/* CTA Button */}
        <Link
          href={buildChatUrl()}
          role="button"
          className="inline-flex items-center justify-center rounded-2xl bg-accent px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-accent/90 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 shadow-lg"
          aria-label="Start chatting"
        >
          Start chatting
        </Link>
      </div>
    </section>
  );
}

