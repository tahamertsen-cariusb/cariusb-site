"use client";
import { useEffect, useRef, useState } from "react";
import { DeepsearchToggle } from "@/components/deepsearch/DeepsearchToggle";
import { useDeepsearchStore } from "@/store/useDeepsearch";
import { getUsage } from "@/lib/usageClient";

/**
 * Composer - Textarea auto-resize, send (Enter), newline (Shift+Enter), Deepsearch toggle, token/limit indicator
 */
export function Composer({
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
  const [usage, setUsage] = useState<{ deepsearch_used: number; deepsearch_limit: number } | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const deepsearchMode = useDeepsearchStore((state) => state.mode);

  useEffect(() => {
    getUsage().then((data) => {
      setUsage({
        deepsearch_used: data.deepsearch_used,
        deepsearch_limit: data.deepsearch_limit,
      });
    });
  }, []);

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
    <div className={`space-y-3 ${className}`}>
      {/* Deepsearch Toggle & Usage Indicator */}
      <div className="flex items-center justify-between">
        <DeepsearchToggle size="sm" source="chat" />
        {usage && (
          <div className="text-xs text-text2">
            Deepsearch: {usage.deepsearch_used}/{usage.deepsearch_limit}
          </div>
        )}
      </div>

      {/* Input Container */}
      <div
        className={`relative rounded-2xl flex items-end gap-3 px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-primary/40 ${
          isFocused ? "ring-2 ring-primary/40" : ""
        }`}
        style={{
          backgroundColor: "var(--color-surface-2)",
          backdropFilter: "blur(12px)",
          border: `1px solid ${isFocused ? "var(--color-accent)" : "var(--color-stroke)"}`,
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
          className="flex-1 bg-transparent resize-none outline-none text-body-m text-text1 placeholder:text-text2 min-h-[40px] max-h-[160px]"
          rows={1}
          disabled={disabled}
          style={{ color: "var(--color-text-1)", maxHeight: "160px" }}
        />
        <button
          aria-label="Send message"
          onClick={send}
          disabled={disabled || !value.trim()}
          className="rounded-2xl bg-accent px-6 py-2 text-sm font-medium text-white transition-all hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>

      {/* Helper text */}
      <div className="text-xs text-text2 text-center">
        Press <kbd className="px-1.5 py-0.5 rounded bg-surface-1 border border-stroke">Enter</kbd> to send,{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-surface-1 border border-stroke">Shift+Enter</kbd> for newline
      </div>
    </div>
  );
}

