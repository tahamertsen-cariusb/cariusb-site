"use client";
import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/common/Button";
import { GlassCard } from "@/components/common/GlassCard";
import { useDomainMode } from "@/lib/domainModeStore";
import { useDeepsearchStore } from "@/store/useDeepsearch";
import { getLang, setStoredMode, setStoredDeepsearch } from "@/lib/utils";
import { useToast } from "@/components/Toast";
import { Toaster } from "@/components/common/Toaster";

type Language = "EN" | "TR";
type Theme = "light" | "dark" | "system";
type DomainMode = "bicycle" | "auto" | "moto" | "tech";
type DeepsearchMode = "auto" | "on" | "off";

/**
 * SettingsForm - Language, theme, default domainMode, default deepsearch (local state only)
 */
export function SettingsForm() {
  const { mode: domainMode, setMode: setDomainMode } = useDomainMode();
  const { mode: deepsearchMode, set: setDeepsearch } = useDeepsearchStore();

  const [language, setLanguage] = useState<Language>(() => {
    const stored = getLang().toUpperCase();
    return (stored === "EN" || stored === "TR" ? stored : "EN") as Language;
  });
  
  const { toast, showToast, hideToast } = useToast();

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    const stored = document.documentElement.getAttribute("data-theme");
    return (stored as Theme) || "system";
  });

  const [defaultDomainMode, setDefaultDomainMode] = useState<DomainMode>(domainMode || "tech");
  const [defaultDeepsearch, setDefaultDeepsearch] = useState<DeepsearchMode>(deepsearchMode || "auto");

  // Sync with store when it changes
  useEffect(() => {
    if (domainMode) {
      setDefaultDomainMode(domainMode);
    }
    if (deepsearchMode) {
      setDefaultDeepsearch(deepsearchMode);
    }
  }, [domainMode, deepsearchMode]);

  const handleSave = () => {
    // Save language
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", language);
    }

    // Save theme
    if (typeof window !== "undefined") {
      if (theme === "system") {
        document.documentElement.removeAttribute("data-theme");
      } else {
        document.documentElement.setAttribute("data-theme", theme);
      }
    }

    // Save domain mode
    setDomainMode(defaultDomainMode);
    if (typeof window !== "undefined") {
      setStoredMode(defaultDomainMode.toUpperCase() as "BICYCLE" | "AUTO" | "MOTO" | "TECH");
    }

    // Save deepsearch
    setDeepsearch(defaultDeepsearch);
    if (typeof window !== "undefined") {
      setStoredDeepsearch(defaultDeepsearch);
    }

    console.log("Settings saved:", {
      language,
      theme,
      defaultDomainMode,
      defaultDeepsearch,
    });
    // Stub: No API call, just local state
    showToast("Saved", "success");
  };

  return (
    <>
      <GlassCard className="p-6">
        <h2 className="text-2xl font-semibold text-text1 mb-6">Settings</h2>

        <div className="space-y-6">
          {/* Language */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-text1 mb-2">
              Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full px-4 py-2 rounded-xl bg-surface-2 border border-stroke text-text1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-label="Select language"
            >
              <option value="EN">English</option>
              <option value="TR">Turkish</option>
            </select>
            {/* Preview badge */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-text2">Current:</span>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-surface-2 text-text1 border border-stroke">
                {language}
              </span>
            </div>
          </div>

          {/* Theme */}
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-text1 mb-2">
              Theme
            </label>
            <select
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
              className="w-full px-4 py-2 rounded-xl bg-surface-2 border border-stroke text-text1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-label="Select theme"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
            {/* Preview badge */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-text2">Current:</span>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-surface-2 text-text1 border border-stroke capitalize">
                {theme}
              </span>
            </div>
          </div>

          {/* Default Domain Mode */}
          <div>
            <label htmlFor="domainMode" className="block text-sm font-medium text-text1 mb-2">
              Default Domain Mode
            </label>
            <select
              id="domainMode"
              value={defaultDomainMode}
              onChange={(e) => setDefaultDomainMode(e.target.value as DomainMode)}
              className="w-full px-4 py-2 rounded-xl bg-surface-2 border border-stroke text-text1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-label="Select default domain mode"
            >
              <option value="tech">Tech</option>
              <option value="auto">Auto</option>
              <option value="moto">Moto</option>
              <option value="bicycle">Bicycle</option>
            </select>
            {/* Preview badge */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-text2">Current:</span>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-surface-2 text-text1 border border-stroke capitalize">
                {defaultDomainMode}
              </span>
            </div>
          </div>

          {/* Default Deepsearch */}
          <div>
            <label htmlFor="deepsearch" className="block text-sm font-medium text-text1 mb-2">
              Default Deepsearch
            </label>
            <select
              id="deepsearch"
              value={defaultDeepsearch}
              onChange={(e) => setDefaultDeepsearch(e.target.value as DeepsearchMode)}
              className="w-full px-4 py-2 rounded-xl bg-surface-2 border border-stroke text-text1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-label="Select default deepsearch mode"
            >
              <option value="auto">Auto</option>
              <option value="on">On</option>
              <option value="off">Off</option>
            </select>
            {/* Preview badge */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-text2">Current:</span>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-surface-2 text-text1 border border-stroke capitalize">
                {defaultDeepsearch}
              </span>
            </div>
          </div>

          {/* Save Button */}
          <Button
            size="lg"
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2"
            aria-label="Save settings"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            <span>Save Settings</span>
          </Button>
        </div>
      </GlassCard>
      <Toaster toast={toast} onClose={hideToast} />
    </>
  );
}

