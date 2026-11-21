import "server-only";
import { eq, like, or } from "drizzle-orm";
import { db, t } from "@/db";
import { logActivity, type AdminContext } from "@/lib/admin/auth";
import { getSettings, saveSetting } from "@/lib/settings";
import { moveStock } from "@/lib/services/inventory.server";

/**
 * Shared admin operations. Used by both the form actions in the panel and the AI assistant tools,
 * so a change made by the assistant goes through exactly the same rules and audit log as a manual one.
 * Callers are responsible for the permission check.
 */

export async function findOrder(ref: string | number) {
  const key = String(ref).trim().replace(/^#/, "");
  const [o] = await db()
    .select()
    .from(t.orders)
    .where(/^\d+$/.test(key) && key.length < 8 ? or(eq(t.orders.id, Number(key)), eq(t.orders.number, key)) : eq(t.orders.number, key))
    .limit(1);
  if (!o) throw new Error(`Order ${key} not found`);
  return o;
}

export async function findVariant(sku: string) {
  const [v] = await db()
    .select({ v: t.productVariants, name: t.products.name })
    .from(t.productVariants)
    .innerJoin(t.products, eq(t.products.id, t.productVariants.productId))
    .where(eq(t.productVariants.sku, sku.trim()))
    .limit(1);
  if (!v) throw new Error(`No variant with SKU ${sku}`);
  return v;
}

export async function adjustStock(admin: AdminContext, sku: string, change: { delta?: number; set?: number }, reason = "Manual adjustment") {
  const { v, name } = await findVariant(sku);
  const delta = change.set != null ? change.set - v.stockOnHand : Number(change.delta ?? 0);
  if (!Number.isFinite(delta) || delta === 0) throw new Error("Stock is already at that level");
  const r = await db().transaction((tx) => moveStock(tx, { variantId: v.id, qty: delta, type: delta > 0 ? "in" : "adjust", reason, adminId: admin.id }));
  await logActivity(admin, "stock.adjust", "variant", v.id, `${name} (${v.sku}) ${r.before} → ${r.after}: ${reason}`);
  return { sku: v.sku, product: name, before: r.before, after: r.after };
}

export async function setVariantPrice(admin: AdminContext, sku: string, price: number, compareAtPrice?: number | null) {
  if (!Number.isInteger(price) || price <= 0) throw new Error("Price must be a positive whole number (BDT)");
  const { v, name } = await findVariant(sku);
  await db()
    .update(t.productVariants)
    .set({ price, ...(compareAtPrice !== undefined ? { compareAtPrice } : {}) })
    .where(eq(t.productVariants.id, v.id));
  await logActivity(admin, "product.price", "variant", v.id, `${name} (${v.sku}) ৳${v.price} → ৳${price}`);
  return { sku: v.sku, product: name, before: v.price, after: price };
}

export async function setProductStatus(admin: AdminContext, productId: number, status: "published" | "draft" | "archived") {
  const [p] = await db().select().from(t.products).where(eq(t.products.id, productId)).limit(1);
  if (!p) throw new Error("Product not found");
  await db().update(t.products).set({ status }).where(eq(t.products.id, productId));
  await logActivity(admin, "product.status", "product", productId, `${p.name} → ${status}`);
  return { product: p.name, status };
}

export async function createCoupon(
  admin: AdminContext,
  c: { code: string; type: "percent" | "fixed" | "free_delivery"; value?: number; minOrder?: number; maxDiscount?: number | null; usageLimit?: number | null; firstOrderOnly?: boolean; endsAt?: Date | null },
) {
  const code = c.code.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,40}$/.test(code)) throw new Error("Coupon code must be 3–40 letters, numbers, - or _");
  if (c.type === "percent" && ((c.value ?? 0) <= 0 || (c.value ?? 0) > 100)) throw new Error("Percent must be between 1 and 100");
  if (c.type === "fixed" && (c.value ?? 0) <= 0) throw new Error("Enter a discount amount");
  const [dup] = await db().select({ id: t.coupons.id }).from(t.coupons).where(eq(t.coupons.code, code)).limit(1);
  if (dup) throw new Error(`Coupon ${code} already exists`);
  await db().insert(t.coupons).values({
    code,
    type: c.type,
    value: c.type === "free_delivery" ? 0 : Math.round(c.value ?? 0),
    minOrder: Math.max(0, Math.round(c.minOrder ?? 0)),
    maxDiscount: c.maxDiscount || null,
    usageLimit: c.usageLimit || null,
    firstOrderOnly: !!c.firstOrderOnly,
    endsAt: c.endsAt ?? null,
    active: true,
  });
  await logActivity(admin, "coupon.create", "coupon", code, `Created coupon ${code}`);
  return { code };
}

export async function setCouponActive(admin: AdminContext, code: string, active: boolean) {
  const key = code.trim().toUpperCase();
  const [cp] = await db().select().from(t.coupons).where(eq(t.coupons.code, key)).limit(1);
  if (!cp) throw new Error(`Coupon ${key} not found`);
  await db().update(t.coupons).set({ active }).where(eq(t.coupons.id, cp.id));
  await logActivity(admin, active ? "coupon.enable" : "coupon.disable", "coupon", key, `${key} ${active ? "enabled" : "disabled"}`);
  return { code: key, active };
}

