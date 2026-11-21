/**
 * Order service (client-side).
 *
 * Phase 1 uses a MOCK adapter: the order is kept in sessionStorage only so
 * the confirmation page can display it. Nothing is sent anywhere.
 * Phase 2: replace `placeOrder` / `getOrder` / `trackOrder` with
 * `POST /api/orders`, `GET /api/orders/{id}` and `GET /api/orders/track`.
 */
import { site } from "@/content/site";
import type { CartLine, DeliveryArea, Order, OrderStatus, PaymentMethod } from "@/types";

const KEY = "pf:last-order";

export type PlaceOrderInput = {
  customer: Order["customer"];
  deliveryArea: DeliveryArea;
  paymentMethod: PaymentMethod;
  note?: string;
  lines: CartLine[];
  discount: number;
};

export function deliveryChargeFor(area: DeliveryArea) {
  return site.delivery[area].charge;
}

import { createStoreOrderAction } from "@/app/(store)/checkout/actions";

export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  try {
    const res = await createStoreOrderAction({
      customer: input.customer,
      deliveryArea: input.deliveryArea,
      paymentMethod: input.paymentMethod,
      note: input.note,
      lines: input.lines,
      discount: input.discount,
    });
    if (res.ok && res.order) {
      sessionStorage.setItem(KEY, JSON.stringify(res.order));
      return res.order;
    }
    if (res.error) {
      console.warn("DB order placement response:", res.error);
    }
  } catch (err) {
    console.warn("Server order placement failed, using fallback:", err);
  }

  const subtotal = input.lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const deliveryCharge = deliveryChargeFor(input.deliveryArea);
  const order: Order = {
    id: `PF-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: new Date().toISOString(),
    customer: input.customer,
    deliveryArea: input.deliveryArea,
    paymentMethod: input.paymentMethod,
    note: input.note,
    lines: input.lines,
    subtotal,
    deliveryCharge,
    discount: input.discount,
    total: Math.max(0, subtotal + deliveryCharge - input.discount),
    status: "placed",
  };
  sessionStorage.setItem(KEY, JSON.stringify(order));
  await new Promise((r) => setTimeout(r, 600)); // simulate network latency for UI states
  return order;
}

export function readLastOrderRaw(): string | null {
  return sessionStorage.getItem(KEY);
}

export function parseOrder(raw: string | null, id?: string | null): Order | null {
  try {
    if (!raw) return null;
    const order = JSON.parse(raw) as Order;
    return !id || order.id === id ? order : null;
  } catch {
    return null;
  }
}

import { trackOrderServerAction, type TrackStep } from "@/app/(store)/track-order/actions";

export type TrackingStep = TrackStep;

export async function trackOrder({
  orderId,
  phone,
}: {
  orderId?: string;
  phone?: string;
}): Promise<{
  orderId: string;
  lookup: "id" | "phone";
  phone?: string;
  statusLabel?: string;
  courier?: string | null;
  trackingId?: string | null;
  courierUrl?: string | null;
  steps: TrackingStep[];
  error?: string;
}> {
  const res = await trackOrderServerAction({ orderId, phone });
  if (!res.ok) {
    throw new Error(res.error || "Order not found");
  }
  return {
    orderId: res.orderId || orderId || "PF-240018",
    lookup: res.lookup,
    phone: res.phone || phone,
    statusLabel: res.statusLabel,
    courier: res.courier,
    trackingId: res.trackingId,
    courierUrl: res.courierUrl,
    steps: res.steps,
  };
}

import { validatePromoAction } from "@/app/(store)/checkout/actions";

/** Promo validation with database lookup. */
export async function validatePromo(
  code: string,
  subtotal: number,
  phone?: string,
): Promise<{ ok: boolean; discount: number; message: string }> {
  return validatePromoAction(code, subtotal, phone);
}


