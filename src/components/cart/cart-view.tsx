"use client";

import Link from "next/link";
import { ChevronLeft, Lock, ShoppingBag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { site } from "@/content/site";
import { formatPrice, whatsappLink } from "@/lib/utils";
import { selectCount, selectSubtotal, useCart } from "@/stores/cart";
import { useHydrated } from "@/stores/use-hydrated";
import { CartLineItem } from "./cart-line-item";
import { PromoCode } from "./promo-code";

/** Figma: Cart page body (items table + order summary). */
export function CartView() {
  const ready = useHydrated();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const count = useCart(selectCount);
  const subtotal = useCart(selectSubtotal);

  if (!ready) {
    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]" aria-busy="true">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-white px-6 py-16 text-center">
        <span className="grid size-20 place-items-center rounded-full bg-cream-100 text-brown-700">
          <ShoppingBag className="size-9" />
        </span>
        <h2 className="t-h3 text-ink">Your cart is empty</h2>
        <p className="t-bn text-ink-soft">পছন্দের স্ন্যাকস খুঁজে কার্টে যোগ করুন।</p>
        <Link href="/shop" className={buttonVariants()}>
          Start Shopping
        </Link>
      </div>
    );
  }

  const waText = `Hello Potato First! I'd like to order:\n${lines.map((l) => `• ${l.name} (${l.variantLabel}) × ${l.quantity}`).join("\n")}\nSubtotal: ${formatPrice(subtotal)}\n\nName:\nAddress:`;

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
      <div className="rounded-md border border-line bg-white p-4 sm:p-7">
        <div className="hidden gap-4 border-b border-line pb-3.5 t-caption text-ink-muted md:flex">
          <span className="flex-1">Product</span>
          <span className="w-16">Price</span>
          <span className="w-[107px]">Quantity</span>
          <span className="w-24 text-right">Total</span>
        </div>
        <ul>
          {lines.map((l) => (
            <CartLineItem key={l.key} line={l} />
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-line pt-5">
          <Link href="/shop" className="inline-flex items-center gap-1.5 t-label text-brown-700 hover:underline">
            <ChevronLeft className="size-4" /> Continue Shopping
          </Link>
          <button type="button" onClick={clear} className="cursor-pointer t-body-s text-ink-muted hover:text-sale">
            Clear cart
          </button>
        </div>
      </div>
      <aside className="flex flex-col gap-4 rounded-md border border-line bg-white p-6 sm:p-7 lg:sticky lg:top-6">
        <h2 className="t-h3 text-ink">Order Summary</h2>
        <div className="flex justify-between t-body text-ink-soft">
          <span>Subtotal ({count} items)</span>
          <span className="t-label text-ink">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between t-body text-ink-soft">
          <span>Delivery</span>
          <span className="t-body-s text-ink-muted">Calculated at checkout</span>
        </div>
        <PromoCode subtotal={subtotal} />
        <div className="h-px bg-line" />
        <div className="flex items-center justify-between">
          <span className="t-h4 text-ink">Total</span>
          <span className="t-h3 text-brown-700">{formatPrice(subtotal)}</span>
        </div>
        <Link href="/checkout" className={buttonVariants({ size: "lg", className: "w-full" })}>
          Proceed to Checkout
        </Link>
        <a href={whatsappLink(site.whatsapp, waText)} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "whatsapp", className: "w-full" })}>
          <WhatsAppIcon /> Order via WhatsApp
        </a>
        <p className="flex items-center justify-center gap-2 t-caption text-ink-soft">
          <Lock className="size-3.5 text-green-600" aria-hidden /> No login needed · Cash on Delivery available
        </p>
      </aside>
    </div>
  );
}
