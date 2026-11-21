import "server-only";
import { and, count, eq, gte, inArray, ne, sql } from "drizzle-orm";
import { db, t } from "@/db";
import type { OrderStatusKey } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import { moveStock } from "./inventory.server";

/* ───────────── Status workflow ───────────── */

export const TRANSITIONS: Record<OrderStatusKey, OrderStatusKey[]> = {
  pending: ["confirmed", "cancelled", "failed"],
  confirmed: ["processing", "packed", "cancelled"],
  processing: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["out_for_delivery", "delivered", "returned", "failed"],
  out_for_delivery: ["delivered", "returned", "failed"],
  delivered: ["returned", "refunded"],
  returned: ["refunded"],
  cancelled: [],
  refunded: [],
  failed: [],
};

/** statuses after which goods have left the warehouse */
const SHIPPED = new Set<OrderStatusKey>(["shipped", "out_for_delivery", "delivered"]);

export async function changeOrderStatus(orderId: number, to: OrderStatusKey, opts: { adminId?: number | null; note?: string; restock?: boolean; cancelReason?: string } = {}) {
  const { inventory } = await getSettings("inventory");
  return db().transaction(async (tx) => {
    const [o] = await tx.select().from(t.orders).where(eq(t.orders.id, orderId)).for("update");
    if (!o) throw new Error("Order not found");
    if (o.status === to) return o;
    if (!TRANSITIONS[o.status].includes(to)) throw new Error(`Can’t move an order from ${o.status} to ${to}`);

    const items = await tx.select().from(t.orderItems).where(eq(t.orderItems.orderId, o.id));
    const deducted = inventory.deductOn === "placed" || o.status !== "pending";

    // stock deduction at confirmation (if configured)
    if (inventory.deductOn === "confirmed" && o.status === "pending" && to === "confirmed") {
      for (const it of items) if (it.variantId) await moveStock(tx, { variantId: it.variantId, qty: -it.quantity, type: "sale", reference: o.number, reason: "Order confirmed", adminId: opts.adminId, blockExpired: inventory.blockExpired });
    }
    // restock: cancelled/failed before dispatch → always; returned → only when inspected & approved
    const backBeforeShip = (to === "cancelled" || to === "failed") && !SHIPPED.has(o.status);
    if (deducted && (backBeforeShip || (to === "returned" && opts.restock))) {
      for (const it of items)
        if (it.variantId) await moveStock(tx, { variantId: it.variantId, qty: it.quantity, type: to === "returned" ? "return" : "cancel", reference: o.number, reason: to === "returned" ? "Returned and inspected" : `Order ${to}`, adminId: opts.adminId });
    }

    const patch: Partial<typeof t.orders.$inferInsert> = { status: to };
    if (to === "cancelled" && opts.cancelReason) patch.cancelReason = opts.cancelReason;
    if (to === "delivered" && o.paymentMethod === "cod") patch.paymentStatus = "paid";
    if (to === "refunded") patch.paymentStatus = "refunded";
    await tx.update(t.orders).set(patch).where(eq(t.orders.id, o.id));
    await tx.insert(t.orderHistory).values({ orderId: o.id, fromStatus: o.status, toStatus: to, note: opts.note ?? opts.cancelReason ?? null, adminId: opts.adminId ?? null });
    if (to === "delivered" && o.paymentMethod === "cod")
      await tx.insert(t.payments).values({ orderId: o.id, method: "cod", amount: o.total, status: "paid", note: "COD collected on delivery", adminId: opts.adminId ?? null });
    return { ...o, ...patch };
  });
}

/* ───────────── Fraud scoring ───────────── */

export type Risk = { score: number; level: "low" | "medium" | "high"; reasons: string[] };

