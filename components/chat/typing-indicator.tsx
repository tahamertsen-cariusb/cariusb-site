"use client";

/**
 * Typing indicator component
 * Breathing ring animation (no three dots)
 * 4s cycle, ±3% brightness
 */
export function TypingIndicator() {
  return (
    <div
      className="flex justify-start mb-5"
      style={{ marginBottom: "20px" }}
      role="status"
      aria-live="polite"
      aria-atomic="false"
      aria-label="AI is typing"
    >
      <div
        className="rounded-card px-4 py-3"
        style={{
          backgroundColor: "#12171E",
          border: "1px solid #2C343D",
        }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 animate-breathing"
          style={{
            borderColor: "var(--color-accent)",
            animation: "breathing 4s ease-in-out infinite",
            filter: "brightness(1)",
          }}
        />
      </div>
    </div>
  );
}



