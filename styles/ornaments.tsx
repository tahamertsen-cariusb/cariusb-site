"use client";
import { ReactNode } from "react";

/**
 * Ornament components for decorative backgrounds
 * Orb/gradient effects for landing page
 */

/**
 * Orb - Animated orb decoration
 */
export function Orb({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute pointer-events-none -z-10 ${className}`}
      aria-hidden="true"
    >
      <div className="relative w-96 h-96">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-accent/20 blur-3xl animate-orbPulse" />
        {/* Inner orb */}
        <div className="absolute inset-8 rounded-full bg-gradient-to-br from-accent/40 via-accent/20 to-transparent" />
        {/* Core */}
        <div className="absolute inset-16 rounded-full bg-accent/10" />
      </div>
    </div>
  );
}

/**
 * GradientBackground - Subtle gradient overlay
 */
export function GradientBackground({ className = "" }: { className?: string }) {
  return (
    <div
      className={`fixed inset-0 pointer-events-none -z-20 ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(75,183,255,0.05),transparent_70%)]" />
    </div>
  );
}

/**
 * BlurOrnament - Decorative blur effect
 */
export function BlurOrnament({ 
  position = "top-right",
  className = "" 
}: { 
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}) {
  const positionClasses = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
  };

  return (
    <div
      className={`absolute ${positionClasses[position]} pointer-events-none -z-10 ${className}`}
      aria-hidden="true"
    >
      <div className="w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
    </div>
  );
}



