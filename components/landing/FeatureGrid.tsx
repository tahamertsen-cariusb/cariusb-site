"use client";
import { GlassCard } from "./GlassCard";
import { 
  Zap, 
  Search, 
  Shield, 
  Code, 
  Settings, 
  Layers 
} from "lucide-react";

/**
 * FeatureGrid - Grid of feature cards
 * 6 features: Streaming, Deepsearch, Plan Limits, Secure Auth, NDJSON, Modes
 */
const features = [
  {
    icon: Zap,
    title: "Streaming",
    description: "Real-time streaming responses for instant feedback",
  },
  {
    icon: Search,
    title: "Deepsearch",
    description: "Advanced search capabilities with on/off/auto modes",
  },
  {
    icon: Shield,
    title: "Secure Auth",
    description: "Google OAuth and secure authentication",
  },
  {
    icon: Code,
    title: "NDJSON",
    description: "Newline-delimited JSON for efficient streaming",
  },
  {
    icon: Settings,
    title: "Plan Limits",
    description: "Flexible plan-based usage limits",
  },
  {
    icon: Layers,
    title: "Modes",
    description: "Multiple domain modes: bicycle, auto, moto, tech",
  },
];

export function FeatureGrid() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20"
    >
      <h2
        id="features-heading"
        className="text-3xl sm:text-4xl font-display font-bold text-text1 text-center mb-12"
      >
        Features
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <GlassCard
              key={index}
              className="p-6 hover:scale-105 transition-transform"
            >
              <div className="flex flex-col items-start">
                <div className="mb-4 p-3 rounded-xl bg-accent/10">
                  <Icon className="w-6 h-6 text-accent" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-text1 mb-2">
                  {feature.title}
                </h3>
                <p className="text-text2 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}



