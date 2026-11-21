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

export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
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

export type TrackingStep = { status: OrderStatus; label: string; time?: string; state: "done" | "current" | "upcoming" };

/** MOCK tracking result — returns a demo timeline for any valid input. */
/**
 * MOCK tracking. Phase 2 → GET /api/orders/track?order_id=…&phone=…
 * Either value works: phone returns the latest order for that number.
 */
export async function trackOrder({ orderId, phone }: { orderId?: string; phone?: string }): Promise<{ orderId: string; lookup: "id" | "phone"; phone?: string; steps: TrackingStep[] }> {
  await new Promise((r) => setTimeout(r, 500));
  return {
    orderId: orderId || "PF-240018",
    lookup: orderId ? "id" : "phone",
    phone,
    steps: [
      { status: "placed", label: "Order Placed", time: "DD Mon, 10:30 am", state: "done" },
      { status: "confirmed", label: "Confirmed", time: "DD Mon, 11:15 am", state: "done" },
      { status: "packed", label: "Packed", time: "DD Mon, 4:00 pm", state: "done" },
      { status: "shipped", label: "On the Way", time: "Expected DD Mon", state: "current" },
      { status: "delivered", label: "Delivered", state: "upcoming" },
    ],
  };
}

/** MOCK promo validation. Phase 2 → POST /api/coupons/validate */
export async function validatePromo(code: string, subtotal: number): Promise<{ ok: boolean; discount: number; message: string }> {
  await new Promise((r) => setTimeout(r, 400));
  void subtotal;
  return { ok: false, discount: 0, message: `"${code.toUpperCase()}" is not a valid promo code.` };
}
