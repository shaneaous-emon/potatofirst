import Link from "next/link";
import { and, count, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { Banknote, Boxes, CircleDollarSign, ClipboardList, Clock, PackageCheck, Plus, ShoppingBag, ShoppingCart, TrendingUp, Users, Package, Wallet } from "lucide-react";
import { Card, Forbidden, OrderStatusBadge, PageHeader, StatCard, Table, Td, btn, fmtDate, taka } from "@/components/admin/ui";
import { db, t } from "@/db";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { SALE_STATUSES } from "@/lib/admin/queries/stats";

export const metadata = { title: "Dashboard" };

/** 00:00 today in Asia/Dhaka (UTC+6), as a UTC Date */
function dhakaDayStart() {
  const ms = new Date().getTime() + 6 * 3600000;
  return new Date(ms - (ms % 86400000) - 6 * 3600000);
}

export default async function Dashboard() {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "dashboard.view")) return <Forbidden perm="dashboard.view" />;
  const d = db();
  const dhakaMidnight = dhakaDayStart();
  const editable = can(admin.permissions, "orders.edit");

  const [[orders], [today], [products], [customers], [stock], [sales], [delivered], [pending], [profit], recent, latestCustomers] = await Promise.all([
    d.select({ n: count() }).from(t.orders),
    d.select({ n: count() }).from(t.orders).where(gte(t.orders.createdAt, dhakaMidnight)),
    d.select({ n: count() }).from(t.products).where(eq(t.products.status, "published")),
    d.select({ n: count() }).from(t.customers),
    d
      .select({
        units: sql<number>`coalesce(sum(${t.productVariants.stockOnHand}), 0)`,
        value: sql<number>`coalesce(sum(${t.productVariants.stockOnHand} * ${t.productVariants.price}), 0)`,
        cost: sql<number>`coalesce(sum(${t.productVariants.stockOnHand} * coalesce(${t.productVariants.costPrice}, 0)), 0)`,
      })
      .from(t.productVariants),
    d.select({ v: sql<number>`coalesce(sum(${t.orders.total}), 0)` }).from(t.orders).where(inArray(t.orders.status, [...SALE_STATUSES])),
    d.select({ n: count() }).from(t.orders).where(eq(t.orders.status, "delivered")),
    d.select({ n: count() }).from(t.orders).where(eq(t.orders.status, "pending")),
    // profit on delivered orders = Σ qty × (price − cost) − coupon discounts
    d
      .select({ v: sql<number>`coalesce(sum(${t.orderItems.quantity} * (${t.orderItems.unitPrice} - coalesce(${t.orderItems.costPrice}, 0))), 0)` })
      .from(t.orderItems)
      .innerJoin(t.orders, eq(t.orders.id, t.orderItems.orderId))
      .where(and(eq(t.orders.status, "delivered"))),
    d.select().from(t.orders).orderBy(desc(t.orders.createdAt)).limit(10),
    d.select().from(t.customers).orderBy(desc(t.customers.createdAt)).limit(6),
  ]);
  const [disc] = await d.select({ v: sql<number>`coalesce(sum(${t.orders.discount}), 0)` }).from(t.orders).where(eq(t.orders.status, "delivered"));
  const netProfit = Number(profit.v) - Number(disc.v);

  return (
    <>
      <PageHeader
        title={`Hello, ${admin.name.split(" ")[0]}`}
        description="A quick look at your store."
        actions={
          <>
            {editable && (
              <Link href="/admin/orders/new" className={btn.outline}>
                <Plus /> New order
              </Link>
            )}
            {can(admin.permissions, "products.create") && (
              <Link href="/admin/products/new" className={btn.outline}>
                <Plus /> Product
              </Link>
            )}
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total orders" value={orders.n} href="/admin/orders" icon={<ShoppingCart />} />
        <StatCard label="Today’s orders" value={today.n} href="/admin/orders?range=today" icon={<ShoppingBag />} tone={today.n ? "good" : "default"} />
        <StatCard label="Pending" value={pending.n} href="/admin/orders?status=pending" icon={<Clock />} tone={pending.n ? "warn" : "default"} hint="waiting for confirmation" />
        <StatCard label="Delivered" value={delivered.n} href="/admin/orders?status=delivered" icon={<PackageCheck />} tone="good" />
        <StatCard label="Products" value={products.n} href="/admin/products" icon={<Package />} hint="published" />
        <StatCard label="Customers" value={customers.n} href="/admin/customers" icon={<Users />} />
        <StatCard label="Total sales" value={taka(Number(sales.v))} href="/admin/reports" icon={<TrendingUp />} hint="excl. cancelled / returned" />
        <StatCard label="Net profit" value={taka(netProfit)} icon={<CircleDollarSign />} tone={netProfit > 0 ? "good" : "default"} hint="delivered orders" />
        <StatCard label="Stock (units)" value={`${Number(stock.units)} pcs`} href="/admin/inventory" icon={<Boxes />} />
        <StatCard label="Stock value" value={taka(Number(stock.value))} icon={<Banknote />} hint="at selling price" />
        <StatCard label="Purchase value" value={taka(Number(stock.cost))} icon={<Wallet />} hint="at cost price" />
        <StatCard label="Reports" value="View" href="/admin/reports" icon={<ClipboardList />} hint="orders & stock" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_380px]">
        <Card title="Latest 10 orders" actions={<Link href="/admin/orders" className={btn.ghost}>View all</Link>} bodyClassName="p-0 sm:p-0">
          <Table head={["Order", "Customer", "Amount", "Status", "Date"]} empty="No orders yet.">
            {recent.map((o) => (
              <tr key={o.id} className="hover:bg-cream-50">
                <Td>
                  <Link href={`/admin/orders/${o.id}`} className="font-semibold text-brown-700 hover:underline">
                    #{o.number}
                  </Link>
                </Td>
                <Td>
                  {o.name}
                  <span className="block text-[12px] text-ink-muted">{o.phone}</span>
                </Td>
                <Td className="whitespace-nowrap font-medium">{taka(o.total)}</Td>
                <Td>
                  <OrderStatusBadge status={o.status} />
                </Td>
                <Td className="whitespace-nowrap text-[13px] text-ink-muted">{fmtDate(o.createdAt)}</Td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card title="Latest customers" actions={<Link href="/admin/customers" className={btn.ghost}>View all</Link>} bodyClassName="p-0 sm:p-0">
          <ul className="divide-y divide-line">
            {latestCustomers.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-4 py-3 text-[14px]">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cream-200 text-[13px] font-semibold">{c.name.charAt(0)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{c.name}</span>
                  <span className="block text-[12px] text-ink-muted">{c.phone ?? c.email ?? "—"}</span>
                </span>
                <span className="text-[12px] text-ink-muted">{fmtDate(c.createdAt, false)}</span>
              </li>
            ))}
            {!latestCustomers.length && <li className="px-4 py-8 text-center text-[14px] text-ink-muted">No customers yet.</li>}
          </ul>
        </Card>
      </div>
    </>
  );
}
