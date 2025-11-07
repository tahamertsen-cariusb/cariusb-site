"use client";
import type { Conversation } from "@/lib/chat/types";
import { getStoredMode, setStoredMode, nanoid, getLang } from "@/lib/utils";
import { supabase } from '@/lib/supabaseClient';
import { useDeepsearchStore } from "@/store/useDeepsearch";
import { useChatSessionStore } from "@/store/useChatSession";

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

export function getAllConversations(): Conversation[] {
  return loadAll().sort((a, b) => b.createdAt - a.createdAt);
}

export function getConversation(id: string): Conversation | null {
  return loadAll().find((c) => c.id === id) ?? null;
}

export function createConversation({ mode, firstUserMessage }: { mode: Conversation["mode"]; firstUserMessage: string; }): Conversation {
  setStoredMode(mode);
  const list = loadAll();
  const conv: Conversation = {
    id: nanoid(),
    createdAt: Date.now(),
    mode,
    messages: [{ role: "user", content: firstUserMessage }]
  };
  list.push(conv);
  saveAll(list);
  return conv;
}

export function appendUserMessage(id: string, content: string) {
  const list = loadAll();
  const c = list.find((x) => x.id === id);
  if (!c) return;
  c.messages.push({ role: "user", content });
  saveAll(list);
}

export async function appendAssistantStreamToConversation(
  id: string,
  streamCallback: (controller: ReadableStreamDefaultController<string>) => Promise<void>
) {
  const list = loadAll();
  const c = list.find((x) => x.id === id);
  if (!c) throw new Error("Conversation not found");
  c.messages.push({ role: "assistant", content: "" });
  saveAll(list);

  const stream = new ReadableStream<string>({
    async start(controller) {
      await streamCallback(controller);
    }
  });

  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let done = false;
  while (!done) {
    const { value, done: rd } = await reader.read();
    done = rd;
    if (value) {
      const list2 = loadAll();
      const c2 = list2.find((x) => x.id === id);
      if (!c2) continue;
      const last = c2.messages[c2.messages.length - 1];
      if (last && last.role === "assistant") last.content += value as unknown as string;
      saveAll(list2);
    }
  }
}

async function getEmailAndPlan() {
  const { data: s } = await supabase.auth.getSession();
  const email = s.session?.user?.email ?? null;
  const uid = s.session?.user?.id ?? null;
  
  if (!email || !uid) {
    // Guest user - return guest_id and 'guest' plan
    const { getOrCreateGuestId } = await import('@/lib/utils/usage');
    const guestId = getOrCreateGuestId();
    return { user_id: guestId, user_plan: 'guest', is_guest: true };
  }

  // Authenticated user - IMPORTANT: query by user_id to satisfy RLS
  const { data: prof } = await supabase.from('profiles').select('plan').eq('user_id', uid).maybeSingle();
  const plan = prof?.plan || 'free';
  // Validate plan type
  const validPlan = (plan === 'guest' || plan === 'free' || plan === 'pro') ? plan : 'free';
  return { user_id: email, user_plan: validPlan, is_guest: false, user_id_raw: uid };
}

export async function sendChat({ 
  conversationId, 
  mode, 
  messages,
}: {
  conversationId: string;
  mode: 'BICYCLE'|'AUTO'|'MOTO'|'TECH';
  messages: { role:'user'|'assistant'|'system'; content:string }[];
}) {
  const lastUser = [...messages].reverse().find(m => m.role === 'user');
  const message = lastUser?.content || '';
  const { user_id, user_plan, is_guest, user_id_raw } = await getEmailAndPlan();
  const lang = (typeof window !== 'undefined' && localStorage.getItem('lang')) || 'EN';
  
  // Get session_id from store (persistent across page/tab lifetime)
  const session_id = useChatSessionStore.getState().getSessionId();

  // Get deepsearch from global store
  const deepsearch = useDeepsearchStore.getState().get();

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      conversationId, mode, messages,
      message, user_id, session_id, lang,
      deepsearch, user_plan,
      is_guest: is_guest || false,
      user_id_raw: user_id_raw || null,
    }),
  });
  
  if (!res.ok) {
    // Handle limit exceeded error
    if (res.status === 402) {
      const errorData = await res.json().catch(() => ({}));
      const error = new Error(errorData.error || 'limit_exceeded');
      // Attach error details for error handling
      (error as any).type = errorData.type || 'messages';
      (error as any).plan = errorData.plan;
      (error as any).usage = errorData.usage;
      (error as any).limit = errorData.limit;
      throw error;
    }
    throw new Error(`Network error: ${res.status}`);
  }
  
  if (!res.body) throw new Error("Network error: no response body");
  return res.body.getReader();
}

export function setConversationMode(id: string, mode: Conversation["mode"]) {
  const list = loadAll();
  const c = list.find((x) => x.id === id);
  if (!c) return;
  c.mode = mode;
  saveAll(list);
  setStoredMode(mode);
}

export function isUserLoggedIn(): boolean {
  // Sync check for backward compatibility
  // For real-time auth state, use useAuthEmail hook in components
  try {
    // Check localStorage for legacy support
    if (localStorage.getItem("orb.user")) return true;
    // In browser, we can't check Supabase session synchronously
    // This function is kept for backward compatibility
    return false;
  } catch {
    return false;
  }
}


