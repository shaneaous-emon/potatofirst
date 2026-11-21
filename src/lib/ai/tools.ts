import "server-only";
import { and, asc, count, desc, eq, gt, like, lte, or, sql } from "drizzle-orm";
import { db, t } from "@/db";
import { ORDER_STATUSES, type OrderStatusKey } from "@/db/schema";
import { logActivity, type AdminContext } from "@/lib/admin/auth";
import * as ops from "@/lib/admin/ops";
import { can, type Permission } from "@/lib/admin/permissions";
import { orderFilters } from "@/lib/admin/queries/orders";
import { salesSummary, salesTrend, topProducts } from "@/lib/admin/queries/stats";
import { resolveRange } from "@/lib/admin/range";
import { advanceOrderStatus } from "@/lib/services/orders.server";
import type { ToolDef } from "./llm";

type Args = Record<string, unknown>;
export type AiTool = ToolDef & {
  /** write tools change data and need confirmation unless auto-run is on */
  write: boolean;
  perm: Permission;
  /** one-line human description shown on the confirmation card */
  describe: (a: Args) => string;
  run: (a: Args, admin: AdminContext) => Promise<unknown>;
};

const str = (v: unknown) => (typeof v === "string" ? v.trim() : v == null ? "" : String(v));
const int = (v: unknown, d = 0) => (Number.isFinite(Number(v)) && v !== "" && v != null ? Math.round(Number(v)) : d);
const lim = (v: unknown, d = 10, max = 30) => Math.max(1, Math.min(max, int(v, d)));
const day = (d: Date | string | null) => (d ? new Date(d).toISOString().slice(0, 16).replace("T", " ") + " UTC" : null);

const RANGE = { type: "string", enum: ["today", "yesterday", "7d", "30d", "month"], description: "Period. Default 30d. Use from/to for custom dates." };
const rangeProps = {
  range: RANGE,
  from: { type: "string", description: "Custom start date YYYY-MM-DD (Dhaka). Use together with `to`." },
  to: { type: "string", description: "Custom end date YYYY-MM-DD (inclusive)." },
};
const rangeOf = (a: Args) => resolveRange(a.from && a.to ? { range: "custom", from: str(a.from), to: str(a.to) } : { range: str(a.range) || "30d" });
const obj = (properties: Record<string, unknown>, required: string[] = []) => ({ type: "object", properties, required });

async function orderSummary(o: typeof t.orders.$inferSelect) {
  return { number: o.number, status: o.status, customer: o.name, phone: o.phone, total: o.total, payment: `${o.paymentMethod}/${o.paymentStatus}`, zone: o.zoneLabel, courier: o.courier, tracking: o.trackingId, placed: day(o.createdAt), risk: o.riskLevel !== "low" ? o.riskLevel : undefined };
}

