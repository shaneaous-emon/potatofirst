"use client";

import { create } from "zustand";

/**
 * Persisted stores use `skipHydration` so server and first client render
 * match. <StoreHydrator/> rehydrates them after mount and flips this flag,
 * which pages use to show a skeleton instead of a false "empty" state.
 */
export const useHydrationFlag = create<{ ready: boolean; setReady: () => void }>()((set) => ({
  ready: false,
  setReady: () => set({ ready: true }),
}));

export const useHydrated = () => useHydrationFlag((s) => s.ready);
