"use client";
import { useEffect, useRef, useState } from "react";

export function InputBar({ placeholder, onSend, disabled, className, buttonClassName }: { placeholder: string; onSend: (text: string) => void; disabled?: boolean; className?: string; buttonClassName?: string; }) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(160, el.scrollHeight) + "px";
  }, [value]);

  const send = () => {
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setValue("");
  };

  return (
    <div className={"rounded-xl p-2 flex items-end gap-2 border " + (className ?? "glass")}
      style={!className ? undefined : undefined}
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        aria-label="Message input"
        placeholder={placeholder}
        className="flex-1 bg-transparent resize-none outline-none px-2 py-1 placeholder:text-[16px] placeholder:text-[color:var(--muted,theme(colors.muted))] text-foreground"
        rows={1}
        disabled={disabled}
      />
      <button
        aria-label="Send"
        className={(buttonClassName ?? "glass rounded-lg px-3 py-2 text-sm font-medium")}
        onClick={send}
        disabled={disabled}
      >
        Send
      </button>
    </div>
  );
}


