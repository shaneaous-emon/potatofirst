import { and, asc, eq, lte } from "drizzle-orm";
import { BarTrend, ShareBars } from "@/components/admin/charts";
import { RangeFilter } from "@/components/admin/range-filter";
import { Card, Forbidden, PageHeader, StatCard, Table, Td, taka, ORDER_STATUS_META } from "@/components/admin/ui";
import { db, t } from "@/db";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { salesSummary, salesTrend, topProducts } from "@/lib/admin/queries/stats";
import { resolveRange } from "@/lib/admin/range";

export const metadata = { title: "Reports" };

export default async function ReportsPage({ searchParams }: PageProps<"/admin/reports">) {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "reports.view")) return <Forbidden perm="reports.view" />;
  const sp = (await searchParams) as Record<string, string>;
  const r = resolveRange(sp);
  const [s, trend, top, low] = await Promise.all([
    salesSummary(r.from, r.to),
    salesTrend(r.from, r.to),
    topProducts(r.from, r.to, 10),
    db()
      .select({ name: t.products.name, label: t.productVariants.label, sku: t.productVariants.sku, stock: t.productVariants.stockOnHand })
      .from(t.productVariants)
      .innerJoin(t.products, eq(t.products.id, t.productVariants.productId))
      .where(and(eq(t.productVariants.active, true), lte(t.productVariants.stockOnHand, t.productVariants.lowStockThreshold)))
      .orderBy(asc(t.productVariants.stockOnHand))
      .limit(15),
  ]);
  return (
    <>
      <PageHeader title="Reports" description="Sales, order and stock reports for any period." />
      <div className="mb-5">
        <RangeFilter current={r.key} from={r.fromStr} to={r.toStr} />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Net sales" value={taka(s.net)} hint="excl. cancelled / returned" />
        <StatCard label="Orders" value={s.orders} />
        <StatCard label="Avg. order value" value={taka(s.aov)} />
        <StatCard label="New customers" value={s.newCustomers} />
        <StatCard label="Delivered" value={s.delivered} tone="good" />
        <StatCard label="Pending" value={s.pending} tone={s.pending ? "warn" : "default"} />
        <StatCard label="Cancelled / failed" value={s.cancelled} />
        <StatCard label="Returns & refunds" value={taka(s.refunds)} tone={s.refunds ? "danger" : "default"} />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
        <Card title="Daily sales">
          <BarTrend data={trend} />
        </Card>
        <Card title="Orders by status">
          <ShareBars rows={s.byStatus.sort((a, b) => b.n - a.n).map((x) => ({ label: ORDER_STATUS_META[x.status]?.label ?? x.status, value: x.n, tone: x.status === "delivered" ? "bg-green-500" : ["cancelled", "returned", "failed", "refunded"].includes(x.status) ? "bg-sale" : "bg-orange-500" }))} />
        </Card>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card title="Best-selling products" bodyClassName="p-0 sm:p-0">
          <Table head={["Product", "Sold", "Revenue", "Profit"]} empty="No sales in this period.">
            {top.map((p) => (
              <tr key={p.name}>
                <Td>{p.name}</Td>
                <Td>{Number(p.qty)}</Td>
                <Td>{taka(Number(p.revenue))}</Td>
                <Td className="text-green-600">{taka(Number(p.revenue) - Number(p.cost))}</Td>
              </tr>
            ))}
          </Table>
        </Card>
        <Card title="Stock report — low / out of stock" bodyClassName="p-0 sm:p-0">
          <Table head={["Product", "SKU", "Stock"]} empty="Everything is well stocked.">
            {low.map((x) => (
              <tr key={x.sku}>
                <Td>
                  {x.name} <span className="text-[12px] text-ink-muted">{x.label}</span>
                </Td>
                <Td className="font-mono text-[12px]">{x.sku}</Td>
                <Td className={x.stock <= 0 ? "font-semibold text-sale" : "font-semibold text-orange-600"}>{x.stock}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </>
  );
}
