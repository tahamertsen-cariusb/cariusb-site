"use client";
import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import type { ChatMessage } from "@/lib/chatTypes";

/**
 * Message list component
 * Auto-scrolls to bottom on new messages
 */
export function MessageList({
  messages,
  isTyping = false,
}: {
  messages: ChatMessage[];
  isTyping?: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollerRef.current) {
      scrollerRef.current.scrollTo({
        top: scrollerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length, isTyping]);

  return (
    <div
      ref={scrollerRef}
      className="flex-1 overflow-y-auto px-6 py-4"
      style={{
        backgroundColor: "var(--color-page)",
      }}
      aria-live="polite"
      aria-atomic="false"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-body-m text-text2">Ask anything…</p>
        </div>
      ) : (
        <>
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
            />
          ))}
          {isTyping && <TypingIndicator />}
        </>
      )}
    </div>
  );
}