const READ: AiTool[] = [
  {
    name: "get_overview",
    description: "Sales and order overview for a period: orders, net sales, average order value, delivered/pending/cancelled counts, refunds, new customers, breakdown by status and payment method.",
    parameters: obj(rangeProps),
    write: false,
    perm: "dashboard.view",
    describe: () => "",
    async run(a) {
      const r = rangeOf(a);
      const s = await salesSummary(r.from, r.to);
      return { period: `${r.fromStr} → ${r.toStr}`, currency: "BDT", ...s };
    },
  },
  {
    name: "sales_by_day",
    description: "Net sales and order count for each day in a period.",
    parameters: obj(rangeProps),
    write: false,
    perm: "reports.view",
    describe: () => "",
    async run(a) {
      const r = rangeOf(a);
      return (await salesTrend(r.from, r.to)).map((d) => ({ date: d.day, orders: d.n, sales: d.value }));
    },
  },
  {
    name: "top_products",
    description: "Best-selling products in a period with units sold, revenue and profit.",
    parameters: obj({ ...rangeProps, limit: { type: "integer", description: "How many (default 5, max 20)" } }),
    write: false,
    perm: "reports.view",
    describe: () => "",
    async run(a) {
      const r = rangeOf(a);
      return (await topProducts(r.from, r.to, lim(a.limit, 5, 20))).map((p) => ({ product: p.name, units: Number(p.qty), revenue: Number(p.revenue), profit: Number(p.revenue) - Number(p.cost) }));
    },
  },
  {
    name: "list_orders",
    description: "Search/list orders. Filter by status, payment method, date range, or free text (order number, phone, name, tracking ID). Newest first.",
    parameters: obj({ status: { type: "string", enum: [...ORDER_STATUSES] }, payment: { type: "string", enum: ["cod", "bkash", "online"] }, range: RANGE, q: { type: "string" }, limit: { type: "integer", description: "default 10, max 30" } }),
    write: false,
    perm: "orders.view",
    describe: () => "",
    async run(a) {
      const sp: Record<string, string> = {};
      for (const k of ["status", "payment", "range", "q"]) if (a[k]) sp[k] = str(a[k]);
      const where = orderFilters(sp);
      const [rows, [{ n }]] = await Promise.all([db().select().from(t.orders).where(where).orderBy(desc(t.orders.createdAt)).limit(lim(a.limit)), db().select({ n: count() }).from(t.orders).where(where)]);
      return { totalMatching: n, orders: await Promise.all(rows.map(orderSummary)) };
    },
  },
  {
    name: "get_order",
    description: "Full details of one order by its number (e.g. PF-240018): items, totals, address, status history.",
    parameters: obj({ number: { type: "string" } }, ["number"]),
    write: false,
    perm: "orders.view",
    describe: () => "",
    async run(a) {
      const o = await ops.findOrder(str(a.number));
      const [items, history] = await Promise.all([db().select().from(t.orderItems).where(eq(t.orderItems.orderId, o.id)), db().select().from(t.orderHistory).where(eq(t.orderHistory.orderId, o.id)).orderBy(asc(t.orderHistory.id))]);
      return { ...(await orderSummary(o)), address: o.address, subtotal: o.subtotal, delivery: o.deliveryCharge, discount: o.discount, coupon: o.couponCode, customerNote: o.note, items: items.map((i) => ({ name: i.name, variant: i.variantLabel, sku: i.sku, qty: i.quantity, price: i.unitPrice })), history: history.map((h) => ({ at: day(h.createdAt), to: h.toStatus, note: h.note })) };
    },
  },
  {
    name: "list_products",
    description: "List/search products with status, price range and total stock.",
    parameters: obj({ q: { type: "string" }, status: { type: "string", enum: ["draft", "published", "archived"] }, limit: { type: "integer" } }),
    write: false,
    perm: "products.view",
    describe: () => "",
    async run(a) {
      const w = [a.q ? or(like(t.products.name, `%${str(a.q)}%`), like(t.products.slug, `%${str(a.q)}%`)) : undefined, a.status ? eq(t.products.status, str(a.status) as "draft") : undefined];
      const rows = await db()
        .select({ id: t.products.id, name: t.products.name, status: t.products.status, minPrice: sql<number>`(select min(price) from product_variants v where v.product_id = ${t.products.id} and v.active = 1)`, stock: sql<number>`(select coalesce(sum(stock_on_hand),0) from product_variants v where v.product_id = ${t.products.id} and v.active = 1)` })
        .from(t.products)
        .where(and(...w))
        .orderBy(desc(t.products.createdAt))
        .limit(lim(a.limit, 15));
      return rows.map((r) => ({ ...r, minPrice: Number(r.minPrice), stock: Number(r.stock) }));
    },
  },
  {
    name: "stock_report",
    description: "Stock levels per variant with SKU, price and cost. Use filter=low or out to find what needs restocking. Also returns total units and stock value.",
    parameters: obj({ filter: { type: "string", enum: ["all", "low", "out"] }, q: { type: "string" }, limit: { type: "integer" } }),
    write: false,
    perm: "inventory.view",
    describe: () => "",
    async run(a) {
      const v = t.productVariants;
      const w = [eq(v.active, true), a.q ? or(like(t.products.name, `%${str(a.q)}%`), like(v.sku, `%${str(a.q)}%`)) : undefined, a.filter === "low" ? and(lte(v.stockOnHand, v.lowStockThreshold), gt(v.stockOnHand, 0)) : undefined, a.filter === "out" ? lte(v.stockOnHand, 0) : undefined];
      const [rows, [tot]] = await Promise.all([
        db().select({ product: t.products.name, variant: v.label, sku: v.sku, stock: v.stockOnHand, price: v.price, cost: v.costPrice }).from(v).innerJoin(t.products, eq(t.products.id, v.productId)).where(and(...w)).orderBy(asc(v.stockOnHand)).limit(lim(a.limit, 20)),
        db().select({ units: sql<number>`coalesce(sum(${v.stockOnHand}),0)`, value: sql<number>`coalesce(sum(${v.stockOnHand}*${v.price}),0)`, cost: sql<number>`coalesce(sum(${v.stockOnHand}*coalesce(${v.costPrice},0)),0)` }).from(v).where(eq(v.active, true)),
      ]);
      return { totalUnits: Number(tot.units), stockValueAtPrice: Number(tot.value), stockValueAtCost: Number(tot.cost), items: rows };
    },
  },
  {
    name: "search_customers",
    description: "Find customers by name, phone or email.",
    parameters: obj({ q: { type: "string" } }, ["q"]),
    write: false,
    perm: "customers.view",
    describe: () => "",
    async run(a) {
      const rows = await ops.searchCustomers(str(a.q));
      const out = [];
      for (const c of rows) {
        const [s] = c.phone ? await db().select({ orders: count(), spent: sql<number>`coalesce(sum(case when ${t.orders.status} = 'delivered' then ${t.orders.total} else 0 end),0)` }).from(t.orders).where(eq(t.orders.phone, c.phone)) : [{ orders: 0, spent: 0 }];
        out.push({ ...c, orders: s.orders, deliveredValue: Number(s.spent) });
      }
      return out;
    },
  },
  {
    name: "list_coupons",
    description: "All coupons with type, value, usage and whether active.",
    parameters: obj({}),
    write: false,
    perm: "coupons.view",
    describe: () => "",
    async run() {
      return (await db().select().from(t.coupons).orderBy(desc(t.coupons.createdAt)).limit(50)).map((c) => ({ code: c.code, type: c.type, value: c.value, minOrder: c.minOrder, used: c.usedCount, limit: c.usageLimit, active: c.active, expires: day(c.endsAt) }));
    },
  },
  {
    name: "list_delivery_zones",
    description: "Delivery areas with charge, free-delivery threshold and ETA.",
    parameters: obj({}),
    write: false,
    perm: "shipping.view",
    describe: () => "",
    async run() {
      return (await db().select().from(t.shippingZones).orderBy(asc(t.shippingZones.sort))).map((z) => ({ slug: z.slug, name: z.name, charge: z.charge, freeOver: z.freeOver, eta: z.eta, cod: z.codAvailable, active: z.active }));
    },
  },
  {
    name: "list_messages",
    description: "Contact-form messages from customers.",
    parameters: obj({ status: { type: "string", enum: ["new", "in_progress", "closed"] }, limit: { type: "integer" } }),
    write: false,
    perm: "content.view",
    describe: () => "",
    async run(a) {
      const rows = await db().select().from(t.contactMessages).where(a.status ? eq(t.contactMessages.status, str(a.status) as "new") : undefined).orderBy(desc(t.contactMessages.createdAt)).limit(lim(a.limit, 10));
      return rows.map((m) => ({ id: m.id, from: m.name, phone: m.phone, subject: m.subject, message: m.message.slice(0, 400), status: m.status, at: day(m.createdAt) }));
    },
  },
];

