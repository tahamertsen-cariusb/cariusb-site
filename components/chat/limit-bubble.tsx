"use client";
import { useState } from "react";
import Link from "next/link";

/**
 * Limit bubble component
 * Guest deepsearch limit warning (dismissible)
 * Shows above input when guest and deepsearch limit is 0
 */
export function LimitBubble({
  onDismiss,
}: {
  onDismiss?: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) return null;

  return (
    <div
      className="mb-4 rounded-card px-4 py-3 flex items-center justify-between gap-4"
      style={{
        backgroundColor: "var(--color-surface-2)",
        border: "1px solid var(--color-stroke)",
        boxShadow: "var(--shadow-elev-1)",
      }}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-1">
        <p className="text-body-s text-text1">
          Deepsearch unavailable for guests. Create an account to unlock.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/auth/register"
          className="rounded-btn px-3 py-1.5 text-body-s font-medium text-text1 transition-hover focus-ring"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "var(--color-page)",
          }}
        >
          Create account
        </Link>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="w-6 h-6 flex items-center justify-center text-text2 hover:text-text1 transition-hover focus-ring"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </div>
  );
}



