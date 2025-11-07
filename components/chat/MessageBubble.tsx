"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { Role } from "@/lib/chatTypes";

/**
 * MessageBubble - User/Assistant variants with timestamp, copy button, code block render
 */
export function MessageBubble({
  role,
  content,
  createdAt,
}: {
  role: Role;
  content: string;
  createdAt?: number;
}) {
  const isUser = role === "user";
  const isAI = role === "assistant";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Simple markdown code block detection
  const renderContent = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: Array<{ type: "text" | "code"; content: string; lang?: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
      }
      parts.push({
        type: "code",
        content: match[2],
        lang: match[1] || "",
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({ type: "text", content: text.slice(lastIndex) });
    }

    if (parts.length === 0) {
      return <div className="whitespace-pre-wrap">{text}</div>;
    }

    return (
      <div>
        {parts.map((part, idx) => {
          if (part.type === "code") {
            return (
              <pre
                key={idx}
                className="mt-2 mb-2 p-4 rounded-2xl bg-surface-1 border border-stroke overflow-x-auto"
                style={{
                  backgroundColor: "var(--color-surface-1)",
                  borderColor: "var(--color-stroke)",
                }}
              >
                <code className="text-sm font-code">{part.content}</code>
              </pre>
            );
          }
          return (
            <span key={idx} className="whitespace-pre-wrap">
              {part.content}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}
    >
      <div
        className={`group relative max-w-[720px] lg:max-w-[760px] rounded-2xl px-4 py-3 text-body-m leading-6 ${
          isUser ? "bg-accent text-white" : "bg-background/50 backdrop-blur border border-white/10 dark:border-white/5"
        }`}
        style={
          isUser
            ? {}
            : {
                backgroundColor: "var(--color-surface-2)",
                color: "var(--color-text-1)",
                borderColor: "var(--color-stroke)",
              }
        }
      >
        {/* Content */}
        <div className="pr-8">{renderContent(content)}</div>

        {/* Copy Button & Timestamp */}
        <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {createdAt && (
            <span className="text-xs text-text2 opacity-70">
              {formatTime(createdAt)}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            aria-label="Copy message"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-text2" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


