"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppHeader } from "@/components/chat/AppHeader";
import { SideNav } from "@/components/chat/SideNav";
import { MessageList } from "@/components/chat/MessageList";
import { Composer } from "@/components/chat/Composer";
import { InfoPanel } from "@/components/chat/InfoPanel";
import { LimitBubble } from "@/components/chat/limit-bubble";
import { Toaster } from "@/components/common/Toaster";
import { consumeHandoff } from "@/lib/handoff";
import { streamChat } from "@/lib/chatClient";
import { getUsage } from "@/lib/usageClient";
import { useDeepsearchStore } from "@/store/useDeepsearch";
import { useChatSessionStore } from "@/store/useChatSession";
import { useDomainMode } from "@/lib/domainModeStore";
import { useAuthEmail } from "@/lib/hooks/useAuthEmail";
import { getOrCreateGuestId } from "@/lib/utils/usage";
import { getLang, nanoid, normalizeMode } from "@/lib/utils";
import { getCurrentPlan } from "@/lib/utils/usage";
import type { ChatMessage, Conversation } from "@/lib/chatTypes";
import { useToast } from "@/components/Toast";

const KEY = "orb.conversations";

function loadAll(): Conversation[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch {
    return [];
  }
}

function saveAll(list: Conversation[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

function getConversation(id: string): Conversation | null {
  return loadAll().find((c) => c.id === id) ?? null;
}

function createConversation({
  mode,
  firstUserMessage,
}: {
  mode: Conversation["mode"];
  firstUserMessage: string;
}): Conversation {
  const list = loadAll();
  const conv: Conversation = {
    id: nanoid(),
    createdAt: Date.now(),
    mode,
    messages: [
      {
        id: nanoid(),
        role: "user",
        content: firstUserMessage,
        createdAt: Date.now(),
      },
    ],
  };
  list.push(conv);
  saveAll(list);
  return conv;
}

function appendMessage(id: string, message: ChatMessage) {
  const list = loadAll();
  const c = list.find((x) => x.id === id);
  if (!c) return;
  c.messages.push(message);
  saveAll(list);
}

function updateMessage(id: string, messageId: string, content: string) {
  const list = loadAll();
  const c = list.find((x) => x.id === id);
  if (!c) return;
  const msg = c.messages.find((m) => m.id === messageId);
  if (msg) {
    msg.content = content;
    saveAll(list);
  }
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center">
          <div className="p-8 text-sm opacity-80">Loading…</div>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}

function ChatPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("c");

  const [conv, setConv] = useState<Conversation | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [usage, setUsage] = useState<{
    deepsearch_used: number;
    deepsearch_limit: number;
  } | null>(null);
  const [showLimitBubble, setShowLimitBubble] = useState(false);

  const email = useAuthEmail();
  const isGuest = !email;
  const deepsearchMode = useDeepsearchStore((state) => state.mode);
  const getSessionId = useChatSessionStore((state) => state.getSessionId);
  const { mode: domainMode, setMode: setDomainMode } = useDomainMode();
  const { toast, showToast, hideToast } = useToast();
  const handoffProcessedRef = useRef(false);

  // Hydrate domain mode from query string ?mode=...
  useEffect(() => {
    const modeParam = params.get("mode");
    if (modeParam) {
      const normalized = normalizeMode(modeParam);
      setDomainMode(normalized);
    }
  }, [params, setDomainMode]);

  // Load conversation from URL
  useEffect(() => {
    if (id) {
      const c = getConversation(id);
      if (c) {
        setConv(c);
      } else {
        // Conversation not found, redirect to landing
        router.push("/");
      }
    }
  }, [id, router]);

  // Load usage data
  useEffect(() => {
    getUsage().then((data) => {
      setUsage({
        deepsearch_used: data.deepsearch_used,
        deepsearch_limit: data.deepsearch_limit,
      });

      // Show limit bubble for guests with deepsearch limit 0
      if (isGuest && data.deepsearch_limit === 0) {
        setShowLimitBubble(true);
      }
    });
  }, [isGuest]);

  // Process handoff on mount (one-time)
  useEffect(() => {
    if (handoffProcessedRef.current) return;
    handoffProcessedRef.current = true;

    const handoff = consumeHandoff();
    if (!handoff) {
      // No handoff - normal chat page (empty or existing conversation)
      return;
    }

    // Update domain mode from handoff
    if (handoff.domainMode) {
      setDomainMode(handoff.domainMode);
    }

    // Create conversation from handoff
    const newConv = createConversation({
      mode: "AUTO", // Default mode
      firstUserMessage: handoff.message,
    });

    // Update URL without navigation
    router.replace(`/chat?c=${newConv.id}`);
    setConv(newConv);

    // Add assistant message placeholder
    const assistantMessageId = nanoid();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      createdAt: Date.now(),
    };
    appendMessage(newConv.id, assistantMessage);
    setConv(getConversation(newConv.id));

    // Start streaming
    setIsStreaming(true);
    setIsTyping(true);

    (async () => {
      try {
        // Use store's session_id for consistency within the same page/tab
        const sessionId = getSessionId();
        
        const stream = streamChat({
          message: handoff.message,
          session_id: sessionId,
          user_plan: handoff.user_plan,
          deepsearch: handoff.deepsearch,
          lang: handoff.lang,
          user_id: handoff.user_id,
          guest_id: handoff.guest_id,
          domainMode: handoff.domainMode || domainMode,
          conversationId: newConv.id,
          mode: newConv.mode,
          messages: newConv.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        });

        for await (const event of stream) {
          if (event.type === "text") {
            // Update assistant message with delta
            const currentConv = getConversation(newConv.id);
            if (currentConv) {
              const msg = currentConv.messages.find((m) => m.id === assistantMessageId);
              if (msg) {
                updateMessage(newConv.id, assistantMessageId, msg.content + event.delta);
                setConv(getConversation(newConv.id));
              }
            }
          } else if (event.type === "done") {
            setIsTyping(false);
            // Refresh usage
            getUsage().then((data) => {
              setUsage({
                deepsearch_used: data.deepsearch_used,
                deepsearch_limit: data.deepsearch_limit,
              });
            });
          } else if (event.type === "error") {
            setIsTyping(false);
            
            if (event.code === "limit_exceeded") {
              showToast("Limit exceeded. Please upgrade your plan.", "error");
              // Show limit bubble for guests
              if (isGuest && event.message?.includes("deepsearch")) {
                setShowLimitBubble(true);
              }
              // Refresh usage
              getUsage().then((data) => {
                setUsage({
                  deepsearch_used: data.deepsearch_used,
                  deepsearch_limit: data.deepsearch_limit,
                });
              });
            } else if (event.code === "upstream_timeout") {
              showToast("Request timed out. Please try again.", "error");
            } else if (event.code === "upstream_failed") {
              showToast("Service temporarily unavailable. Please try again.", "error");
            } else if (event.code === "invalid_request") {
              showToast("Invalid request. Please check your input.", "error");
            } else {
              showToast(event.message || "An error occurred. Please try again.", "error");
            }
          }
        }
      } catch (err: any) {
        setIsTyping(false);
        showToast(err.message || "An error occurred. Please try again.", "error");
      } finally {
        setIsStreaming(false);
        setIsTyping(false);
        setConv(getConversation(newConv.id));
      }
    })();
  }, []); // Only run once on mount

  // Handle manual send (normal chat usage)
  const handleSend = async (message: string) => {
    if (!conv || isStreaming) return;

    setIsStreaming(true);
    setIsTyping(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: nanoid(),
      role: "user",
      content: message,
      createdAt: Date.now(),
    };
    appendMessage(conv.id, userMessage);
    setConv(getConversation(conv.id));

    // Create assistant message placeholder
    const assistantMessageId = nanoid();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      createdAt: Date.now(),
    };
    appendMessage(conv.id, assistantMessage);
    setConv(getConversation(conv.id));

    try {
      // Get user/guest info
      const guestId = isGuest ? getOrCreateGuestId() : null;
      const sessionId = getSessionId();
      const lang = getLang().toLowerCase();
      const plan = await getCurrentPlan();

      // Stream chat
      const stream = streamChat({
        message,
        session_id: sessionId,
        user_plan: plan,
        deepsearch: deepsearchMode,
        lang,
        domainMode: domainMode,
        conversationId: conv.id,
        mode: conv.mode,
        messages: conv.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        user_id: email || undefined,
        guest_id: guestId || undefined,
      });

      for await (const event of stream) {
        if (event.type === "text") {
          // Update assistant message with delta
          const currentConv = getConversation(conv.id);
          if (currentConv) {
            const msg = currentConv.messages.find((m) => m.id === assistantMessageId);
            if (msg) {
              updateMessage(conv.id, assistantMessageId, msg.content + event.delta);
              setConv(getConversation(conv.id));
            }
          }
        } else if (event.type === "done") {
          setIsTyping(false);
          // Refresh usage
          getUsage().then((data) => {
            setUsage({
              deepsearch_used: data.deepsearch_used,
              deepsearch_limit: data.deepsearch_limit,
            });
          });
        } else if (event.type === "error") {
          setIsTyping(false);
          
          if (event.code === "limit_exceeded") {
            showToast("Limit exceeded. Please upgrade your plan.", "error");
            // Show limit bubble for guests
            if (isGuest && event.message?.includes("deepsearch")) {
              setShowLimitBubble(true);
            }
            // Refresh usage
            getUsage().then((data) => {
              setUsage({
                deepsearch_used: data.deepsearch_used,
                deepsearch_limit: data.deepsearch_limit,
              });
            });
          } else if (event.code === "upstream_timeout") {
            showToast("Request timed out. Please try again.", "error");
          } else if (event.code === "upstream_failed") {
            showToast("Service temporarily unavailable. Please try again.", "error");
          } else if (event.code === "invalid_request") {
            showToast("Invalid request. Please check your input.", "error");
          } else {
            showToast(event.message || "An error occurred. Please try again.", "error");
          }
        }
      }
    } catch (err: any) {
      setIsTyping(false);
      showToast(err.message || "An error occurred. Please try again.", "error");
    } finally {
      setIsStreaming(false);
      setIsTyping(false);
      setConv(getConversation(conv.id));
    }
  };

  if (!conv && !handoffProcessedRef.current) {
    // Still processing handoff or loading
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ backgroundColor: "var(--color-page)" }}>
        <div className="p-8 text-sm opacity-80">Loading…</div>
      </div>
    );
  }

  // If no conversation and no handoff, show empty state or redirect
  if (!conv) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ backgroundColor: "var(--color-page)" }}>
        <div className="p-8 text-sm opacity-80">No conversation found</div>
      </div>
    );
  }

  return (
    <div 
      className="grid grid-rows-[auto,1fr,auto] h-[100dvh] min-h-dvh overflow-hidden"
      style={{ backgroundColor: "var(--color-page)" }}
    >
      {/* Row1: Chat-specific header removed - using global header now */}
      
      {/* Row2: Scrollable Message List */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <SideNav />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <MessageList messages={conv.messages} isTyping={isTyping} />
        </div>

        {/* Right Panel (Info) */}
        <InfoPanel />
      </div>

      {/* Row3: Fixed Composer */}
      <div className="border-t bg-background/70 backdrop-blur safe-area-bottom" style={{ borderColor: "var(--color-stroke)" }}>
        <div className="px-4 sm:px-6 lg:px-8 py-4 safe-area-left safe-area-right">
          {showLimitBubble && isGuest && usage?.deepsearch_limit === 0 && (
            <LimitBubble onDismiss={() => setShowLimitBubble(false)} />
          )}
          <Composer
            placeholder="Ask anything…"
            onSend={handleSend}
            disabled={isStreaming}
          />
        </div>
      </div>

      <Toaster toast={toast} onClose={hideToast} />
    </div>
  );
}
