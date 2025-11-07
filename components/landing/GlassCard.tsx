"use client";
import { ReactNode } from "react";

/**
 * GlassCard - Reusable glassmorphism container
 * Provides consistent glass effect styling
 */
export function GlassCard({
  children,
  className = "",
  onClick,
  ...props
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}) {
  return (
    <div
      className={`bg-background/50 backdrop-blur-md border border-white/10 dark:border-white/5 rounded-2xl shadow-xl transition-all duration-300 ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}



