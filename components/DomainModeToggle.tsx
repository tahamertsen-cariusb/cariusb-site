"use client";
import clsx from "clsx";
import { useDomainMode, type DomainMode } from "@/lib/domainModeStore";

const modes: DomainMode[] = ["bicycle", "auto", "moto", "tech"];

const modeLabels: Record<DomainMode, string> = {
  bicycle: "Bicycle",
  auto: "Auto",
  moto: "Moto",
  tech: "Tech",
};

export function DomainModeToggle() {
  const { mode, setMode } = useDomainMode();

  return (
    <div role="tablist" aria-label="Domain mode selector" className="inline-flex items-center gap-2 h-[75.86px]">
      {modes.map((m) => (
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
          onClick={() => setMode(m)}
        >
          {modeLabels[m]}
        </button>
      ))}
    </div>
  );
}



