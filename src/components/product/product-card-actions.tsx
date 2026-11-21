"use client";

import { Check, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "./quantity-stepper";
import { lineKey, useCart } from "@/stores/cart";
import type { CartLine } from "@/types";

type Item = Omit<CartLine, "key" | "quantity">;

/** Add to Cart → becomes "In Cart" state with a stepper (Figma: Product Card › State=In Cart). */
export function ProductCardActions({ item, inStock = true }: { item: Item; inStock?: boolean }) {
  const key = lineKey(item.productId, item.variantId);
  const qty = useCart((s) => s.lines.find((l) => l.key === key)?.quantity ?? 0);
  const add = useCart((s) => s.add);
  const setQuantity = useCart((s) => s.setQuantity);
  const setDrawerOpen = useCart((s) => s.setDrawerOpen);

  if (!inStock) {
    return (
      <Button variant="light" className="w-full" disabled>
        Out of stock
      </Button>
    );
  }

  if (qty > 0) {
    return (
      <div className="flex items-center gap-2">
        <QuantityStepper size="sm" value={qty} min={0} onChange={(v) => setQuantity(key, v)} label={`Quantity of ${item.name}`} />
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex h-[38px] min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-sm bg-green-100 t-label text-green-600 hover:bg-green-500 hover:text-white"
        >
          <Check className="size-4 shrink-0" /> <span className="truncate">In Cart</span>
        </button>
      </div>
    );
  }

  return (
    <Button
      className="w-full max-sm:h-10 max-sm:px-2 max-sm:text-sm group-hover/card:bg-orange-500 group-hover/card:text-brown-900 hover:!bg-brown-900 hover:!text-white"
      onClick={() => {
        add(item);
        toast.success("Added to cart", {
          description: `${item.name} · ${item.variantLabel}`,
          action: { label: "View cart", onClick: () => setDrawerOpen(true) },
        });
      }}
    >
      <ShoppingCart className="max-[380px]:hidden" /> Add to Cart
    </Button>
  );
}
