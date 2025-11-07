import type { Conversation, DeepsearchMode } from "@/lib/chat/types";

const USER_KEY = "orb.user";
const MODE_KEY = "orb.mode";
const DEEPSEARCH_KEY = "deepsearch_mode";

export function getSystemPrompt(mode: Conversation["mode"]): string {
  switch (mode) {
    case "TECH":
      return "You are a precise technical consultant. Give clear, concise, technically sound answers.";
    case "AUTO":
      return "You are an automotive expert focusing on cars. Provide mobility insights.";
    case "MOTO":
      return "You are a motorcycle expert. Offer two-wheel mobility guidance.";
    case "BICYCLE":
      return "You are a bicycle expert. Advise with practical, safe, and efficient tips.";
    default:
      return "You are a helpful assistant.";
  }
}

export function isUserLoggedIn(): boolean {
  try {
    return !!localStorage.getItem(USER_KEY);
  } catch {
    return false;
  }
}

export function setUserLoggedIn(user: { id: string; email?: string; plan?: string }) {
  // Store in both 'user' and 'orb.user' for compatibility
  const userData = JSON.stringify(user);
  localStorage.setItem("user", userData);
  localStorage.setItem(USER_KEY, userData);
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("user");
}

export function stableRandomId(len = 10): string {
  const abc = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return s;
}

export function getGuestId(): string {
  if (typeof window === "undefined") return `guest_${stableRandomId()}`;
  const k = "guest_id";
  let v = localStorage.getItem(k);
  if (!v) {
    v = `guest_${stableRandomId()}`;
    localStorage.setItem(k, v);
  }
  return v;
}

export function getUserId(): string {
  // Eğer auth kullanıcı objesini localStorage'da tutuyorsan buradan oku:
  // ör: localStorage.user = JSON.stringify({ email, plan })
  if (typeof window === "undefined") return getGuestId();
  try {
    // Check both 'user' and 'orb.user' for backward compatibility
    const raw = localStorage.getItem("user") || localStorage.getItem(USER_KEY);
    if (!raw) return getGuestId();
    const u = JSON.parse(raw) as { id?: string; email?: string; plan?: string };
    return u?.email || getGuestId();
  } catch {
    return getGuestId();
  }
}

export function getUserPlan(): string {
  if (typeof window === "undefined") return "free";
  try {
    // Check both 'user' and 'orb.user' for backward compatibility
    const raw = localStorage.getItem("user") || localStorage.getItem(USER_KEY);
    if (!raw) return "free";
    const u = JSON.parse(raw) as { id?: string; email?: string; plan?: string };
    return u?.plan || "free";
  } catch {
    return "free";
  }
}

export function getLang(): string {
  if (typeof window === "undefined") return "EN";
  return localStorage.getItem("lang") || "EN";
}

export function getOrCreateSessionId(conversationId: string): string {
  if (typeof window === "undefined") return `sess_${stableRandomId(12)}`;
  const key = `sess:${conversationId}`;
  let v = localStorage.getItem(key);
  if (!v) {
    v = `sess_${stableRandomId(12)}`;
    localStorage.setItem(key, v);
  }
  return v;
}

export function getStoredMode(): Conversation["mode"] {
  try {
    const m = localStorage.getItem(MODE_KEY) as Conversation["mode"] | null;
    return m ?? "TECH";
  } catch {
    return "TECH";
  }
}

export function setStoredMode(m: Conversation["mode"]) {
  localStorage.setItem(MODE_KEY, m);
}

export function getStoredDeepsearch(): DeepsearchMode {
  try {
    const d = localStorage.getItem(DEEPSEARCH_KEY) as DeepsearchMode | null;
    // Validate - must be one of the allowed values
    if (d === "off" || d === "auto" || d === "on") {
      return d;
    }
    return "auto"; // Default fallback
  } catch {
    return "auto"; // SSR or localStorage unavailable
  }
}

export function setStoredDeepsearch(d: DeepsearchMode) {
  try {
    localStorage.setItem(DEEPSEARCH_KEY, d);
  } catch {
    // Silently fail if localStorage unavailable
  }
}

export function nanoid(len = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
  return out;
}

/**
 * Normalize domain mode (client-side)
 * Trim + lowercase + map to valid set: bicycle|auto|moto|tech
 */
export function normalizeMode(v: string | undefined): "bicycle" | "auto" | "moto" | "tech" {
  const k = (v ?? "").trim().toLowerCase();
  return (k === "bicycle" || k === "auto" || k === "moto" || k === "tech") ? k : "tech";
}


