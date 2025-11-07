"use client";
import type { Role } from "@/lib/chatTypes";

/**
 * Message bubble component
 * AI and User variants with proper styling
 */
export function MessageBubble({
  role,
  content,
}: {
  role: Role;
  content: string;
}) {
  const isUser = role === "user";
  const isAI = role === "assistant";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-5`}
      style={{ marginBottom: "20px" }}
    >
      <div
        className={`max-w-[720px] lg:max-w-[760px] rounded-card px-4 py-3 text-body-m leading-6 ${
          isUser ? "" : ""
        }`}
        style={{
          backgroundColor: isUser ? "#1E2530" : "#12171E",
          border: "1px solid #2C343D",
          color: "var(--color-text-1)",
          boxShadow: isAI
            ? "0 8px 32px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.05)"
            : "0 8px 32px rgba(0,0,0,0.22)",
        }}
      >
        {content}
      </div>
    </div>
  );
}



