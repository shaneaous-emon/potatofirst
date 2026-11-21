import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { db, t } from "@/db";
import { getAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { getSetting } from "@/lib/settings";
import { PrintButton } from "./print-button";

const tk = (n: number) => `৳ ${n.toLocaleString("en-IN")}`;

async function Invoice({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  if (!can(admin.permissions, "orders.view")) return <p className="p-8">Forbidden</p>;
  const { id } = await params;
  const [o] = await db().select().from(t.orders).where(eq(t.orders.id, Number(id)));
  if (!o) notFound();
  const [items, store] = await Promise.all([db().select().from(t.orderItems).where(eq(t.orderItems.orderId, o.id)), getSetting("store")]);
  return (
    <div className="mx-auto max-w-[780px] bg-white p-8 text-[13px] text-ink print:p-0">
      <div className="mb-6 flex items-start justify-between gap-6 border-b-2 border-brown-700 pb-5">
        <div>
          <p className="font-display text-2xl font-bold text-brown-700">{store.name}</p>
          <p className="text-ink-soft">{store.address}</p>
          <p className="text-ink-soft">
            {store.hotline} · {store.email}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-semibold">INVOICE</p>
          <p>#{o.number}</p>
          <p className="text-ink-soft">{new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", dateStyle: "medium" }).format(o.createdAt)}</p>
        </div>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-6">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Deliver to</p>
          <p className="font-semibold">{o.name}</p>
          <p>{o.phone}</p>
          <p>{o.address}</p>
          <p className="text-ink-soft">{o.zoneLabel}</p>
        </div>
        <div className="text-right">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Payment</p>
          <p>{o.paymentMethod === "cod" ? "Cash on Delivery" : o.paymentMethod === "bkash" ? "bKash" : "Online"} · {o.paymentStatus}</p>
          {o.courier && <p className="capitalize">Courier: {o.courier}</p>}
          {o.trackingId && <p>Tracking: {o.trackingId}</p>}
          {o.paymentMethod === "cod" && o.paymentStatus !== "paid" && <p className="mt-1 text-[16px] font-bold">Collect: {tk(o.total)}</p>}
        </div>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-ink text-left">
            <th className="py-2">Item</th>
            <th className="py-2">SKU</th>
            <th className="py-2 text-right">Price</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id} className="border-b border-line">
              <td className="py-2">
                {i.name} <span className="text-ink-muted">({i.variantLabel})</span>
              </td>
              <td className="py-2 text-ink-soft">{i.sku}</td>
              <td className="py-2 text-right">{tk(i.unitPrice)}</td>
              <td className="py-2 text-right">{i.quantity}</td>
              <td className="py-2 text-right">{tk(i.unitPrice * i.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ml-auto mt-4 w-64 space-y-1">
        <p className="flex justify-between"><span>Subtotal</span><span>{tk(o.subtotal)}</span></p>
        <p className="flex justify-between"><span>Delivery</span><span>{tk(o.deliveryCharge)}</span></p>
        {o.discount > 0 && <p className="flex justify-between"><span>Discount</span><span>− {tk(o.discount)}</span></p>}
        <p className="flex justify-between border-t border-ink pt-1 text-[15px] font-bold"><span>Total</span><span>{tk(o.total)}</span></p>
      </div>
      {o.note && <p className="mt-6 rounded bg-cream-100 p-3">Note: {o.note}</p>}
      <p className="mt-10 text-center text-ink-muted">Thank you for choosing {store.name}! · {store.tagline}</p>
      <PrintButton />
    </div>
  );
}

export default function InvoicePage(props: PageProps<"/admin/orders/[id]/invoice">) {
  return (
    <Suspense>
      <Invoice params={props.params} />
    </Suspense>
  );
}
