"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Copy, Package, Phone, Truck } from "lucide-react";
import { toast } from "sonner";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { site } from "@/content/site";
import { parseOrder, readLastOrderRaw } from "@/lib/services/orders";
import { formatPrice, whatsappLink } from "@/lib/utils";
import type { Order } from "@/types";

const PAYMENT = { cod: "Cash on Delivery", bkash: "bKash", online: "Online Payment" } as const;

/** Figma: Order Confirmed. */
export function OrderConfirmation() {
  const id = useSearchParams().get("id");
  const raw = useSyncExternalStore(
    () => () => {},
    () => readLastOrderRaw(),
    () => undefined,
  );
  const order: Order | null | undefined = useMemo(() => (raw === undefined ? undefined : parseOrder(raw, id)), [raw, id]);

  if (order === undefined) return <Skeleton className="mx-auto h-[600px] max-w-3xl" />;

  const orderId = order?.id ?? id ?? "PF-000000";
  const date = order ? new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
      <span className="grid size-[88px] place-items-center rounded-full bg-green-100 text-green-600 animate-in zoom-in-50 duration-500">
        <CheckCircle2 className="size-12" />
      </span>
      <h1 className="t-h1 text-ink">Thank you! Your order is placed.</h1>
      <p className="t-bn text-ink-soft">আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। কনফার্ম করতে আমরা শীঘ্রই আপনাকে কল করব।</p>
      <div className="flex items-center gap-3 rounded-md bg-cream-100 px-4 py-3">
        <span className="t-body-s text-ink-soft">Order ID</span>
        <span className="t-h3 text-brown-700">#{orderId}</span>
        <button
          type="button"
          aria-label="Copy order ID"
          className="grid size-9 cursor-pointer place-items-center rounded-full text-ink-muted hover:bg-white hover:text-ink"
          onClick={() => {
            navigator.clipboard?.writeText(orderId);
            toast("Order ID copied");
          }}
        >
          <Copy className="size-[18px]" />
        </button>
      </div>

      <div className="flex w-full flex-col gap-5 rounded-md border border-line bg-white p-5 text-left sm:p-8">
        {order && (
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Order date", date],
              ["Payment", PAYMENT[order.paymentMethod]],
              ["Delivery", site.delivery[order.deliveryArea].label],
              ["Total", formatPrice(order.total)],
            ].map(([a, b]) => (
              <div key={a}>
                <dt className="t-caption text-ink-muted">{a}</dt>
                <dd className="t-label text-ink">{b}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="h-px bg-line" />
        <h2 className="t-h4 text-ink">What happens next?</h2>
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {[
            { I: Phone, a: "We call to confirm", b: "অর্ডার নিশ্চিত করতে কল" },
            { I: Package, a: "Packed with care", b: "যত্নের সাথে প্যাকিং" },
            { I: Truck, a: "Delivered to you", b: "আপনার ঠিকানায় ডেলিভারি" },
          ].map(({ I, a, b }) => (
            <li key={a} className="flex flex-col gap-2.5 rounded-sm bg-cream-50 p-4">
              <span className="grid size-10 place-items-center rounded-full bg-orange-100 text-orange-600">
                <I className="size-5" aria-hidden />
              </span>
              <span className="t-label text-ink">{a}</span>
              <span className="t-bn-s text-ink-soft">{b}</span>
            </li>
          ))}
        </ol>
        {order && (
          <>
            <div className="h-px bg-line" />
            <h2 className="t-h4 text-ink">Items ({order.lines.reduce((n, l) => n + l.quantity, 0)})</h2>
            <ul>
              {order.lines.map((l) => (
                <CartLineItem key={l.key} line={l} variant="summary" />
              ))}
            </ul>
            <dl className="flex flex-col gap-2">
              <div className="flex justify-between t-body text-ink-soft">
                <dt>Subtotal</dt>
                <dd className="t-label text-ink">{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between t-body text-ink-soft">
                <dt>Delivery</dt>
                <dd className="t-label text-ink">{formatPrice(order.deliveryCharge)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="t-h4 text-ink">{order.paymentMethod === "cod" ? "Total to pay on delivery" : "Total"}</dt>
                <dd className="t-h3 text-brown-700">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href={`/track-order?id=${orderId}`} className={buttonVariants()}>
          Track Order
        </Link>
        <Link href="/shop" className={buttonVariants({ variant: "outline" })}>
          Continue Shopping
        </Link>
      </div>
      <a href={whatsappLink(site.whatsapp, `Hello! I have a question about my order #${orderId}`)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 t-body-s text-ink-soft hover:text-green-600">
        <WhatsAppIcon className="size-[18px] text-whatsapp" /> Questions about your order? Message us on WhatsApp
      </a>
    </div>
  );
}
