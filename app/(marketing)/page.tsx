"use client";
import Link from "next/link";
import { DomainModeToggle } from "@/components/DomainModeToggle";
import { DeepsearchToggle } from "@/components/deepsearch/DeepsearchToggle";
import { OrbPulse } from "@/components/OrbPulse";
import { HeroInputDock } from "@/components/HeroInputDock";
import { IntentSuggestion } from "@/components/IntentSuggestion";
import { Footer } from "@/components/Footer";

/**
 * Landing Page
 * Figma design implementation with glassmorphism and premium dark/light theme
 * Hero section with Cognitive Orb, Input Dock, and Intent Suggestions
 */
export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <main className="flex-1">
        <div className="relative mx-auto max-w-[1280px] px-6">
          {/* Cognitive Orb - positioned absolutely according to Figma */}
          <div 
            className="pointer-events-none absolute -z-10"
            style={{ 
              left: "calc(33.333% + 28px)", 
              top: 384,
            }}
          >
            <OrbPulse />
          </div>

          {/* Hero Section - Figma spacing and typography */}
          <section className="w-full flex flex-col items-center text-center pt-20 pb-16">
            {/* H1 - Display Heading (Figma: text-display-1) */}
            <h1
              className="text-balance font-display text-display-1 text-text1 font-bold tracking-[-0.4px] max-w-[575px]"
              style={{ color: 'var(--color-text-1)' }}
            >
              Where Intelligence Operates.
            </h1>
            
            {/* Body Text (Figma: text-body-m) */}
            <p
              className="mt-4 text-balance text-body-m text-text2 tracking-[-0.16px] max-w-[368.9px]"
              style={{ color: 'var(--color-text-2)' }}
            >
              Tell me what you need. I'll derive the optimum.
            </p>

            {/* Domain Mode Toggle (Figma: 8px spacing system) */}
            <div className="mt-10">
              <DomainModeToggle />
            </div>

            {/* Input Dock with Deepsearch Toggle (Figma: responsive layout) */}
            <div className="mt-6 flex flex-col items-center gap-3 w-full max-w-[577px]">
              {/* Desktop: Input and Toggle side by side */}
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1">
                  <HeroInputDock placeholder="Ask anything…" />
                </div>
                <div className="flex-shrink-0 hidden sm:block">
                  <DeepsearchToggle size="sm" source="landing" />
                </div>
              </div>
              
              {/* Mobile: Toggle below input */}
              <div className="sm:hidden w-full">
                <DeepsearchToggle size="sm" source="landing" />
              </div>
            </div>

            {/* Intent Suggestions (Figma: 4 cards grid) */}
            <IntentSuggestion />

            {/* Pricing Link (Figma: text-body-s) */}
            <div className="mt-8 text-body-s text-text2">
              <Link 
                href="/pricing" 
                className="underline underline-offset-4 hover:text-text1 transition-hover focus-ring"
                style={{ color: 'var(--color-text-2)' }}
              >
                Pricing
              </Link>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
