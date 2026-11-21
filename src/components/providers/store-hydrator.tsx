"use client";

import { useEffect } from "react";
import { useCart } from "@/stores/cart";
import { useWishlist } from "@/stores/wishlist";
import { useAuth } from "@/stores/auth";
import { useHydrationFlag } from "@/stores/use-hydrated";

export function StoreHydrator() {
  useEffect(() => {
    Promise.all([useCart.persist.rehydrate(), useWishlist.persist.rehydrate(), useAuth.persist.rehydrate()]).then(() =>
      useHydrationFlag.getState().setReady(),
    );
  }, []);
  return null;
}
