import "server-only";
import { and, eq, gte, like, lt, or, type SQL } from "drizzle-orm";
import { t } from "@/db";
import { ORDER_STATUSES } from "@/db/schema";
import { resolveRange } from "@/lib/admin/range";

export function orderFilters(sp: Record<string, string>) {
  const w: (SQL | undefined)[] = [];
  if (sp.q) {
    const q = `%${sp.q.trim().replace(/^#/, "")}%`;
    w.push(or(like(t.orders.number, q), like(t.orders.phone, q), like(t.orders.name, q), like(t.orders.trackingId, q)));
  }
  if (sp.status && (ORDER_STATUSES as readonly string[]).includes(sp.status)) w.push(eq(t.orders.status, sp.status as (typeof ORDER_STATUSES)[number]));
  if (sp.payment) w.push(eq(t.orders.paymentMethod, sp.payment as "cod"));
  if (sp.risk) w.push(eq(t.orders.riskLevel, sp.risk as "low"));
  if (sp.courier) w.push(eq(t.orders.courier, sp.courier));
  if (sp.range) {
    const r = resolveRange(sp);
    w.push(gte(t.orders.createdAt, r.from), lt(t.orders.createdAt, r.to));
  }
  return and(...w);
}

