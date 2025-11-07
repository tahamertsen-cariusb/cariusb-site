"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { setHandoff } from "@/lib/handoff";
import { useDeepsearchStore } from "@/store/useDeepsearch";
import { useDomainMode } from "@/lib/domainModeStore";
import { nanoid } from "@/lib/utils";
import { getLang } from "@/lib/utils";
import { getOrCreateGuestId } from "@/lib/utils/usage";
import { useAuthEmail } from "@/lib/hooks/useAuthEmail";
import { getCurrentPlan } from "@/lib/utils/usage";

/**
 * Hero Input Dock component
 * 56px height, glass surface, precise stroke
 * Focus: 1px accent inner stroke + faint outer glow
 * On send: sets handoff and navigates to /chat
 */
export function HeroInputDock({
  placeholder = "Ask anything…",
  disabled = false,
  className = "",
}: {
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [userPlan, setUserPlan] = useState<"guest" | "free" | "pro">("guest");
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [guestId, setGuestId] = useState<string | undefined>(undefined);
  const ref = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const deepsearchMode = useDeepsearchStore((state) => state.mode);
  const { mode: domainMode } = useDomainMode();
  const email = useAuthEmail();

  // Load user plan and IDs
  useEffect(() => {
    const loadUserData = async () => {
      const plan = await getCurrentPlan();
      setUserPlan(plan);
      
      if (email) {
        // Authenticated user
        setUserId(email);
        setGuestId(undefined);
      } else {
        // Guest user
        setGuestId(getOrCreateGuestId());
        setUserId(undefined);
      }
    };
    loadUserData();
  }, [email]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(160, el.scrollHeight) + "px";
  }, [value]);

  const send = () => {
    const text = value.trim();
    if (!text || disabled) return;

    // Set handoff and navigate
    const lang = getLang().toLowerCase();
    const sessionId = nanoid();

    setHandoff({
      message: text,
      deepsearch: deepsearchMode,
      lang,
      session_id: sessionId,
      user_plan: userPlan,
      user_id: userId,
      guest_id: guestId,
      domainMode: domainMode,
    });

    router.push(`/chat?mode=${domainMode}`);
    setValue("");
  };

  return (
    <div
      className={`relative rounded-card flex items-center gap-3 px-4 transition-smooth ${className}`}
      style={{
        height: '56px',
        backgroundColor: 'var(--color-surface-2)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${isFocused ? 'var(--color-accent)' : 'var(--color-stroke)'}`,
        boxShadow: isFocused 
          ? 'var(--shadow-glow-accent), var(--shadow-inner)' 
          : 'var(--shadow-inner)',
      }}
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label="Message input"
        placeholder={placeholder}
        className="flex-1 bg-transparent resize-none outline-none text-body-m text-text1 placeholder:text-text2"
        rows={1}
        disabled={disabled}
        style={{ color: 'var(--color-text-1)' }}
      />
      <button
        aria-label="Send"
        onClick={send}
        disabled={disabled || !value.trim()}
        className="rounded-btn px-4 py-2 text-body-s font-medium text-text1 transition-hover focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-page)',
        }}
      >
        Send
      </button>
    </div>
  );
}
