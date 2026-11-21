"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type WishlistState = {
  ids: string[];
  toggle: (productId: string) => boolean;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const exists = get().ids.includes(id);
        set({ ids: exists ? get().ids.filter((x) => x !== id) : [...get().ids, id] });
        return !exists;
      },
      remove: (id) => set({ ids: get().ids.filter((x) => x !== id) }),
      has: (id) => get().ids.includes(id),
    }),
    { name: "pf-wishlist", storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);
