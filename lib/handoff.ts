/**
 * Handoff mechanism for landing → chat navigation
 * Stores handoff payload in sessionStorage for one-time consumption
 */

export type HandoffPayload = {
  message: string;
  deepsearch: "auto" | "on" | "off";
  lang: string; // 'en' | 'tr' | 'es' | 'fr' | 'de' | 'it'
  session_id: string; // uuid or nanoid
  user_plan: "guest" | "free" | "pro";
  user_id?: string; // if logged in
  guest_id?: string; // for guest tracking
  domainMode?: "bicycle" | "auto" | "moto" | "tech"; // domain mode for webhook routing
  createdAt: number;
};

const KEY = "chat_handoff_v1";

/**
 * Set handoff payload in sessionStorage
 * Called from landing page before navigation
 */
export function setHandoff(p: Omit<HandoffPayload, "createdAt">): void {
  if (typeof window === "undefined") return;
  
  const payload: HandoffPayload = {
    ...p,
    createdAt: Date.now(),
  };
  
  try {
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch (err) {
    // Silently fail if sessionStorage unavailable
    console.error("Failed to set handoff:", err);
  }
}

/**
 * Consume handoff payload from sessionStorage
 * Returns payload if valid (within 90s), null otherwise
 * Removes payload after consumption (one-time use)
 */
export function consumeHandoff(): HandoffPayload | null {
  if (typeof window === "undefined") return null;
  
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  
  // Remove immediately (one-time use)
  sessionStorage.removeItem(KEY);
  
  try {
    const p = JSON.parse(raw) as HandoffPayload;
    
    // Validate timestamp (90s expiry)
    if (Date.now() - p.createdAt > 90_000) {
      return null;
    }
    
    return p;
  } catch {
    return null;
  }
}


