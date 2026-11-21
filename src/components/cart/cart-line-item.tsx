"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { formatPrice, cn } from "@/lib/utils";
import { useCart } from "@/stores/cart";
import type { CartLine } from "@/types";

/** Figma: Cart Item — variants: "page" (table row), "drawer" (compact), "summary" (read-only). */
export function CartLineItem({ line, variant = "page", onNavigate }: { line: CartLine; variant?: "page" | "drawer" | "summary"; onNavigate?: () => void }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const thumb = variant === "page" ? "size-20 sm:size-[88px]" : "size-14 sm:size-16";
  const href = `/product/${line.slug}`;

  return (
    <li className={cn("flex items-center gap-3 border-b border-line sm:gap-4", variant === "summary" ? "py-3" : "py-4 sm:py-5", "last:border-b-0")}>
      <Link href={href} onClick={onNavigate} className={cn("relative shrink-0 overflow-hidden rounded-sm bg-cream-100 transition-opacity hover:opacity-85", thumb)}>
        <Image src={line.image.src} alt={line.image.alt} fill sizes="88px" className="object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link href={href} onClick={onNavigate} className="font-display text-[15px] font-semibold leading-snug text-ink hover:text-brown-700 sm:t-h4">
          {line.name}
        </Link>
        <p className="t-body-s text-ink-muted">
          {line.variantLabel}
          {variant !== "page" && <> · Qty {line.quantity}</>}
          {variant === "page" && <span className="md:hidden"> · {formatPrice(line.price)}</span>}
        </p>
        {variant !== "summary" && (
          <div className="flex items-center gap-3 pt-1">
            {variant === "page" && (
              <QuantityStepper size="sm" value={line.quantity} onChange={(v) => setQuantity(line.key, v)} label={`Quantity of ${line.name}`} className="md:hidden" />
            )}
            {variant === "drawer" && (
              <QuantityStepper size="sm" value={line.quantity} onChange={(v) => setQuantity(line.key, v)} label={`Quantity of ${line.name}`} />
            )}
            <button type="button" onClick={() => remove(line.key)} className="inline-flex cursor-pointer items-center gap-1.5 t-caption text-ink-muted hover:text-sale">
              <Trash2 className="size-3.5" aria-hidden /> Remove
            </button>
          </div>
        )}
      </div>
      {variant === "page" && (
        <>
          <span className="hidden w-16 t-body text-ink-soft md:block">{formatPrice(line.price)}</span>
          <QuantityStepper size="sm" value={line.quantity} onChange={(v) => setQuantity(line.key, v)} label={`Quantity of ${line.name}`} className="hidden md:inline-flex" />
        </>
      )}
      <span className={cn("shrink-0 text-right text-brown-700", variant === "page" ? "t-h4 sm:w-24" : "t-label")}>{formatPrice(line.price * line.quantity)}</span>
    </li>
  );
}
