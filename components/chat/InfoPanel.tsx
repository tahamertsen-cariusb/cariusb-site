"use client";
import { useState } from "react";
import { X, Info, Keyboard, Zap } from "lucide-react";
import Link from "next/link";

/**
 * InfoPanel - Collapsible right panel with tips, shortcuts, plan info
 */
export function InfoPanel() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-4 z-40 w-12 h-12 rounded-full bg-accent text-white shadow-lg hover:bg-accent/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        aria-label="Open info panel"
      >
        <Info className="w-5 h-5 mx-auto" />
      </button>
    );
  }

  return (
    <aside className="w-80 border-l bg-surface-1 flex flex-col" style={{ borderColor: "var(--color-stroke)", backgroundColor: "var(--color-surface-1)" }}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "var(--color-stroke)" }}>
        <h2 className="text-lg font-semibold text-text1">Info</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label="Close info panel"
        >
          <X className="w-5 h-5 text-text2" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Tips */}
        <section>
          <h3 className="text-sm font-semibold text-text1 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Tips
          </h3>
          <ul className="space-y-2 text-sm text-text2">
            <li>• Use specific questions for better results</li>
            <li>• Enable Deepsearch for complex queries</li>
            <li>• Switch modes based on your domain</li>
            <li>• Check your plan limits in the sidebar</li>
          </ul>
        </section>

        {/* Keyboard Shortcuts */}
        <section>
          <h3 className="text-sm font-semibold text-text1 mb-3 flex items-center gap-2">
            <Keyboard className="w-4 h-4" />
            Shortcuts
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text2">Send message</span>
              <kbd className="px-2 py-1 rounded bg-surface-2 border border-stroke text-text1">Enter</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text2">New line</span>
              <kbd className="px-2 py-1 rounded bg-surface-2 border border-stroke text-text1">Shift+Enter</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text2">Focus input</span>
              <kbd className="px-2 py-1 rounded bg-surface-2 border border-stroke text-text1">/</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text2">Blur input</span>
              <kbd className="px-2 py-1 rounded bg-surface-2 border border-stroke text-text1">Esc</kbd>
            </div>
          </div>
        </section>

        {/* Plan Info */}
        <section>
          <h3 className="text-sm font-semibold text-text1 mb-3">Plan</h3>
          <div className="rounded-2xl bg-background/50 backdrop-blur border border-white/10 dark:border-white/5 p-4">
            <p className="text-sm text-text2 mb-2">
              Upgrade to Pro for unlimited Deepsearch and faster responses.
            </p>
            <Link
              href="/pricing"
              className="inline-block rounded-2xl bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              View Plans
            </Link>
          </div>
        </section>
      </div>
    </aside>
  );
}


