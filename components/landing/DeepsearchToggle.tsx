"use client";
import { useRouter } from "next/navigation";
import { useDomainMode } from "@/lib/domainModeStore";
import { useDeepsearchStore } from "@/store/useDeepsearch";
import { DeepsearchToggle as BaseDeepsearchToggle } from "@/components/deepsearch/DeepsearchToggle";

/**
 * DeepsearchToggle - Landing page version
 * UI-only toggle that redirects to /chat with deepsearch param
 */
export function DeepsearchToggle() {
  const router = useRouter();
  const { mode } = useDomainMode();
  const deepsearch = useDeepsearchStore((state) => state.mode);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-2xl font-display font-semibold text-text1">
          Deepsearch Mode
        </h2>
        <BaseDeepsearchToggle size="md" source="landing" />
        <p className="text-sm text-text2 text-center max-w-md">
          Enable advanced search capabilities. Auto mode enables based on content
          complexity.
        </p>
        <p className="text-xs text-text2 text-center max-w-md mt-2">
          Current: {deepsearch} | Mode: {mode || "tech"}
        </p>
      </div>
    </div>
  );
}

