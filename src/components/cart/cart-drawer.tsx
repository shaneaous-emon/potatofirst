"use client";

import Link from "next/link";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { selectCount, selectSubtotal, useCart } from "@/stores/cart";
import { CartLineItem } from "./cart-line-item";
import { Bn } from "@/components/common/bn";

/** Figma: Added to Cart — Drawer (overlay). Global, opened from anywhere via the cart store. */
export function CartDrawer() {
  const open = useCart((s) => s.drawerOpen);
  const justAdded = useCart((s) => s.justAdded);
  const setOpen = useCart((s) => s.setDrawerOpen);
  const lines = useCart((s) => s.lines);
  const count = useCart(selectCount);
  const subtotal = useCart(selectSubtotal);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right">
        <div className="flex items-center gap-2.5 border-b border-line px-6 py-5 pr-16">
          {justAdded ? <CheckCircle2 className="size-[22px] text-green-600" aria-hidden /> : <ShoppingBag className="size-[22px] text-brown-700" aria-hidden />}
          <SheetTitle className="t-h4 text-ink">{justAdded ? "Added to your cart" : `Your Cart (${count})`}</SheetTitle>
        </div>
        <SheetDescription className="sr-only">Items in your shopping cart</SheetDescription>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-cream-100 text-brown-700">
              <ShoppingBag className="size-7" />
            </span>
            <p className="t-h4 text-ink">Your cart is empty</p>
            <Bn className="t-bn-s text-ink-soft">পছন্দের স্ন্যাকস কার্টে যোগ করুন</Bn>
            <Link href="/shop" onClick={close} className={buttonVariants()}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6">
              {lines.map((l) => (
                <CartLineItem key={l.key} line={l} variant="drawer" onNavigate={close} />
              ))}
            </ul>
            <div className="flex flex-col gap-3.5 bg-cream-100 p-6">
              <div className="flex items-center justify-between">
                <span className="t-body text-ink-soft">Subtotal</span>
                <span className="t-h3 text-brown-700">{formatPrice(subtotal)}</span>
              </div>
              <p className="t-caption text-ink-muted">Delivery charge is added at checkout.</p>
              <Link href="/checkout" onClick={close} className={buttonVariants({ size: "lg", className: "w-full" })}>
                Checkout
              </Link>
              <Link href="/cart" onClick={close} className={buttonVariants({ variant: "outline", className: "w-full" })}>
                View Cart
              </Link>
              <button type="button" onClick={close} className="cursor-pointer self-center t-label text-brown-700 hover:underline">
                Continue shopping
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