const WRITE: AiTool[] = [
  {
    name: "update_order_status",
    description:
      "Move one or more orders to a new status. Intermediate steps happen automatically (e.g. pending → delivered goes through confirmed, packed, shipped). Statuses: pending, confirmed, processing, packed, shipped, out_for_delivery, delivered, cancelled, returned, refunded, failed. Delivering a COD order marks it paid; cancelling before dispatch restocks.",
    parameters: obj({ orders: { type: "array", items: { type: "string" }, description: "Order numbers, e.g. [\"PF-240018\"]. Max 50." }, status: { type: "string", enum: [...ORDER_STATUSES] }, note: { type: "string" }, cancel_reason: { type: "string" }, restock_returns: { type: "boolean" } }, ["orders", "status"]),
    write: true,
    perm: "orders.edit",
    describe: (a) => `Move ${(a.orders as string[] | undefined)?.length ?? 0} order(s) [${((a.orders as string[]) ?? []).slice(0, 8).join(", ")}] → ${str(a.status)}`,
    async run(a, admin) {
      const to = str(a.status) as OrderStatusKey;
      if (!ORDER_STATUSES.includes(to)) throw new Error("Unknown status");
      const list = ((a.orders as unknown[]) ?? []).map(str).filter(Boolean).slice(0, 50);
      if (!list.length) throw new Error("No orders given");
      const results = [];
      for (const ref of list) {
        try {
          const o = await ops.findOrder(ref);
          const r = await advanceOrderStatus(o.id, to, { adminId: admin.id, note: str(a.note) || "Changed by AI assistant", cancelReason: str(a.cancel_reason) || undefined, restock: !!a.restock_returns });
          await logActivity(admin, "order.status", "order", o.id, `[AI] #${r.number} → ${to}`);
          results.push({ order: o.number, ok: true });
        } catch (e) {
          results.push({ order: ref, ok: false, error: e instanceof Error ? e.message : "failed" });
        }
      }
      return { moved: results.filter((r) => r.ok).length, results };
    },
  },
  {
    name: "set_order_shipment",
    description: "Set the courier and tracking/consignment ID of an order.",
    parameters: obj({ order: { type: "string" }, courier: { type: "string", description: "steadfast, pathao, redx, or own" }, tracking_id: { type: "string" } }, ["order", "courier"]),
    write: true,
    perm: "orders.edit",
    describe: (a) => `Order ${str(a.order)}: courier ${str(a.courier)}${a.tracking_id ? `, tracking ${str(a.tracking_id)}` : ""}`,
    run: (a, admin) => ops.setShipment(admin, str(a.order), str(a.courier) || null, str(a.tracking_id) || null),
  },
  {
    name: "mark_payment_received",
    description: "Mark an order's payment as received/verified (for bKash/online orders awaiting verification).",
    parameters: obj({ order: { type: "string" }, reference: { type: "string", description: "bKash TrxID (optional)" } }, ["order"]),
    write: true,
    perm: "orders.edit",
    describe: (a) => `Mark payment received for order ${str(a.order)}`,
    run: (a, admin) => ops.markPaymentPaid(admin, str(a.order), str(a.reference) || undefined),
  },
  {
    name: "add_order_note",
    description: "Add an internal note to an order's timeline.",
    parameters: obj({ order: { type: "string" }, note: { type: "string" } }, ["order", "note"]),
    write: true,
    perm: "orders.edit",
    describe: (a) => `Add note to order ${str(a.order)}: “${str(a.note).slice(0, 80)}”`,
    run: (a, admin) => ops.addOrderNote(admin, str(a.order), str(a.note)),
  },
  {
    name: "adjust_stock",
    description: "Add, remove, or set the stock quantity of a product variant by SKU.",
    parameters: obj({ sku: { type: "string" }, mode: { type: "string", enum: ["add", "remove", "set"] }, quantity: { type: "integer" }, reason: { type: "string" } }, ["sku", "mode", "quantity"]),
    write: true,
    perm: "inventory.adjust",
    describe: (a) => `Stock ${str(a.sku)}: ${str(a.mode)} ${int(a.quantity)}`,
    run: (a, admin) => {
      const q = Math.abs(int(a.quantity));
      const m = str(a.mode);
      return ops.adjustStock(admin, str(a.sku), m === "set" ? { set: q } : { delta: m === "remove" ? -q : q }, `[AI] ${str(a.reason) || "Stock adjustment"}`);
    },
  },
  {
    name: "set_price",
    description: "Change the selling price (BDT) of a product variant by SKU.",
    parameters: obj({ sku: { type: "string" }, price: { type: "integer" }, compare_at_price: { type: "integer", description: "Old/struck-through price (optional)" } }, ["sku", "price"]),
    write: true,
    perm: "products.edit",
    describe: (a) => `Price of ${str(a.sku)} → ৳${int(a.price)}`,
    run: (a, admin) => ops.setVariantPrice(admin, str(a.sku), int(a.price), a.compare_at_price == null ? undefined : int(a.compare_at_price) || null),
  },
  {
    name: "set_product_status",
    description: "Publish, hide (draft) or archive a product. Get product_id from list_products.",
    parameters: obj({ product_id: { type: "integer" }, status: { type: "string", enum: ["published", "draft", "archived"] } }, ["product_id", "status"]),
    write: true,
    perm: "products.edit",
    describe: (a) => `Product #${int(a.product_id)} → ${str(a.status)}`,
    run: (a, admin) => ops.setProductStatus(admin, int(a.product_id), str(a.status) as "draft"),
  },
  {
    name: "create_coupon",
    description: "Create a discount coupon. type: percent (value 1–100), fixed (value in BDT) or free_delivery.",
    parameters: obj({ code: { type: "string" }, type: { type: "string", enum: ["percent", "fixed", "free_delivery"] }, value: { type: "integer" }, min_order: { type: "integer" }, max_discount: { type: "integer" }, usage_limit: { type: "integer" }, first_order_only: { type: "boolean" }, valid_days: { type: "integer", description: "Expire after N days (optional)" } }, ["code", "type"]),
    write: true,
    perm: "coupons.edit",
    describe: (a) => `Create coupon ${str(a.code).toUpperCase()} (${str(a.type)}${a.value ? ` ${int(a.value)}` : ""})`,
    run: (a, admin) =>
      ops.createCoupon(admin, { code: str(a.code), type: str(a.type) as "percent", value: int(a.value), minOrder: int(a.min_order), maxDiscount: a.max_discount ? int(a.max_discount) : null, usageLimit: a.usage_limit ? int(a.usage_limit) : null, firstOrderOnly: !!a.first_order_only, endsAt: a.valid_days ? new Date(Date.now() + int(a.valid_days) * 86400000) : null }),
  },
  {
    name: "set_coupon_active",
    description: "Enable or disable a coupon by code.",
    parameters: obj({ code: { type: "string" }, active: { type: "boolean" } }, ["code", "active"]),
    write: true,
    perm: "coupons.edit",
    describe: (a) => `${a.active ? "Enable" : "Disable"} coupon ${str(a.code).toUpperCase()}`,
    run: (a, admin) => ops.setCouponActive(admin, str(a.code), !!a.active),
  },
  {
    name: "set_delivery_charge",
    description: "Change a delivery zone's charge (BDT) and optionally its free-delivery threshold. Get slugs from list_delivery_zones.",
    parameters: obj({ zone_slug: { type: "string" }, charge: { type: "integer" }, free_over: { type: "integer", description: "Free delivery above this order value; 0 = never" } }, ["zone_slug", "charge"]),
    write: true,
    perm: "shipping.edit",
    describe: (a) => `Delivery ${str(a.zone_slug)} → ৳${int(a.charge)}${a.free_over != null ? `, free over ৳${int(a.free_over)}` : ""}`,
    run: (a, admin) => ops.setZone(admin, str(a.zone_slug), { charge: Math.max(0, int(a.charge)), ...(a.free_over != null ? { freeOver: int(a.free_over) || null } : {}) }),
  },
  {
    name: "block_customer",
    description: "Block or unblock a customer by phone number (blocked customers' orders are flagged high-risk).",
    parameters: obj({ phone: { type: "string" }, blocked: { type: "boolean" }, reason: { type: "string" } }, ["phone", "blocked"]),
    write: true,
    perm: "customers.edit",
    describe: (a) => `${a.blocked ? "Block" : "Unblock"} customer ${str(a.phone)}`,
    run: (a, admin) => ops.setCustomerBlocked(admin, str(a.phone), !!a.blocked, str(a.reason) || undefined),
  },
  {
    name: "edit_block_list",
    description: "Add/remove a phone number or IP address on the block list (fake-order protection).",
    parameters: obj({ kind: { type: "string", enum: ["phone", "ip"] }, value: { type: "string" }, action: { type: "string", enum: ["add", "remove"] } }, ["kind", "value", "action"]),
    write: true,
    perm: "customers.edit",
    describe: (a) => `${str(a.action)} ${str(a.kind)} ${str(a.value)} on block list`,
    run: (a, admin) => ops.editBlockList(admin, str(a.kind) as "phone", str(a.value), str(a.action) as "add"),
  },
  {
    name: "update_message_status",
    description: "Set a contact message's status to new, in_progress or closed.",
    parameters: obj({ id: { type: "integer" }, status: { type: "string", enum: ["new", "in_progress", "closed"] } }, ["id", "status"]),
    write: true,
    perm: "content.edit",
    describe: (a) => `Message #${int(a.id)} → ${str(a.status)}`,
    run: (a, admin) => ops.setMessageStatus(admin, int(a.id), str(a.status) as "new"),
  },
];

export const AI_TOOLS: AiTool[] = [...READ, ...WRITE];
export const toolByName = (n: string) => AI_TOOLS.find((t) => t.name === n);
/** Tools this admin is allowed to use (so the model never even sees ones it can't run). */
export const toolsFor = (admin: AdminContext) => AI_TOOLS.filter((t) => can(admin.permissions, t.perm));

/** Run a tool with permission + safety checks. Throws on anything the admin may not do. */
export async function runTool(admin: AdminContext, name: string, args: Args) {
  const tool = toolByName(name);
  if (!tool) throw new Error(`Unknown tool ${name}`);
  if (!can(admin.permissions, tool.perm)) throw new Error(`Your role doesn’t have the “${tool.perm}” permission`);
  return tool.run(args ?? {}, admin);
}

