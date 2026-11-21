import { desc } from "drizzle-orm";
import { db, t } from "@/db";
import { getAdmin, logActivity } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { orderFilters } from "@/lib/admin/queries/orders";

const esc = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** CSV export of orders using the same filters as the list. */
export async function GET(req: Request) {
  const admin = await getAdmin();
  if (!admin || !can(admin.permissions, "orders.export")) return new Response("Forbidden", { status: 403 });
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const rows = await db().select().from(t.orders).where(orderFilters(sp)).orderBy(desc(t.orders.createdAt)).limit(5000);
  const head = ["Order", "Date", "Name", "Phone", "Address", "Zone", "Payment", "Payment status", "Status", "Subtotal", "Delivery", "Discount", "Total", "Coupon", "Courier", "Tracking", "Risk"];
  const lines = rows.map((o) =>
    [o.number, o.createdAt.toISOString(), o.name, o.phone, o.address, o.zoneLabel, o.paymentMethod, o.paymentStatus, o.status, o.subtotal, o.deliveryCharge, o.discount, o.total, o.couponCode, o.courier, o.trackingId, o.riskLevel].map(esc).join(","),
  );
  await logActivity(admin, "order.export", "order", null, `Exported ${rows.length} orders`);
  return new Response("﻿" + [head.join(","), ...lines].join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}
