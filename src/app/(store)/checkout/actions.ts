"use server";

import { headers } from "next/headers";
import { placeOrder as placeOrderInDb } from "@/lib/services/orders.server";
import { hasDatabase } from "@/db";
import type { CartLine, DeliveryArea, Order, PaymentMethod } from "@/types";

export type CreateOrderInput = {
  customer: { name: string; phone: string; email?: string; address: string };
  deliveryArea: DeliveryArea;
  paymentMethod: PaymentMethod;
  note?: string;
  lines: CartLine[];
  discount: number;
  couponCode?: string;
};

export async function createStoreOrderAction(
  input: CreateOrderInput,
): Promise<{ ok: boolean; order?: Order; error?: string }> {
  if (!hasDatabase) {
    return { ok: false, error: "Database not connected" };
  }

  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : h.get("x-real-ip");
    const userAgent = h.get("user-agent");

    const items = input.lines.map((l) => {
      const num = Number(l.variantId);
      const isNum = !isNaN(num) && num > 0;
      const sku = l.variantId.toUpperCase().startsWith("PF-")
        ? l.variantId.toUpperCase()
        : `PF-${l.variantId.toUpperCase()}`;
      return {
        variantId: isNum ? num : undefined,
        sku,
        quantity: l.quantity,
      };
    });

    const dbRes = await placeOrderInDb({
      name: input.customer.name,
      phone: input.customer.phone,
      email: input.customer.email,
      address: input.customer.address,
      zone: input.deliveryArea,
      paymentMethod: input.paymentMethod,
      note: input.note,
      couponCode: input.couponCode,
      items,
      source: "storefront",
      ip: ip ?? null,
      userAgent: userAgent ?? null,
    });

    const fullOrder: Order = {
      id: dbRes.number,
      createdAt: new Date().toISOString(),
      customer: input.customer,
      deliveryArea: input.deliveryArea,
      paymentMethod: input.paymentMethod,
      note: input.note,
      lines: input.lines,
      subtotal: dbRes.subtotal,
      deliveryCharge: dbRes.deliveryCharge,
      discount: dbRes.discount,
      total: dbRes.total,
      status: "placed",
    };

    return { ok: true, order: fullOrder };
  } catch (err) {
    console.error("Order creation failed:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to place order",
    };
  }
}

export async function validatePromoAction(
  code: string,
  subtotal: number,
  phone?: string,
): Promise<{ ok: boolean; discount: number; message: string }> {
  if (!hasDatabase) {
    const c = code.trim().toUpperCase();
    if (c === "WELCOME10") {
      const discount = Math.round((subtotal * 10) / 100);
      return { ok: true, discount, message: `You save ৳${discount} (10% off)` };
    }
    return { ok: false, discount: 0, message: `"${code.toUpperCase()}" is not a valid promo code.` };
  }

  try {
    const { evaluateCoupon } = await import("@/lib/services/orders.server");
    const res = await evaluateCoupon(code, subtotal, phone);
    if (!res.ok) return { ok: false, discount: 0, message: res.message };
    return { ok: true, discount: res.discount, message: res.message };
  } catch (err) {
    return { ok: false, discount: 0, message: err instanceof Error ? err.message : "Invalid promo code" };
  }
}

