"use client";
import { ReactNode } from "react";

/**
 * Reusable glass card component
 * Provides consistent glassmorphism styling
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
  const baseClasses = "glass rounded-card p-4 transition-smooth";
  const interactiveClasses = onClick ? "cursor-pointer hover-glow" : "";

  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}



