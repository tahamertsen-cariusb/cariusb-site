"use client";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Button component matching design tokens
 * Rounded-2xl, focus-visible ring, size variants
 */
export function Button({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses = "rounded-2xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  
  const variantClasses = {
    default: "bg-accent text-white hover:bg-accent/90",
    outline: "border border-stroke bg-transparent text-text1 hover:bg-surface-2",
    ghost: "bg-transparent text-text1 hover:bg-surface-2",
  };
  
  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

