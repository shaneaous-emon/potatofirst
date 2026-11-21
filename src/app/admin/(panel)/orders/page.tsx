import Link from "next/link";
import { count, desc, inArray } from "drizzle-orm";
import { Download, Plus } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { OrderStatusSelect } from "@/components/admin/order-status-select";
import { Forbidden, PageHeader, Pagination, SearchFilter, Select, Table, Td, btn, fmtDate, taka, ORDER_STATUS_META } from "@/components/admin/ui";
import { db, t } from "@/db";
import { ORDER_STATUSES } from "@/db/schema";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { orderFilters } from "@/lib/admin/queries/orders";
import { reachableStatuses } from "@/lib/services/orders.server";
import { bulkStatusAction } from "../../_actions/orders";

export const metadata = { title: "Orders" };
const PER = 20;

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "orders.view")) return <Forbidden perm="orders.view" />;
  const sp = (await searchParams) as Record<string, string>;
  const page = Math.max(1, Number(sp.page) || 1);
  const where = orderFilters(sp);
  const d = db();
  const [rows, [{ n }], counts] = await Promise.all([
    d.select().from(t.orders).where(where).orderBy(desc(t.orders.createdAt)).limit(PER).offset((page - 1) * PER),
    d.select({ n: count() }).from(t.orders).where(where),
    d.select({ status: t.orders.status, n: count() }).from(t.orders).groupBy(t.orders.status),
  ]);
  const items = rows.length ? await d.select().from(t.orderItems).where(inArray(t.orderItems.orderId, rows.map((r) => r.id))) : [];
  const qs = (patch: Record<string, string | undefined>) => {
    const u = new URLSearchParams(Object.entries({ ...sp, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/admin/orders${u.size ? `?${u}` : ""}`;
  };
  const editable = can(admin.permissions, "orders.edit");
  const total = counts.reduce((a, c) => a + c.n, 0);
  const chip = (active: boolean) => `shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${active ? "border-brown-700 bg-brown-700 text-cream-100" : "border-line bg-white hover:border-brown-700"}`;

  return (
    <>
      <PageHeader
        title="Orders"
        description="Change an order’s status right from the list — pick the next step in the dropdown."
        actions={
          <>
            {can(admin.permissions, "orders.export") && (
              <a href={`/admin/orders/export?${new URLSearchParams(sp)}`} className={btn.outline}>
                <Download /> Export CSV
              </a>
            )}
            {editable && (
              <Link href="/admin/orders/new" className={btn.primary}>
                <Plus /> New order
              </Link>
            )}
          </>
        }
      />

      <div className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <Link href={qs({ status: undefined, page: undefined })} className={chip(!sp.status)}>
          All <span className="opacity-60">{total}</span>
        </Link>
        {ORDER_STATUSES.map((s) => {
          const c = counts.find((x) => x.status === s)?.n ?? 0;
          if (!c && sp.status !== s) return null;
          return (
            <Link key={s} href={qs({ status: s, page: undefined })} className={chip(sp.status === s)}>
              {ORDER_STATUS_META[s].label} <span className="opacity-60">{c}</span>
            </Link>
          );
        })}
      </div>

      <SearchFilter placeholder="Order no., phone, name or tracking ID" defaultValue={sp.q}>
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        <Select name="payment" defaultValue={sp.payment ?? ""} options={[{ value: "", label: "All payments" }, { value: "cod", label: "Cash on Delivery" }, { value: "bkash", label: "bKash" }, { value: "online", label: "Online" }]} />
        <Select name="range" defaultValue={sp.range ?? ""} options={[{ value: "", label: "Any date" }, { value: "today", label: "Today" }, { value: "yesterday", label: "Yesterday" }, { value: "7d", label: "Last 7 days" }, { value: "30d", label: "Last 30 days" }, { value: "month", label: "This month" }]} />
      </SearchFilter>

      <ActionForm action={bulkStatusAction}>
        {editable && (
          <details className="mb-3 text-[13px]">
            <summary className="cursor-pointer text-ink-muted hover:text-brown-700">Bulk update (tick orders below)</summary>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Select name="bulkStatus" defaultValue="" options={[{ value: "", label: "Move selected to…" }, ...ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_META[s].label }))]} />
              <SubmitButton className="h-10">Apply</SubmitButton>
            </div>
          </details>
        )}
        <Table head={[editable ? "" : null, "Order", "Customer", "Items", "Total", "Payment", "Status", "Date"].filter((h) => h !== null)} empty="No orders match these filters.">
          {rows.map((o) => {
            const its = items.filter((i) => i.orderId === o.id);
            return (
              <tr key={o.id} className="hover:bg-cream-50">
                {editable && (
                  <Td className="w-8">
                    <input type="checkbox" name="ids" value={o.id} aria-label={`Select order ${o.number}`} className="size-4 cursor-pointer accent-brown-700" />
                  </Td>
                )}
                <Td>
                  <Link href={`/admin/orders/${o.id}`} className="font-semibold text-brown-700 hover:underline">
                    #{o.number}
                  </Link>
                  <span className="block text-[12px] capitalize text-ink-muted">{o.source}</span>
                </Td>
                <Td>
                  {o.name}
                  <span className="block text-[12px] text-ink-muted">{o.phone}</span>
                </Td>
                <Td className="max-w-[220px] text-[13px]">
                  <span className="line-clamp-2">{its.map((i) => `${i.name} (${i.variantLabel}) ×${i.quantity}`).join(", ") || "—"}</span>
                </Td>
                <Td className="whitespace-nowrap font-medium">
                  {taka(o.total)}
                  <span className="block text-[12px] font-normal text-ink-muted">{o.zoneLabel}</span>
                </Td>
                <Td className="whitespace-nowrap text-[13px]">
                  {o.paymentMethod === "cod" ? "COD" : o.paymentMethod === "bkash" ? "bKash" : "Online"}
                  <span className={`block text-[12px] ${o.paymentStatus === "paid" ? "text-green-600" : o.paymentStatus === "pending" ? "text-ink-muted" : "text-sale"}`}>{o.paymentStatus.replace("_", " ")}</span>
                </Td>
                <Td>
                  {editable ? (
                    <OrderStatusSelect key={`${o.id}-${o.status}`} orderId={o.id} status={o.status} options={reachableStatuses(o.status)} />
                  ) : (
                    <span className="text-[13px]">{ORDER_STATUS_META[o.status].label}</span>
                  )}
                  {o.courier && (
                    <span className="mt-1 block text-[12px] capitalize text-ink-muted">
                      {o.courier}
                      {o.trackingId ? ` · ${o.trackingId}` : ""}
                    </span>
                  )}
                </Td>
                <Td className="whitespace-nowrap text-[13px] text-ink-muted">{fmtDate(o.createdAt)}</Td>
              </tr>
            );
          })}
        </Table>
      </ActionForm>
      <Pagination page={page} pages={Math.ceil(n / PER)} total={n} makeHref={(p) => qs({ page: String(p) })} />
    </>
  );
}
