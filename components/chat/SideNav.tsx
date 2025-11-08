"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDomainMode, type DomainMode } from "@/lib/domainModeStore";
import { getCurrentPlan } from "@/lib/utils/usage";
import { nanoid } from "@/lib/utils";
import type { Conversation } from "@/lib/chatTypes";

const KEY = "orb.conversations";

function loadAll(): Conversation[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch {
    return [];
  }
}

const modeLabels: Record<DomainMode, string> = {
  bicycle: "Bicycle",
  auto: "Auto",
  moto: "Moto",
  tech: "Tech",
};

/**
 * SideNav - Sidebar with session list, plan badge, mode shortcuts
 */
export function SideNav() {
  const router = useRouter();
  const params = useSearchParams();
  const currentId = params.get("c");
  const { mode, setMode } = useDomainMode();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [plan, setPlan] = useState<"guest" | "free" | "pro">("guest");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    getCurrentPlan().then(setPlan);
    setConversations(loadAll());
    
    // Listen for storage changes (new conversations)
    const handleStorageChange = () => {
      setConversations(loadAll());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleNewChat = () => {
    router.push("/chat");
  };

  const handleModeClick = (newMode: DomainMode) => {
    setMode(newMode);
    router.push(`/chat?mode=${newMode}`);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (!mounted) {
    return (
      <aside className="w-64 border-r bg-surface-1" style={{ borderColor: "var(--color-stroke)", backgroundColor: "var(--color-surface-1)" }}>
        <div className="p-4">Loading...</div>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-r bg-surface-1 flex flex-col" style={{ borderColor: "var(--color-stroke)", backgroundColor: "var(--color-surface-1)" }}>
      {/* Plan Badge */}
      <div className="p-4 border-b" style={{ borderColor: "var(--color-stroke)" }}>
        <div className="rounded-2xl bg-background/50 backdrop-blur border border-white/10 dark:border-white/5 px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text2">Plan</span>
            <span className="text-sm font-medium text-text1 capitalize">{plan}</span>
          </div>
        </div>
      </div>

      {/* Domain Mode Quick Select */}
      <div className="p-4 border-b" style={{ borderColor: "var(--color-stroke)" }}>
        <h3 className="text-xs font-semibold text-text2 uppercase tracking-wider mb-3">Mode</h3>
        <div className="flex flex-wrap gap-2">
          {(["bicycle", "auto", "moto", "tech"] as DomainMode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeClick(m)}
              className={`rounded-2xl px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                mode === m
                  ? "bg-accent text-white"
                  : "bg-surface-2 text-text2 hover:text-text1"
              }`}
              style={
                mode === m
                  ? {}
                  : {
                      backgroundColor: "var(--color-surface-2)",
                      color: "var(--color-text-2)",
                    }
              }
              aria-pressed={mode === m}
              aria-label={`Switch to ${modeLabels[m]} mode`}
            >
              {modeLabels[m]}
            </button>
          ))}
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b" style={{ borderColor: "var(--color-stroke)" }}>
        <button
          onClick={handleNewChat}
          className="w-full rounded-2xl bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label="New chat"
        >
          New Chat
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-xs font-semibold text-text2 uppercase tracking-wider mb-3">Recent</h3>
          {conversations.length === 0 ? (
            <p className="text-sm text-text2">No conversations yet</p>
          ) : (
            <div className="space-y-2">
              {conversations
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, 10)
                .map((conv) => {
                  const firstMessage = conv.messages.find((m) => m.role === "user");
                  const title = firstMessage?.content.slice(0, 50) || "New conversation";
                  const isActive = conv.id === currentId;

                  return (
                    <Link
                      key={conv.id}
                      href={`/chat?c=${conv.id}`}
                      className={`block rounded-2xl px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                        isActive
                          ? "bg-accent/20 text-text1"
                          : "bg-surface-2 text-text2 hover:text-text1 hover:bg-surface-2/80"
                      }`}
                      style={
                        isActive
                          ? {}
                          : {
                              backgroundColor: "var(--color-surface-2)",
                              color: "var(--color-text-2)",
                            }
                      }
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div className="truncate font-medium">{title}</div>
                      <div className="text-xs opacity-70 mt-1">{formatDate(conv.createdAt)}</div>
                    </Link>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}



