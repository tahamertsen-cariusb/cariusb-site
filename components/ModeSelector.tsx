"use client";
import clsx from "clsx";
import type { Conversation } from "@/lib/chat/types";

const modes: Conversation["mode"][] = ["BICYCLE", "AUTO", "MOTO", "TECH"];

export function ModeSelector({ mode, onChange }: { mode: Conversation["mode"]; onChange: (m: Conversation["mode"]) => void; }) {
  return (
    <div role="tablist" aria-label="Mode selector" className="inline-flex items-center gap-2 h-[75.86px]">
      {modes.map((m, idx) => (
        <button
          key={m}
          role="tab"
          aria-selected={mode === m}
          tabIndex={mode === m ? 0 : -1}
          className={clsx(
            "rounded-[8px] border w-[76px] h-[43px] text-[16px]",
            mode === m
              ? "text-white border-[rgba(75,183,255,0.7)]"
              : "text-muted hover:text-foreground border-border bg-panel text-center"
          )}
          onClick={() => onChange(m)}
        >
          {m}
        </button>
      ))}
    </div>
  );
}


