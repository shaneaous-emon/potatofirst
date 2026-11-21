"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Customer = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  provider: "password" | "google" | "facebook";
};

type AuthState = {
  user: Customer | null;
  setUser: (u: Customer | null) => void;
};

/**
 * Signed-in customer (mock session). Phase 2: Laravel Sanctum session cookie;
 * this store only mirrors `GET /api/me`.
 */
export const useAuth = create<AuthState>()(
  persist((set) => ({ user: null, setUser: (user) => set({ user }) }), {
    name: "pf-auth",
    storage: createJSONStorage(() => localStorage),
    skipHydration: true,
  }),
);
