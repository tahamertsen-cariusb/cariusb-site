import { create } from 'zustand';

interface ChatSessionStore {
  session_id: string | null;
  getSessionId: () => string;
  resetSessionId: () => void;
}

/**
 * Chat session store - manages session_id per page/tab lifetime
 * Uses sessionStorage for persistence across page navigations
 * Resets on full page reload or new tab
 */
export const useChatSessionStore = create<ChatSessionStore>((set, get) => {
  // Initialize session_id from sessionStorage or generate new one
  const initializeSessionId = (): string => {
    if (typeof window === 'undefined') {
      // SSR: generate a temporary ID (won't be used on client)
      return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }

    try {
      const existing = sessionStorage.getItem('cariusb_session_id');
      if (existing) {
        return existing;
      }
    } catch (e) {
      // sessionStorage might be unavailable (private browsing, etc.)
      console.warn('sessionStorage unavailable, using in-memory session_id');
    }

    // Generate new session_id
    const newSessionId = crypto.randomUUID();
    try {
      sessionStorage.setItem('cariusb_session_id', newSessionId);
    } catch (e) {
      // sessionStorage might be unavailable
    }
    return newSessionId;
  };

  return {
    session_id: null, // Will be initialized on first access
    getSessionId: () => {
      const state = get();
      // Always check sessionStorage first to ensure consistency
      // This handles cases where sessionStorage exists but store state was reset
      if (typeof window !== 'undefined') {
        try {
          const stored = sessionStorage.getItem('cariusb_session_id');
          if (stored) {
            // If store state doesn't match sessionStorage, update it
            if (state.session_id !== stored) {
              set({ session_id: stored });
            }
            return stored;
          }
        } catch (e) {
          // sessionStorage unavailable, fall through to initialization
        }
      }
      
      // Use existing store state if available (fallback for SSR or when sessionStorage unavailable)
      if (state.session_id) {
        return state.session_id;
      }

      // Initialize on first access
      const sessionId = initializeSessionId();
      set({ session_id: sessionId });
      return sessionId;
    },
    resetSessionId: () => {
      const newSessionId = typeof window !== 'undefined' 
        ? crypto.randomUUID() 
        : `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('cariusb_session_id');
          sessionStorage.setItem('cariusb_session_id', newSessionId);
        }
      } catch (e) {
        // sessionStorage might be unavailable
      }
      
      set({ session_id: newSessionId });
    },
  };
});

