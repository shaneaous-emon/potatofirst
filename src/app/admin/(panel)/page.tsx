import Link from "next/link";
import { and, count, desc, eq, gt, isNotNull, lte } from "drizzle-orm";
import { AlertTriangle, Boxes, CalendarClock, MessageSquare, Plus, ShieldAlert, ShoppingBag, Star, TicketPercent } from "lucide-react";
import { BarTrend, ShareBars } from "@/components/admin/charts";
import { RangeFilter } from "@/components/admin/range-filter";
import { Card, Forbidden, OrderStatusBadge, PageHeader, StatCard, Table, Td, btn, fmtDate, taka, ORDER_STATUS_META } from "@/components/admin/ui";
import { db, t } from "@/db";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { salesSummary, salesTrend, topProducts } from "@/lib/admin/queries/stats";
import { resolveRange } from "@/lib/admin/range";
import { getSetting } from "@/lib/settings";

export const metadata = { title: "Dashboard" };

const pct = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 100) : a ? 100 : 0);

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "dashboard.view")) return <Forbidden perm="dashboard.view" />;
  const sp = (await searchParams) as Record<string, string>;
  const r = resolveRange(sp);
  const inv = await getSetting("inventory");
  const d = db();
  const soon = new Date(Date.now() + inv.nearExpiryDays * 86400000);

  const [cur, prev, trend, top, recent, [low], [out], [expiring], [highRisk], [pendingReviews], [newMsgs]] = await Promise.all([
    salesSummary(r.from, r.to),
    salesSummary(r.prevFrom, r.from),
    salesTrend(r.from, r.to),
    topProducts(r.from, r.to),
    d.select().from(t.orders).orderBy(desc(t.orders.createdAt)).limit(6),
    d.select({ n: count() }).from(t.productVariants).where(and(lte(t.productVariants.stockOnHand, t.productVariants.lowStockThreshold), gt(t.productVariants.stockOnHand, 0))),
    d.select({ n: count() }).from(t.productVariants).where(lte(t.productVariants.stockOnHand, 0)),
    d.select({ n: count() }).from(t.inventoryBatches).where(and(isNotNull(t.inventoryBatches.expiresAt), lte(t.inventoryBatches.expiresAt, soon), gt(t.inventoryBatches.remainingQty, 0))),
    d.select({ n: count() }).from(t.orders).where(and(eq(t.orders.riskLevel, "high"), eq(t.orders.fraudDecision, "none"))),
    d.select({ n: count() }).from(t.reviews).where(eq(t.reviews.status, "pending")),
    d.select({ n: count() }).from(t.contactMessages).where(eq(t.contactMessages.status, "new")),
  ]);

  const delta = (a: number, b: number) => {
    const p = pct(a, b);
    return `${p >= 0 ? "▲" : "▼"} ${Math.abs(p)}% vs previous period`;
  };
  const alerts = [
    { n: cur.pending, label: "orders waiting for confirmation", href: "/admin/orders?status=pending", icon: <ShoppingBag />, tone: "orange" },
    { n: highRisk.n, label: "high-risk orders to review", href: "/admin/fraud", icon: <ShieldAlert />, tone: "red" },
    { n: out.n, label: "variants out of stock", href: "/admin/inventory?filter=out", icon: <Boxes />, tone: "red" },
    { n: low.n, label: "variants low on stock", href: "/admin/inventory?filter=low", icon: <AlertTriangle />, tone: "orange" },
    { n: expiring.n, label: `batches expiring within ${inv.nearExpiryDays} days`, href: "/admin/inventory/batches?filter=expiring", icon: <CalendarClock />, tone: "orange" },
    { n: pendingReviews.n, label: "reviews to moderate", href: "/admin/reviews?status=pending", icon: <Star />, tone: "orange" },
    { n: newMsgs.n, label: "new contact messages", href: "/admin/content/messages", icon: <MessageSquare />, tone: "orange" },
  ].filter((a) => a.n > 0);

  return (
    <>
      <PageHeader
        title={`Hello, ${admin.name.split(" ")[0]}`}
        description="Here’s how the store is doing."
        actions={
          <>
            {can(admin.permissions, "orders.edit") && (
              <Link href="/admin/orders/new" className={btn.outline}>
                <Plus /> New order
              </Link>
            )}
            {can(admin.permissions, "products.create") && (
              <Link href="/admin/products/new" className={btn.outline}>
                <Plus /> Product
              </Link>
            )}
            {can(admin.permissions, "coupons.edit") && (
              <Link href="/admin/coupons" className={btn.outline}>
                <TicketPercent /> Coupon
              </Link>
            )}
          </>
        }
      />
      <div className="mb-5">
        <RangeFilter current={r.key} from={r.fromStr} to={r.toStr} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Net sales" value={taka(cur.net)} hint={delta(cur.net, prev.net)} href="/admin/reports" />
        <StatCard label="Orders" value={cur.orders} hint={delta(cur.orders, prev.orders)} href="/admin/orders" />
        <StatCard label="Avg. order value" value={taka(cur.aov)} hint={delta(cur.aov, prev.aov)} />
        <StatCard label="New customers" value={cur.newCustomers} hint={delta(cur.newCustomers, prev.newCustomers)} href="/admin/customers" />
        <StatCard label="Delivered" value={cur.delivered} tone="good" href="/admin/orders?status=delivered" />
        <StatCard label="Pending" value={cur.pending} tone={cur.pending ? "warn" : "default"} href="/admin/orders?status=pending" />
        <StatCard label="Cancelled / failed" value={cur.cancelled} href="/admin/orders?status=cancelled" />
        <StatCard label="Returns & refunds" value={taka(cur.refunds)} tone={cur.refunds ? "danger" : "default"} />
      </div>

      {alerts.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          {alerts.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className={`flex items-center gap-3 rounded-md border bg-white px-4 py-3 text-[14px] transition-colors hover:border-brown-700 [&_svg]:size-[18px] ${a.tone === "red" ? "border-sale/40 [&_svg]:text-sale" : "border-orange-500/40 [&_svg]:text-orange-600"}`}
            >
              {a.icon}
              <span>
                <b className="font-semibold">{a.n}</b> {a.label}
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
        <Card title="Sales trend" actions={<span className="text-[13px] text-ink-muted">Gross {taka(cur.gross)}</span>}>
          <BarTrend data={trend} />
        </Card>
        <Card title="Order status">
          <ShareBars
            rows={cur.byStatus
              .sort((a, b) => b.n - a.n)
              .map((s) => ({ label: ORDER_STATUS_META[s.status]?.label ?? s.status, value: s.n, tone: s.status === "delivered" ? "bg-green-500" : ["cancelled", "returned", "failed", "refunded"].includes(s.status) ? "bg-sale" : "bg-orange-500" }))}
          />
        </Card>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
        <Card title="Recent orders" actions={<Link href="/admin/orders" className={btn.ghost}>View all</Link>} bodyClassName="p-0 sm:p-0">
          <Table head={["Order", "Customer", "Total", "Status", "Date"]}>
            {recent.map((o) => (
              <tr key={o.id} className="hover:bg-cream-50">
                <Td>
                  <Link href={`/admin/orders/${o.id}`} className="font-medium text-brown-700 hover:underline">
                    #{o.number}
                  </Link>
                </Td>
                <Td>
                  {o.name}
                  <span className="block text-[12px] text-ink-muted">{o.phone}</span>
                </Td>
                <Td>{taka(o.total)}</Td>
                <Td>
                  <OrderStatusBadge status={o.status} />
                </Td>
                <Td className="whitespace-nowrap text-[13px] text-ink-muted">{fmtDate(o.createdAt)}</Td>
              </tr>
            ))}
          </Table>
        </Card>
        <div className="flex flex-col gap-5">
          <Card title="Top products">
            <ol className="flex flex-col gap-3">
              {top.map((p, i) => (
                <li key={p.name} className="flex items-center gap-3 text-[14px]">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-cream-200 text-[12px] font-semibold">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  <span className="text-right text-[13px]">
                    {taka(Number(p.revenue))}
                    <span className="block text-[11px] text-ink-muted">{Number(p.qty)} sold</span>
                  </span>
                </li>
              ))}
              {!top.length && <li className="text-[14px] text-ink-muted">No sales in this period.</li>}
            </ol>
          </Card>
          <Card title="Payment methods">
            <ShareBars rows={cur.byPayment.map((p) => ({ label: p.method === "cod" ? "Cash on Delivery" : p.method === "bkash" ? "bKash" : "Online", value: p.n, display: `${p.n} · ${taka(p.value)}`, tone: p.method === "bkash" ? "bg-[#e2136e]" : "bg-brown-700" }))} />
          </Card>
        </div>
      </div>
    </>
  );
}
