"use client";

import { ShoppingCart } from "lucide-react";
import { selectCount, useCart } from "@/stores/cart";
import { cn } from "@/lib/utils";

export function CartButton({ withLabel }: { withLabel?: boolean }) {
  const count = useCart(selectCount);
  const setOpen = useCart((s) => s.setDrawerOpen);
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
      className={cn("group flex cursor-pointer flex-col items-center gap-1 text-ink", !withLabel && "grid size-10 place-items-center")}
    >
      <span className="relative">
        <ShoppingCart className="size-6 transition-colors group-hover:text-brown-700" aria-hidden />
        <span className="absolute -right-2.5 -top-2 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-orange-500 px-1 font-display text-[10px] font-semibold text-brown-900 tabular-nums">
          {count}
        </span>
      </span>
      {withLabel && <span className="t-caption text-ink-soft group-hover:text-brown-700">Cart</span>}
    </button>
  );
}
