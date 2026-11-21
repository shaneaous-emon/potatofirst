import "server-only";
import { and, count, desc, gte, inArray, lt, sql, sum } from "drizzle-orm";
import { db, t } from "@/db";

/** statuses that count as real sales (not cancelled / failed / returned / refunded) */
export const SALE_STATUSES = ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered"] as const;

export async function salesSummary(from: Date, to: Date) {
  const d = db();
  const inRange = and(gte(t.orders.createdAt, from), lt(t.orders.createdAt, to));
  const [all] = await d.select({ orders: count(), gross: sum(t.orders.total) }).from(t.orders).where(inRange);
  const [net] = await d
    .select({ orders: count(), net: sum(t.orders.total), discount: sum(t.orders.discount), delivery: sum(t.orders.deliveryCharge) })
    .from(t.orders)
    .where(and(inRange, inArray(t.orders.status, [...SALE_STATUSES])));
  const byStatus = await d.select({ status: t.orders.status, n: count(), value: sum(t.orders.total) }).from(t.orders).where(inRange).groupBy(t.orders.status);
  const byPayment = await d.select({ method: t.orders.paymentMethod, n: count(), value: sum(t.orders.total) }).from(t.orders).where(inRange).groupBy(t.orders.paymentMethod);
  const [newCustomers] = await d.select({ n: sql<number>`count(distinct ${t.orders.phone})` }).from(t.orders).where(
    and(inRange, sql`${t.orders.phone} not in (select o2.phone from orders o2 where o2.created_at < ${from})`),
  );
  const s = (st: string) => byStatus.find((b) => b.status === st);
  const refunds = ["refunded", "returned"].reduce((a, st) => a + Number(s(st)?.value ?? 0), 0);
  return {
    orders: all.orders,
    gross: Number(all.gross ?? 0),
    net: Number(net.net ?? 0),
    netOrders: net.orders,
    aov: net.orders ? Math.round(Number(net.net ?? 0) / net.orders) : 0,
    delivered: s("delivered")?.n ?? 0,
    pending: s("pending")?.n ?? 0,
    cancelled: (s("cancelled")?.n ?? 0) + (s("failed")?.n ?? 0),
    refunds,
    newCustomers: Number(newCustomers.n ?? 0),
    byStatus: byStatus.map((b) => ({ status: b.status, n: b.n, value: Number(b.value ?? 0) })),
    byPayment: byPayment.map((b) => ({ method: b.method, n: b.n, value: Number(b.value ?? 0) })),
  };
}

/** Daily net sales (Asia/Dhaka days) */
export async function salesTrend(from: Date, to: Date) {
  const day = sql<string>`date_format(convert_tz(${t.orders.createdAt}, '+00:00', '+06:00'), '%Y-%m-%d')`;
  const rows = await db()
    .select({ day, n: count(), value: sum(t.orders.total) })
    .from(t.orders)
    .where(and(gte(t.orders.createdAt, from), lt(t.orders.createdAt, to), inArray(t.orders.status, [...SALE_STATUSES])))
    .groupBy(day)
    .orderBy(day);
  const map = new Map(rows.map((r) => [r.day, { n: r.n, value: Number(r.value ?? 0) }]));
  const out: { day: string; n: number; value: number }[] = [];
  for (let x = from.getTime(); x < to.getTime(); x += 86400000) {
    const key = new Date(x + 6 * 3600000).toISOString().slice(0, 10);
    out.push({ day: key, ...(map.get(key) ?? { n: 0, value: 0 }) });
  }
  return out;
}

export async function topProducts(from: Date, to: Date, limit = 5) {
  return db()
    .select({
      name: t.orderItems.name,
      qty: sql<number>`sum(${t.orderItems.quantity})`,
      revenue: sql<number>`sum(${t.orderItems.quantity} * ${t.orderItems.unitPrice})`,
      cost: sql<number>`sum(${t.orderItems.quantity} * coalesce(${t.orderItems.costPrice}, 0))`,
    })
    .from(t.orderItems)
    .innerJoin(t.orders, sql`${t.orders.id} = ${t.orderItems.orderId}`)
    .where(and(gte(t.orders.createdAt, from), lt(t.orders.createdAt, to), inArray(t.orders.status, [...SALE_STATUSES])))
    .groupBy(t.orderItems.name)
    .orderBy(desc(sql`sum(${t.orderItems.quantity} * ${t.orderItems.unitPrice})`))
    .limit(limit);
}
