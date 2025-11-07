"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { setHandoff } from "@/lib/handoff";
import { useDeepsearchStore } from "@/store/useDeepsearch";
import { nanoid, normalizeMode } from "@/lib/utils";
import { getLang } from "@/lib/utils";
import { getOrCreateGuestId } from "@/lib/utils/usage";
import { useAuthEmail } from "@/lib/hooks/useAuthEmail";
import { getCurrentPlan } from "@/lib/utils/usage";
import { GlassCard } from "./GlassCard";

type Intent = {
  id: string;
  icon: string;
  label: string;
  micro: string;
  query: string;
};

const INTENTS: Intent[] = [
  {
    id: 'find-product',
    icon: '🔍',
    label: 'Find product for me',
    micro: 'vector analysis',
    query: 'Find the best product for my needs',
  },
  {
    id: 'recommend-lifestyle',
    icon: '💡',
    label: 'Recommend by lifestyle',
    micro: 'pattern decisioning',
    query: 'Recommend products based on my lifestyle',
  },
  {
    id: 'compare-options',
    icon: '⚖️',
    label: 'Compare options',
    micro: 'planet-aligned metrics',
    query: 'Compare different options for me',
  },
  {
    id: 'future-proof',
    icon: '🚀',
    label: 'Future-proof my choice',
    micro: 'TCO & tech horizon',
    query: 'Help me make a future-proof decision',
  },
];

/**
 * Intent suggestion cards component
 * Displays 4 suggestion cards below the input dock
 * On click: sets handoff and navigates to /chat
 */
export function IntentSuggestion() {
  const router = useRouter();
  const deepsearchMode = useDeepsearchStore((state) => state.mode);
  const email = useAuthEmail();
  const [userPlan, setUserPlan] = useState<"guest" | "free" | "pro">("guest");
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [guestId, setGuestId] = useState<string | undefined>(undefined);

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

  const handleClick = (intent: Intent) => {
    // Set handoff and navigate
    const lang = getLang().toLowerCase();
    const sessionId = nanoid();

    setHandoff({
      message: intent.query,
      deepsearch: deepsearchMode,
      lang,
      session_id: sessionId,
      user_plan: userPlan,
      user_id: userId,
      guest_id: guestId,
      domainMode: normalizeMode(undefined), // TODO: get from domain mode toggle/store, normalizeMode ensures "tech" fallback
    });

    router.push("/chat");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 max-w-5xl mx-auto">
      {INTENTS.map((intent) => (
        <GlassCard
          key={intent.id}
          onClick={() => handleClick(intent)}
          className="h-12 flex items-center gap-3 px-4 cursor-pointer hover-glow transition-smooth"
          role="button"
          tabIndex={0}
          aria-label={`${intent.label}: ${intent.micro}`}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick(intent);
            }
          }}
        >
          <span className="text-xl" aria-hidden="true">{intent.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-body-s text-text1 font-medium truncate">
              {intent.label}
            </div>
            <div className="text-micro text-text2 truncate">
              {intent.micro}
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
