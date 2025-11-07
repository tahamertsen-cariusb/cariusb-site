import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DeepsearchMode } from '@/lib/chat/types';

interface DeepsearchStore {
  mode: DeepsearchMode;
  set: (mode: DeepsearchMode) => void;
  get: () => DeepsearchMode;
}

export const useDeepsearchStore = create<DeepsearchStore>()(
  persist(
    (set, get) => ({
      mode: 'auto',
      set: (mode: DeepsearchMode) => {
        // Validate mode
        if (mode === 'off' || mode === 'auto' || mode === 'on') {
          set({ mode });
        }
      },
      get: () => {
        const state = get();
        return state.mode;
      },
    }),
    {
      name: 'deepsearch_mode', // localStorage key
      // SSR-safe: only hydrate on client
      skipHydration: false,
    }
  )
);

// Hook for easy access
export function useDeepsearch() {
  const mode = useDeepsearchStore((state) => state.mode);
  const set = useDeepsearchStore((state) => state.set);
  return [mode, set] as const;
}