export async function deleteCoupon(admin: AdminContext, code: string) {
  const key = code.trim().toUpperCase();
  const r = await db().delete(t.coupons).where(eq(t.coupons.code, key));
  if (!r[0].affectedRows) throw new Error(`Coupon ${key} not found`);
  await logActivity(admin, "coupon.delete", "coupon", key, `Deleted coupon ${key}`);
  return { code: key };
}

export async function setZone(admin: AdminContext, slug: string, patch: { charge?: number; freeOver?: number | null; eta?: string; codAvailable?: boolean; active?: boolean }) {
  const [z] = await db().select().from(t.shippingZones).where(eq(t.shippingZones.slug, slug)).limit(1);
  if (!z) throw new Error(`Delivery zone ${slug} not found`);
  await db().update(t.shippingZones).set(patch).where(eq(t.shippingZones.id, z.id));
  await logActivity(admin, "shipping.update", "zone", z.id, `${z.name}: ${JSON.stringify(patch)}`);
  return { zone: z.name, ...patch };
}

export async function setCustomerBlocked(admin: AdminContext, phone: string, blocked: boolean, reason?: string) {
  const [c] = await db().select().from(t.customers).where(eq(t.customers.phone, phone.trim())).limit(1);
  if (!c) throw new Error("No customer with that phone number");
  await db()
    .update(t.customers)
    .set({ blocked, blockReason: blocked ? reason || "Blocked by admin" : null, group: blocked ? "risk" : "returning" })
    .where(eq(t.customers.id, c.id));
  await logActivity(admin, blocked ? "customer.block" : "customer.unblock", "customer", c.id, reason ?? "");
  return { customer: c.name, blocked };
}

export async function editBlockList(admin: AdminContext, kind: "phone" | "ip", value: string, action: "add" | "remove") {
  const v = value.trim();
  if (!v) throw new Error("Enter a value");
  if (kind === "phone" && !/^01[3-9]\d{8}$/.test(v)) throw new Error("Phone must be a valid Bangladeshi mobile number (01XXXXXXXXX)");
  const { fraud } = await getSettings("fraud");
  const key = kind === "phone" ? "blockedPhones" : "blockedIps";
  const list = new Set(fraud[key]);
  if (action === "add") list.add(v);
  else list.delete(v);
  await saveSetting("fraud", { ...fraud, [key]: [...list] });
  await logActivity(admin, `blocklist.${action}`, "settings", null, `${kind} ${v}`);
  return { kind, value: v, action };
}

export async function markPaymentPaid(admin: AdminContext, orderRef: string | number, reference?: string) {
  const o = await findOrder(orderRef);
  if (o.paymentStatus === "paid") throw new Error(`Order #${o.number} is already paid`);
  await db().update(t.orders).set({ paymentStatus: "paid" }).where(eq(t.orders.id, o.id));
  await db().insert(t.payments).values({ orderId: o.id, method: o.paymentMethod, amount: o.total, status: "paid", reference: reference || o.bkashTrxId || null, note: "Verified by admin", adminId: admin.id });
  await logActivity(admin, "payment.paid", "order", o.id, `#${o.number} payment marked paid`);
  return { order: o.number };
}

export async function setShipment(admin: AdminContext, orderRef: string | number, courier: string | null, trackingId: string | null) {
  const o = await findOrder(orderRef);
  await db().update(t.orders).set({ courier, trackingId }).where(eq(t.orders.id, o.id));
  await db().insert(t.orderHistory).values({ orderId: o.id, toStatus: "note", note: `Courier: ${courier ?? "—"} · Tracking: ${trackingId ?? "—"}`, adminId: admin.id });
  await logActivity(admin, "order.shipment", "order", o.id, `#${o.number} ${courier ?? "-"} / ${trackingId ?? "-"}`);
  return { order: o.number, courier, trackingId };
}

export async function addOrderNote(admin: AdminContext, orderRef: string | number, note: string) {
  const o = await findOrder(orderRef);
  if (!note.trim()) throw new Error("Write a note first");
  await db().insert(t.orderHistory).values({ orderId: o.id, toStatus: "note", note: note.trim().slice(0, 500), adminId: admin.id });
  return { order: o.number };
}

export async function setMessageStatus(admin: AdminContext, id: number, status: "new" | "in_progress" | "closed") {
  await db().update(t.contactMessages).set({ status }).where(eq(t.contactMessages.id, id));
  await logActivity(admin, "message.status", "message", id, status);
  return { id, status };
}

export async function searchCustomers(q: string, limit = 10) {
  const like_ = `%${q.trim()}%`;
  return db().select({ id: t.customers.id, name: t.customers.name, phone: t.customers.phone, email: t.customers.email, group: t.customers.group, blocked: t.customers.blocked }).from(t.customers).where(or(like(t.customers.name, like_), like(t.customers.phone, like_), like(t.customers.email, like_))).limit(limit);
}
