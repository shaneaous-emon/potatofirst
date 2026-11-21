"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, t } from "@/db";
import type { OrderStatusKey } from "@/db/schema";
import { ORDER_STATUSES } from "@/db/schema";
import { logActivity, requirePermission } from "@/lib/admin/auth";
import { advanceOrderStatus, placeOrder } from "@/lib/services/orders.server";
import type { ActionResult } from "@/components/admin/action-form";
import { redirect } from "next/navigation";

const done = (id: number, message: string): ActionResult => {
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  return { ok: true, message };
};
const fail = (e: unknown): ActionResult => ({ ok: false, message: e instanceof Error ? e.message : "Something went wrong" });

export async function updateStatusAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("orders.edit");
    const id = Number(f.get("id"));
    const to = String(f.get("status")) as OrderStatusKey;
    if (!ORDER_STATUSES.includes(to)) return { ok: false, message: "Unknown status" };
    const o = await advanceOrderStatus(id, to, { adminId: admin.id, note: String(f.get("note") || "") || undefined, restock: f.get("restock") === "on", cancelReason: String(f.get("cancelReason") || "") || undefined });
    await logActivity(admin, "order.status", "order", id, `#${o.number} → ${to}`);
    return done(id, `Order moved to ${to.replace(/_/g, " ")}`);
  } catch (e) {
    return fail(e);
  }
}

/** One-click status change from the orders list dropdown (non-form call). */
export async function quickStatusAction(id: number, to: string, opts: { cancelReason?: string; restock?: boolean } = {}): Promise<{ ok: boolean; message: string; status?: string }> {
  try {
    const admin = await requirePermission("orders.edit");
    if (!ORDER_STATUSES.includes(to as OrderStatusKey)) return { ok: false, message: "Unknown status" };
    const o = await advanceOrderStatus(id, to as OrderStatusKey, { adminId: admin.id, cancelReason: opts.cancelReason?.trim() || undefined, restock: !!opts.restock, note: "Changed from orders list" });
    await logActivity(admin, "order.status", "order", id, `#${o.number} → ${to}`);
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin");
    return { ok: true, message: `#${o.number} → ${to.replace(/_/g, " ")}`, status: to };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Something went wrong" };
  }
}

export async function bulkStatusAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("orders.edit");
    const ids = f.getAll("ids").map(Number).filter(Boolean);
    const to = String(f.get("bulkStatus")) as OrderStatusKey;
    if (!ids.length) return { ok: false, message: "Select at least one order" };
    if (!ORDER_STATUSES.includes(to)) return { ok: false, message: "Choose a status" };
    let okN = 0;
    const errors: string[] = [];
    for (const id of ids) {
      try {
        await advanceOrderStatus(id, to, { adminId: admin.id, note: "Bulk update" });
        okN++;
      } catch (e) {
        errors.push(e instanceof Error ? e.message : String(e));
      }
    }
    await logActivity(admin, "order.bulk_status", "order", null, `${okN} orders → ${to}`);
    revalidatePath("/admin/orders");
    return { ok: okN > 0, message: `${okN} updated${errors.length ? `, ${errors.length} skipped (invalid transition)` : ""}` };
  } catch (e) {
    return fail(e);
  }
}

export async function updateShipmentAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("orders.edit");
    const id = Number(f.get("id"));
    const courier = String(f.get("courier") || "") || null;
    const trackingId = String(f.get("trackingId") || "").trim() || null;
    await db().update(t.orders).set({ courier, trackingId }).where(eq(t.orders.id, id));
    await db().insert(t.orderHistory).values({ orderId: id, toStatus: "note", note: `Courier: ${courier ?? "—"} · Tracking: ${trackingId ?? "—"}`, adminId: admin.id });
    await logActivity(admin, "order.shipment", "order", id, `Courier ${courier} / ${trackingId}`);
    return done(id, "Shipment details saved");
  } catch (e) {
    return fail(e);
  }
}