/** Customer delivery success ratio: delivered ÷ (delivered + returned + failed + cancelled after confirmation). */
export async function successRatio(phone: string) {
  const rows = await db().select({ status: t.orders.status, n: count() }).from(t.orders).where(eq(t.orders.phone, phone)).groupBy(t.orders.status);
  const n = (s: string) => rows.find((r) => r.status === s)?.n ?? 0;
  const delivered = n("delivered") + n("refunded");
  const bad = n("returned") + n("failed") + n("cancelled");
  const total = delivered + bad;
  return { delivered, bad, total, orders: rows.reduce((a, r) => a + r.n, 0), ratio: total ? Math.round((delivered / total) * 100) : null };
}

export async function assessRisk(input: { phone: string; address: string; ip?: string | null; total: number; excludeOrderId?: number }): Promise<Risk> {
  const { fraud } = await getSettings("fraud");
  const reasons: string[] = [];
  let score = 0;
  const since = new Date(Date.now() - fraud.windowHours * 3600000);
  const notSelf = input.excludeOrderId ? ne(t.orders.id, input.excludeOrderId) : undefined;

  if (fraud.blockedPhones.includes(input.phone)) (score += 100), reasons.push("Phone number is on the block list");
  if (input.ip && fraud.blockedIps.includes(input.ip)) (score += 100), reasons.push("IP address is on the block list");
  const [cust] = await db().select().from(t.customers).where(eq(t.customers.phone, input.phone)).limit(1);
  if (cust?.blocked) (score += 100), reasons.push(`Customer is blocked${cust.blockReason ? `: ${cust.blockReason}` : ""}`);

  const [byPhone] = await db().select({ n: count() }).from(t.orders).where(and(eq(t.orders.phone, input.phone), gte(t.orders.createdAt, since), notSelf));
  if (byPhone.n >= fraud.maxOrdersPerPhone) (score += 30 + (byPhone.n - fraud.maxOrdersPerPhone) * 10), reasons.push(`${byPhone.n} other orders from this phone in ${fraud.windowHours}h`);
  if (input.ip) {
    const [byIp] = await db().select({ n: count() }).from(t.orders).where(and(eq(t.orders.ip, input.ip), gte(t.orders.createdAt, since), notSelf));
    // shared IPs (mobile carriers, offices) are common — never decisive alone
    if (byIp.n >= fraud.maxOrdersPerIp) (score += 20), reasons.push(`${byIp.n} orders from the same IP in ${fraud.windowHours}h (may be a shared network)`);
  }
  const addr = input.address.trim().toLowerCase().replace(/\s+/g, " ");
  if (addr.length > 8) {
    const [byAddr] = await db()
      .select({ n: sql<number>`count(distinct ${t.orders.phone})` })
      .from(t.orders)
      .where(and(sql`lower(${t.orders.address}) = ${addr}`, ne(t.orders.phone, input.phone), gte(t.orders.createdAt, since)));
    if (Number(byAddr.n) > 0) (score += 15), reasons.push(`Same address used by ${byAddr.n} other phone number(s)`);
  }
  const sr = await successRatio(input.phone);
  if (sr.ratio != null && sr.total >= fraud.minSampleSize && sr.ratio < fraud.minSuccessRatio) (score += 35), reasons.push(`Low delivery success: ${sr.ratio}% of ${sr.total} past orders`);
  if (sr.bad >= 2 && (sr.ratio ?? 0) < 80) (score += 10), reasons.push(`${sr.bad} past cancelled/returned orders`);
  if (sr.orders === 0 && input.total >= 5000) (score += 10), reasons.push("Large first order");

  score = Math.min(100, score);
  const level = score >= fraud.holdAt ? "high" : score >= 25 ? "medium" : "low";
  return { score, level, reasons };
}

/* ───────────── Coupons & shipping ───────────── */

