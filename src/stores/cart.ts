"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartLine } from "@/types";

type AddInput = Omit<CartLine, "key" | "quantity"> & { quantity?: number };

type CartState = {
  lines: CartLine[];
  drawerOpen: boolean;
  /** true when the drawer was opened by an add-to-cart action */
  justAdded: boolean;
  add: (item: AddInput, opts?: { openDrawer?: boolean }) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setDrawerOpen: (open: boolean) => void;
};

export const lineKey = (productId: string, variantId: string) => `${productId}:${variantId}`;
const MAX_QTY = 99;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      drawerOpen: false,
      justAdded: false,
      add: (item, opts) =>
        set((s) => {
          const key = lineKey(item.productId, item.variantId);
          const qty = item.quantity ?? 1;
          const existing = s.lines.find((l) => l.key === key);
          const lines = existing
            ? s.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + qty) } : l))
            : [...s.lines, { ...item, key, quantity: qty }];
          return opts?.openDrawer ? { lines, drawerOpen: true, justAdded: true } : { lines };
        }),
      setQuantity: (key, quantity) =>
        set((s) => ({
          lines:
            quantity <= 0
              ? s.lines.filter((l) => l.key !== key)
              : s.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QTY, quantity) } : l)),
        })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
      setDrawerOpen: (drawerOpen) => set({ drawerOpen, justAdded: false }),
    }),
    {
      name: "pf-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
      skipHydration: true,
    },
  ),
);

export const selectCount = (s: CartState) => s.lines.reduce((n, l) => n + l.quantity, 0);
export const selectSubtotal = (s: CartState) => s.lines.reduce((n, l) => n + l.price * l.quantity, 0);