export async function paymentAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const decision = String(f.get("decision"));
    const admin = await requirePermission(decision === "refund" ? "payments.refund" : "orders.edit");
    const id = Number(f.get("id"));
    const [o] = await db().select().from(t.orders).where(eq(t.orders.id, id));
    if (!o) return { ok: false, message: "Order not found" };
    if (decision === "paid") {
      await db().update(t.orders).set({ paymentStatus: "paid" }).where(eq(t.orders.id, id));
      await db().insert(t.payments).values({ orderId: id, method: o.paymentMethod, amount: o.total, status: "paid", reference: String(f.get("reference") || o.bkashTrxId || "") || null, note: "Verified by admin", adminId: admin.id });
    } else if (decision === "failed") {
      await db().update(t.orders).set({ paymentStatus: "failed" }).where(eq(t.orders.id, id));
      await db().insert(t.payments).values({ orderId: id, method: o.paymentMethod, amount: o.total, status: "failed", reference: o.bkashTrxId, note: String(f.get("reason") || "Payment could not be verified"), adminId: admin.id });
    } else if (decision === "refund") {
      const amount = Math.round(Number(f.get("amount")));
      const reason = String(f.get("reason") || "").trim();
      if (!amount || amount <= 0 || amount > o.total) return { ok: false, message: "Enter a refund amount up to the order total" };
      if (!reason) return { ok: false, message: "A refund reason is required" };
      await db().insert(t.payments).values({ orderId: id, method: o.paymentMethod, kind: "refund", amount, status: "refunded", reference: String(f.get("reference") || "") || null, note: reason, adminId: admin.id });
      await db().update(t.orders).set({ paymentStatus: amount >= o.total ? "refunded" : "partially_refunded" }).where(eq(t.orders.id, id));
    }
    await logActivity(admin, `payment.${decision}`, "order", id, `#${o.number} payment ${decision}`);
    return done(id, decision === "refund" ? "Refund recorded" : `Payment marked ${decision}`);
  } catch (e) {
    return fail(e);
  }
}

export async function noteAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("orders.edit");
    const id = Number(f.get("id"));
    const note = String(f.get("note") || "").trim();
    if (!note) return { ok: false, message: "Write a note first" };
    await db().insert(t.orderHistory).values({ orderId: id, toStatus: "note", note, adminId: admin.id });
    return done(id, "Note added");
  } catch (e) {
    return fail(e);
  }
}

export async function assignAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("orders.edit");
    const id = Number(f.get("id"));
    const to = Number(f.get("adminId")) || null;
    await db().update(t.orders).set({ assignedAdminId: to }).where(eq(t.orders.id, id));
    await logActivity(admin, "order.assign", "order", id, `Assigned to admin #${to ?? "nobody"}`);
    return done(id, "Assignment saved");
  } catch (e) {
    return fail(e);
  }
}

export async function createManualOrderAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  let number = "";
  let id = 0;
  try {
    const admin = await requirePermission("orders.edit");
    const skus = f.getAll("sku").map(String);
    const qtys = f.getAll("qty").map(Number);
    const items = skus.map((sku, i) => ({ sku, quantity: qtys[i] || 1 })).filter((i) => i.sku);
    const phone = String(f.get("phone") || "").replace(/[\s-]/g, "").replace(/^\+?88/, "");
    if (!/^01[3-9]\d{8}$/.test(phone)) return { ok: false, message: "Enter a valid phone number" };
    const r = await placeOrder({
      name: String(f.get("name") || "").trim(),
      phone,
      address: String(f.get("address") || "").trim(),
      zone: String(f.get("zone")),
      paymentMethod: String(f.get("paymentMethod")) as "cod" | "bkash",
      note: String(f.get("note") || "") || undefined,
      couponCode: String(f.get("coupon") || "") || undefined,
      items,
      source: String(f.get("source") || "phone"),
    });
    number = r.number;
    id = r.id;
    await logActivity(admin, "order.create", "order", r.id, `Manual order #${r.number} (${f.get("source")})`);
  } catch (e) {
    return fail(e);
  }
  redirect(`/admin/orders/${id}?created=${number}`);
}

