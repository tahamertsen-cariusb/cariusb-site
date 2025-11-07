"use client";
import { DeepsearchToggle } from "@/components/deepsearch/DeepsearchToggle";
import { useDeepsearchStore } from "@/store/useDeepsearch";
import { useEffect, useState } from "react";
import { getUsage } from "@/lib/usageClient";

/**
 * Chat header component
 * Shows title, deepsearch mode chip, and deepsearch counter
 */
export function ChatHeader() {
  const mode = useDeepsearchStore((state) => state.mode);
  const [usage, setUsage] = useState<{ deepsearch_used: number; deepsearch_limit: number } | null>(null);

  useEffect(() => {
    // Load usage data
    const loadUsage = async () => {
      const data = await getUsage();
      setUsage({
        deepsearch_used: data.deepsearch_used,
        deepsearch_limit: data.deepsearch_limit,
      });
    };
    loadUsage();

    // Refresh usage periodically (every 30 seconds)
    const interval = setInterval(loadUsage, 30000);
    return () => clearInterval(interval);
  }, []);

  const modeLabels: Record<string, string> = {
    off: "Off",
    auto: "Auto",
    on: "On",
  };

  return (
    <div
      className="h-12 flex items-center justify-between border-b px-6"
      style={{
        borderColor: "var(--color-stroke)",
        backgroundColor: "var(--color-surface-1)",
      }}
    >
      {/* Title */}
      <h2 className="text-display-2 font-display text-text1 font-semibold">
        Chat
      </h2>

      {/* Right side: Deepsearch mode chip + counter */}
      <div className="flex items-center gap-4">
        {/* Deepsearch mode chip */}
        <div
          className="flex items-center gap-2 px-2.5 py-1 rounded-btn border text-body-s"
          style={{
            borderColor: "var(--color-stroke)",
            color: "var(--color-text-2)",
          }}
        >
          <span className="text-micro text-text2">DS Mode:</span>
          <span className="text-body-s text-text1 font-medium">
            {modeLabels[mode]}
          </span>
        </div>

        {/* Deepsearch counter */}
        {usage && (
          <div
            className="px-2.5 py-1 rounded-btn border text-body-s"
            style={{
              borderColor: "var(--color-stroke)",
              color: "var(--color-text-2)",
            }}
          >
            <span className="text-micro text-text2">DS: </span>
            <span className="text-body-s text-text1 font-medium">
              {usage.deepsearch_used}/{usage.deepsearch_limit}
            </span>
          </div>
        )}

        {/* Deepsearch toggle */}
        <DeepsearchToggle size="sm" source="chat" />
      </div>
    </div>
  );
}

