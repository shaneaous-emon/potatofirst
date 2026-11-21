import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { ExternalLink, MessageCircle, Phone, Printer } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Badge, Card, Field, Forbidden, OrderStatusBadge, PageHeader, RiskBadge, Select, btn, fmtDate, inputCls, taka, textareaCls, ORDER_STATUS_META } from "@/components/admin/ui";
import { db, t } from "@/db";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { COURIERS, courierTrackingUrl } from "@/lib/couriers";
import { TRANSITIONS, successRatio } from "@/lib/services/orders.server";
import { assignAction, fraudDecisionAction, noteAction, paymentAction, updateShipmentAction, updateStatusAction } from "../../../_actions/orders";

export const metadata = { title: "Order" };

export default async function OrderDetail({ params, searchParams }: PageProps<"/admin/orders/[id]">) {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "orders.view")) return <Forbidden perm="orders.view" />;
  const { id } = await params;
  const sp = (await searchParams) as Record<string, string>;
  const d = db();
  const [o] = await d.select().from(t.orders).where(eq(t.orders.id, Number(id)));
  if (!o) notFound();
  const [items, history, pays, admins, sr] = await Promise.all([
    d.select().from(t.orderItems).where(eq(t.orderItems.orderId, o.id)),
    d.select({ h: t.orderHistory, by: t.adminUsers.name }).from(t.orderHistory).leftJoin(t.adminUsers, eq(t.adminUsers.id, t.orderHistory.adminId)).where(eq(t.orderHistory.orderId, o.id)).orderBy(desc(t.orderHistory.createdAt), desc(t.orderHistory.id)),
    d.select().from(t.payments).where(eq(t.payments.orderId, o.id)).orderBy(asc(t.payments.createdAt)),
    d.select({ id: t.adminUsers.id, name: t.adminUsers.name }).from(t.adminUsers).where(eq(t.adminUsers.active, true)),
    successRatio(o.phone),
  ]);
  const edit = can(admin.permissions, "orders.edit");
  const next = TRANSITIONS[o.status];
  const refunded = pays.filter((p) => p.kind === "refund").reduce((a, p) => a + p.amount, 0);
  const trackUrl = o.courier && o.trackingId ? courierTrackingUrl(o.courier, o.trackingId) : null;
  const wa = `https://wa.me/88${o.phone}`;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/orders", label: "Orders" }}
        title={`Order #${o.number}`}
        description={`${fmtDate(o.createdAt)} · ${o.source}`}
        actions={
          <>
            <OrderStatusBadge status={o.status} />
            <Link href={`/admin/orders/${o.id}/invoice`} target="_blank" className={btn.outline}>
              <Printer /> Invoice / packing slip
            </Link>
          </>
        }
      />
      {sp.created && <p className="mb-4 rounded-sm bg-green-100 px-4 py-2.5 text-[14px] text-green-600">Order #{sp.created} created.</p>}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-5">
          {/* mobile-first order: summary → customer → items → payment → delivery → timeline */}
          <Card title="Items">
            <ul className="divide-y divide-line">
              {items.map((it) => (
                <li key={it.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  {it.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image} alt="" className="size-14 shrink-0 rounded-sm bg-cream-100 object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{it.name}</p>
                    <p className="text-[13px] text-ink-muted">
                      {it.variantLabel} · {it.sku}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-right text-[14px]">
                    {taka(it.unitPrice)} × {it.quantity}
                    <span className="block font-semibold">{taka(it.unitPrice * it.quantity)}</span>
                  </p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Subtotal</dt>
                <dd>{taka(o.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Delivery ({o.zoneLabel})</dt>
                <dd>{o.deliveryCharge ? taka(o.deliveryCharge) : "Free"}</dd>
              </div>
              {o.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <dt>Discount {o.couponCode && `(${o.couponCode})`}</dt>
                  <dd>− {taka(o.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between pt-1 text-[16px] font-semibold">
                <dt>Total</dt>
                <dd>{taka(o.total)}</dd>
              </div>
              {refunded > 0 && (
                <div className="flex justify-between text-sale">
                  <dt>Refunded</dt>
                  <dd>− {taka(refunded)}</dd>
                </div>
              )}
            </dl>
            {o.note && <p className="mt-4 rounded-sm bg-cream-100 px-3 py-2 text-[14px]">📝 Customer note: {o.note}</p>}
          </Card>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card title="Payment" actions={<Badge tone={o.paymentStatus === "paid" ? "green" : o.paymentStatus === "pending" ? "orange" : "red"}>{o.paymentStatus.replace("_", " ")}</Badge>}>
              <p className="text-[14px]">
                {o.paymentMethod === "cod" ? "Cash on Delivery" : o.paymentMethod === "bkash" ? "bKash (manual)" : "Online"}
                {o.bkashTrxId && <span className="block text-[13px] text-ink-muted">TrxID: {o.bkashTrxId}</span>}
              </p>
              {pays.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1.5 text-[13px]">
                  {pays.map((p) => (
                    <li key={p.id} className="flex justify-between gap-2 rounded-sm bg-cream-50 px-2.5 py-1.5">
                      <span>
                        {p.kind === "refund" ? "Refund" : p.method.toUpperCase()} · {p.status}
                        {p.note && <span className="block text-ink-muted">{p.note}</span>}
                      </span>
                      <span className={p.kind === "refund" ? "text-sale" : ""}>{taka(p.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {edit && o.paymentStatus === "pending" && o.paymentMethod !== "cod" && (
                <ActionForm action={paymentAction} className="mt-3 flex flex-wrap gap-2">
                  <input type="hidden" name="id" value={o.id} />
                  <SubmitButton name="decision" value="paid" className="bg-green-600 hover:bg-green-500">
                    Verify payment
                  </SubmitButton>
                  <SubmitButton name="decision" value="failed" className="bg-white text-sale ring-1 ring-sale/40 hover:bg-sale hover:text-white">
                    Not received
                  </SubmitButton>
                </ActionForm>
              )}
              {can(admin.permissions, "payments.refund") && o.paymentStatus === "paid" && (
                <details className="mt-3 text-[14px]">
                  <summary className="cursor-pointer font-medium text-brown-700">Record a refund</summary>
                  <ActionForm action={paymentAction} confirm="Record this refund? It will be logged." className="mt-2 flex flex-col gap-2">
                    <input type="hidden" name="id" value={o.id} />
                    <input type="hidden" name="decision" value="refund" />
                    <input name="amount" type="number" min={1} max={o.total - refunded} placeholder={`Amount (max ${o.total - refunded})`} className={inputCls} />
                    <input name="reference" placeholder="bKash TrxID / reference (optional)" className={inputCls} />
                    <input name="reason" placeholder="Reason (required)" className={inputCls} />
                    <SubmitButton>Save refund</SubmitButton>
                  </ActionForm>
                </details>
              )}
            </Card>

            <Card title="Delivery">
              <p className="text-[14px]">{o.zoneLabel}</p>
              {trackUrl && (
                <a href={trackUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[13px] text-brown-700 hover:underline">
                  Track on {COURIERS.find((c) => c.slug === o.courier)?.name} <ExternalLink className="size-3.5" />
                </a>
              )}
              {edit && (
                <ActionForm action={updateShipmentAction} className="mt-3 flex flex-col gap-2">
                  <input type="hidden" name="id" value={o.id} />
                  <Select name="courier" defaultValue={o.courier ?? ""} options={[{ value: "", label: "Choose courier" }, ...COURIERS.map((c) => ({ value: c.slug, label: c.name })), { value: "own", label: "Own delivery" }]} />
                  <input name="trackingId" defaultValue={o.trackingId ?? ""} placeholder="Consignment / tracking ID" className={inputCls} />
                  <SubmitButton>Save shipment</SubmitButton>
                  <p className="text-[12px] text-ink-muted">Book the parcel in the courier’s merchant panel and paste the consignment ID. Automatic booking switches on in Couriers once API keys are added.</p>
                </ActionForm>
              )}
            </Card>
          </div>

          <Card title="Timeline">
            {edit && (
              <ActionForm action={noteAction} resetOnSuccess className="mb-4 flex gap-2">
                <input type="hidden" name="id" value={o.id} />
                <input name="note" placeholder="Add an internal note (e.g. called customer, confirmed address)" className={inputCls} />
                <SubmitButton>Add</SubmitButton>
              </ActionForm>
            )}
            <ol className="relative flex flex-col gap-4 border-l-2 border-line pl-5">
              {history.map(({ h, by }) => (
                <li key={h.id} className="relative text-[14px]">
                  <span className={`absolute -left-[27px] top-1 size-3 rounded-full ring-4 ring-white ${h.toStatus === "note" ? "bg-cream-200" : "bg-orange-500"}`} />
                  {h.toStatus === "note" ? <p className="text-ink">{h.note}</p> : <p className="font-medium text-ink">{ORDER_STATUS_META[h.toStatus]?.label ?? h.toStatus}</p>}
                  {h.toStatus !== "note" && h.note && <p className="text-ink-soft">{h.note}</p>}
                  <p className="text-[12px] text-ink-muted">
                    {fmtDate(h.createdAt)} · {by ?? "System"}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          {edit && next.length > 0 && (
            <Card title="Update status">
              <ActionForm action={updateStatusAction} className="flex flex-col gap-3">
                <input type="hidden" name="id" value={o.id} />
                <div className="grid grid-cols-2 gap-2">
                  {next.map((s) => (
                    <label key={s} className="flex cursor-pointer items-center gap-2 rounded-sm border border-line px-3 py-2 text-[14px] has-[:checked]:border-orange-500 has-[:checked]:bg-orange-100">
                      <input type="radio" name="status" value={s} required className="accent-brown-700" /> {ORDER_STATUS_META[s].label}
                    </label>
                  ))}
                </div>
                {next.includes("cancelled") && <input name="cancelReason" placeholder="Cancel reason (if cancelling)" className={inputCls} />}
                {next.includes("returned") && (
                  <label className="flex items-center gap-2 text-[13px]">
                    <input type="checkbox" name="restock" className="accent-brown-700" /> Put returned items back in stock (after inspection)
                  </label>
                )}
                <input name="note" placeholder="Note (optional)" className={inputCls} />
                <SubmitButton>Update status</SubmitButton>
              </ActionForm>
            </Card>
          )}

          <Card title="Customer">
            <p className="font-medium text-ink">{o.name}</p>
            <p className="text-[14px] text-ink-soft">{o.phone}</p>
            {o.email && <p className="text-[14px] text-ink-soft">{o.email}</p>}
            <p className="mt-2 text-[14px] text-ink">{o.address}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`tel:${o.phone}`} className={btn.outline}>
                <Phone /> Call
              </a>
              <a href={wa} target="_blank" rel="noreferrer" className={btn.outline}>
                <MessageCircle /> WhatsApp
              </a>
              {o.customerId && (
                <Link href={`/admin/customers/${o.customerId}`} className={btn.ghost}>
                  Profile →
                </Link>
              )}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[12px]">
              <div className="rounded-sm bg-cream-50 p-2">
                <b className="block text-[16px] text-ink">{sr.orders}</b> orders
              </div>
              <div className="rounded-sm bg-cream-50 p-2">
                <b className="block text-[16px] text-ink">{sr.delivered}</b> delivered
              </div>
              <div className="rounded-sm bg-cream-50 p-2">
                <b className={`block text-[16px] ${sr.ratio != null && sr.ratio < 60 ? "text-sale" : "text-green-600"}`}>{sr.ratio == null ? "—" : `${sr.ratio}%`}</b> success
              </div>
            </div>
          </Card>

          <Card title="Fraud check" actions={<RiskBadge level={o.riskLevel} />}>
            <p className="text-[13px] text-ink-muted">
              Score {o.riskScore}/100 · decision: <b className="text-ink">{o.fraudDecision}</b>
              {o.ip && <span className="block">IP {o.ip}</span>}
            </p>
            {o.riskReasons.length > 0 ? (
              <ul className="mt-2 list-disc pl-5 text-[13px] text-ink">
                {o.riskReasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[13px] text-green-600">No warning signs.</p>
            )}
            {can(admin.permissions, "fraud.decide") && !["cancelled", "delivered", "refunded"].includes(o.status) && (
              <ActionForm action={fraudDecisionAction} className="mt-3 flex flex-col gap-2">
                <input type="hidden" name="id" value={o.id} />
                <input name="reason" placeholder="Reason / call notes" className={inputCls} />
                <label className="flex items-center gap-2 text-[13px]">
                  <input type="checkbox" name="blockCustomer" className="accent-brown-700" /> Also block this customer
                </label>
                <div className="flex flex-wrap gap-2">
                  <SubmitButton name="decision" value="accepted" className="bg-green-600 hover:bg-green-500">
                    Accept
                  </SubmitButton>
                  <SubmitButton name="decision" value="hold" className="bg-orange-500 text-brown-900 hover:bg-orange-600">
                    Hold for call
                  </SubmitButton>
                  <SubmitButton name="decision" value="rejected" className="bg-sale hover:bg-sale/90">
                    Reject
                  </SubmitButton>
                </div>
              </ActionForm>
            )}
          </Card>

          {edit && (
            <Card title="Assigned to">
              <ActionForm action={assignAction} className="flex gap-2">
                <input type="hidden" name="id" value={o.id} />
                <Select name="adminId" defaultValue={String(o.assignedAdminId ?? "")} className="flex-1" options={[{ value: "", label: "Unassigned" }, ...admins.map((a) => ({ value: String(a.id), label: a.name }))]} />
                <SubmitButton>Save</SubmitButton>
              </ActionForm>
            </Card>
          )}
          {o.cancelReason && (
            <Card title="Cancellation">
              <Field label="Reason">
                <p className={textareaCls + " bg-cream-50"}>{o.cancelReason}</p>
              </Field>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
