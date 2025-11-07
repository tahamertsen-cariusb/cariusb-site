"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Chat input component
 * 56px height, glass surface, precise stroke
 * Focus: 1px accent inner stroke + faint outer glow
 * Shortcuts: Enter=send, Shift+Enter=newline, Esc=blur, /=focus
 */
export function ChatInput({
  placeholder = "Ask anything…",
  onSend,
  disabled = false,
  className = "",
}: {
  placeholder?: string;
  onSend: (text: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(160, el.scrollHeight) + "px";
  }, [value]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus input with "/"
      if (e.key === "/" && e.target !== ref.current) {
        e.preventDefault();
        ref.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const send = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  };

  return (
    <div
      className={`relative rounded-card flex items-center gap-3 px-4 transition-smooth ${className}`}
      style={{
        height: "56px",
        backgroundColor: "rgba(27, 32, 39, 0.7)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${isFocused ? "var(--color-accent)" : "#262D36"}`,
        boxShadow: isFocused
          ? "var(--shadow-glow-accent), var(--shadow-inner)"
          : "var(--shadow-inner)",
      }}
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          } else if (e.key === "Escape") {
            e.preventDefault();
            ref.current?.blur();
          }
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label="Message input"
        placeholder={placeholder}
        className="flex-1 bg-transparent resize-none outline-none text-body-m text-text1 placeholder:text-text2"
        rows={1}
        disabled={disabled}
        style={{ color: "var(--color-text-1)" }}
      />
      <button
        aria-label="Send message"
        onClick={send}
        disabled={disabled || !value.trim()}
        className="rounded-btn px-4 py-2 text-body-s font-medium text-text1 transition-hover focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: "var(--color-accent)",
          color: "var(--color-page)",
        }}
      >
        Send
      </button>
    </div>
  );
}



