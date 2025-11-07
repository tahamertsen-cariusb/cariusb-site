import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DomainMode = 'bicycle' | 'auto' | 'moto' | 'tech'

interface DomainModeState {
  mode: DomainMode
  setMode: (m: DomainMode) => void
}

export const useDomainMode = create<DomainModeState>()(
  persist(
    (set) => ({
      mode: 'tech',
      setMode: (m: DomainMode) => {
        // Validate mode
        if (m === 'bicycle' || m === 'auto' || m === 'moto' || m === 'tech') {
          set({ mode: m })
        }
      },
    }),
    {
      name: 'domain_mode', // localStorage key
      skipHydration: false, // SSR-safe: hydrate on client
    }
  )
)

