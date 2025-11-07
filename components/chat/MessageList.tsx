"use client";
import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import type { ChatMessage } from "@/lib/chatTypes";

/**
 * MessageList - Stream-compatible message list with auto-scroll
 * Auto-scrolls to bottom when user is at bottom, shows "New messages" chip when scrolled up
 */
export function MessageList({
  messages,
  isTyping = false,
}: {
  messages: ChatMessage[];
  isTyping?: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const endSentinelRef = useRef<HTMLDivElement>(null);
  const [showNewMessagesChip, setShowNewMessagesChip] = useState(false);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

  // Check if user is scrolled up (not at bottom)
  const checkScrollPosition = () => {
    if (!scrollerRef.current) return;
    const { scrollTop, clientHeight, scrollHeight } = scrollerRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 80; // 80px threshold
    setIsUserScrolledUp(!isAtBottom);
    setShowNewMessagesChip(!isAtBottom);
  };

  // Auto-scroll to bottom if user is at bottom
  const scrollToBottom = (behavior: ScrollBehavior = "smooth", force = false) => {
    if (!scrollerRef.current || !endSentinelRef.current) return;
    
    // Check current scroll position
    const { scrollTop, clientHeight, scrollHeight } = scrollerRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 80;
    
    if (force || isAtBottom) {
      endSentinelRef.current.scrollIntoView({ block: "end", behavior });
    }
  };

  // Handle scroll events
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const handleScroll = () => {
      checkScrollPosition();
    };

    scroller.addEventListener("scroll", handleScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll on new messages or typing
  useEffect(() => {
    if (messages.length > 0 || isTyping) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        scrollToBottom("smooth", false);
      });
    }
  }, [messages.length, isTyping]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() => {
        scrollToBottom("auto");
      });
    }
  }, []); // Only on mount

  // Handle "New messages" chip click
  const handleNewMessagesClick = () => {
    scrollToBottom("smooth", true);
    setShowNewMessagesChip(false);
    setIsUserScrolledUp(false);
  };

  return (
    <div
      ref={scrollerRef}
      className="overflow-y-auto overscroll-y-contain scroll-smooth px-4 sm:px-6 lg:px-8 py-6"
      style={{
        backgroundColor: "var(--color-page)",
        WebkitOverflowScrolling: "touch",
      }}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-atomic="false"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <p className="text-body-m text-text2">Ask anything…</p>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              createdAt={msg.createdAt}
            />
          ))}
          {isTyping && <TypingIndicator />}
          {/* End sentinel for scroll anchoring */}
          <div ref={endSentinelRef} id="endSentinel" style={{ contentVisibility: "auto" }} />
        </div>
      )}

      {/* "New messages" chip */}
      {showNewMessagesChip && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={handleNewMessagesClick}
            className="rounded-2xl bg-accent px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-accent/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            aria-label="Scroll to new messages"
          >
            New messages ↓
          </button>
        </div>
      )}
    </div>
  );
}