export async function evaluateCoupon(code: string, subtotal: number, phone?: string, deliveryCharge = 0) {
  const c = code.trim().toUpperCase();
  if (!c) return { ok: false as const, message: "Enter a promo code" };
  const [cp] = await db().select().from(t.coupons).where(eq(t.coupons.code, c)).limit(1);
  const now = new Date();
  if (!cp || !cp.active) return { ok: false as const, message: `"${c}" is not a valid promo code.` };
  if (cp.startsAt && cp.startsAt > now) return { ok: false as const, message: "This code isn’t active yet." };
  if (cp.endsAt && cp.endsAt < now) return { ok: false as const, message: "This code has expired." };
  if (cp.usageLimit != null && cp.usedCount >= cp.usageLimit) return { ok: false as const, message: "This code has reached its usage limit." };
  if (subtotal < cp.minOrder) return { ok: false as const, message: `Minimum order ৳${cp.minOrder} for this code.` };
  if (phone && (cp.firstOrderOnly || cp.perCustomerLimit != null)) {
    const [prev] = await db().select({ n: count() }).from(t.orders).where(and(eq(t.orders.phone, phone), inArray(t.orders.status, ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered"])));
    if (cp.firstOrderOnly && prev.n > 0) return { ok: false as const, message: "This code is for first orders only." };
    if (cp.perCustomerLimit != null) {
      const [used] = await db().select({ n: count() }).from(t.orders).where(and(eq(t.orders.phone, phone), eq(t.orders.couponCode, c)));
      if (used.n >= cp.perCustomerLimit) return { ok: false as const, message: "You’ve already used this code." };
    }
  }
  let discount = cp.type === "percent" ? Math.round((subtotal * cp.value) / 100) : cp.type === "fixed" ? cp.value : deliveryCharge;
  if (cp.maxDiscount != null && cp.type !== "free_delivery") discount = Math.min(discount, cp.maxDiscount);
  discount = Math.min(discount, subtotal + deliveryCharge);
  return { ok: true as const, code: c, type: cp.type, discount, message: cp.type === "free_delivery" ? "Free delivery applied" : `You save ৳${discount}` };
}

/* ───────────── Place order (storefront) ───────────── */

export type PlaceOrderInput = {
  name: string;
  phone: string;
  email?: string;
  address: string;
  zone: string; // zone slug
  paymentMethod: "cod" | "bkash" | "online";
  bkashTrxId?: string;
  note?: string;
  couponCode?: string;
  items: { variantId?: number; sku?: string; quantity: number }[];
  source?: string;
  ip?: string | null;
  userAgent?: string | null;
};

export async function placeOrder(input: PlaceOrderInput) {
  const { checkout, inventory } = await getSettings("checkout", "inventory");
  if (!input.items.length) throw new Error("Your cart is empty");

  // prices always come from the database, never from the client
  const skus = input.items.map((i) => i.sku).filter(Boolean) as string[];
  const ids = input.items.map((i) => i.variantId).filter(Boolean) as number[];
  const variants = await db()
    .select({ v: t.productVariants, p: t.products, img: sql<string>`(select src from product_images pi where pi.product_id = ${t.products.id} order by sort limit 1)` })
    .from(t.productVariants)
    .innerJoin(t.products, eq(t.products.id, t.productVariants.productId))
    .where(sql`${t.productVariants.sku} in (${sql.join(skus.length ? skus.map((s) => sql`${s}`) : [sql`''`], sql`, `)}) or ${t.productVariants.id} in (${sql.join(ids.length ? ids.map((i) => sql`${i}`) : [sql`0`], sql`, `)})`);

  const lines = input.items.map((i) => {
    const row = variants.find((r) => (i.variantId && r.v.id === i.variantId) || (i.sku && r.v.sku === i.sku));
    if (!row || !row.v.active || row.p.status !== "published") throw new Error("One of the products is no longer available");
    const q = Math.max(1, Math.min(checkout.maxQtyPerItem, Math.floor(i.quantity)));
    return { row, quantity: q };
  });
  const subtotal = lines.reduce((s, l) => s + l.row.v.price * l.quantity, 0);
  if (subtotal < checkout.minOrder) throw new Error(`Minimum order is ৳${checkout.minOrder}`);

  const [zone] = await db().select().from(t.shippingZones).where(and(eq(t.shippingZones.slug, input.zone), eq(t.shippingZones.active, true))).limit(1);
  if (!zone) throw new Error("Please choose a delivery area");
  if (input.paymentMethod === "cod" && (!zone.codAvailable || !checkout.codEnabled)) throw new Error("Cash on Delivery isn’t available for this area");
  let deliveryCharge = zone.freeOver != null && subtotal >= zone.freeOver ? 0 : zone.charge;

  let discount = 0;
  let couponCode: string | null = null;
  if (input.couponCode) {
    const c = await evaluateCoupon(input.couponCode, subtotal, input.phone, deliveryCharge);
    if (!c.ok) throw new Error(c.message);
    couponCode = c.code;
    if (c.type === "free_delivery") deliveryCharge = 0;
    else discount = c.discount;
  }
  const total = subtotal + deliveryCharge - discount;
  const risk = await assessRisk({ phone: input.phone, address: input.address, ip: input.ip, total });

  return db().transaction(async (tx) => {
    let [cust] = await tx.select().from(t.customers).where(eq(t.customers.phone, input.phone)).limit(1);
    if (!cust) {
      const [r] = await tx.insert(t.customers).values({ name: input.name, phone: input.phone, email: input.email || null, address: input.address });
      [cust] = await tx.select().from(t.customers).where(eq(t.customers.id, r.insertId));
    } else if (cust.group === "new") {
      await tx.update(t.customers).set({ group: "returning", address: input.address }).where(eq(t.customers.id, cust.id));
    }
    const tmp = `TMP${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const [r] = await tx.insert(t.orders).values({
      number: tmp,
      customerId: cust.id,
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      address: input.address,
      zoneId: zone.id,
      zoneLabel: zone.name,
      paymentMethod: input.paymentMethod,
      bkashTrxId: input.bkashTrxId || null,
      subtotal,
      deliveryCharge,
      discount,
      total,
      couponCode,
      note: input.note || null,
      source: input.source ?? "website",
      ip: input.ip ?? null,
      userAgent: input.userAgent?.slice(0, 300) ?? null,
      riskScore: risk.score,
      riskLevel: risk.level,
      riskReasons: risk.reasons,
      fraudDecision: risk.level === "high" ? "hold" : "none",
    });
    const number = `${checkout.orderPrefix}${240000 + r.insertId}`;
    await tx.update(t.orders).set({ number }).where(eq(t.orders.id, r.insertId));
    for (const l of lines) {
      await tx.insert(t.orderItems).values({ orderId: r.insertId, productId: l.row.p.id, variantId: l.row.v.id, name: l.row.p.name, variantLabel: l.row.v.label, sku: l.row.v.sku, image: l.row.img, unitPrice: l.row.v.price, costPrice: l.row.v.costPrice, quantity: l.quantity });
      if (inventory.deductOn === "placed") await moveStock(tx, { variantId: l.row.v.id, qty: -l.quantity, type: "sale", reference: number, reason: "Order placed", blockExpired: inventory.blockExpired });
    }
    await tx.insert(t.orderHistory).values({ orderId: r.insertId, toStatus: "pending", note: risk.level === "high" ? `Held for verification: ${risk.reasons.join("; ")}` : "Order placed" });
    if (input.paymentMethod === "bkash") await tx.insert(t.payments).values({ orderId: r.insertId, method: "bkash", amount: total, status: "pending", reference: input.bkashTrxId || null, note: "Awaiting verification" });
    if (couponCode) await tx.update(t.coupons).set({ usedCount: sql`${t.coupons.usedCount} + 1` }).where(eq(t.coupons.code, couponCode));
    return { id: r.insertId, number, total, subtotal, deliveryCharge, discount, risk };
  });
}
