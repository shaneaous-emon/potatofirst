import { asc, eq } from "drizzle-orm";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Card, Field, Forbidden, PageHeader, Select, inputCls } from "@/components/admin/ui";
import { db, t } from "@/db";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { createManualOrderAction } from "../../../_actions/orders";
import { ItemRows } from "./item-rows";

export const metadata = { title: "New order" };

/** Manual order (phone / WhatsApp / Facebook). Uses the same pricing, stock and fraud logic as checkout. */
export default async function NewOrder() {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "orders.edit")) return <Forbidden perm="orders.edit" />;
  const [variants, zones] = await Promise.all([
    db()
      .select({ sku: t.productVariants.sku, label: t.productVariants.label, price: t.productVariants.price, stock: t.productVariants.stockOnHand, name: t.products.name })
      .from(t.productVariants)
      .innerJoin(t.products, eq(t.products.id, t.productVariants.productId))
      .where(eq(t.products.status, "published"))
      .orderBy(asc(t.products.name), asc(t.productVariants.sort)),
    db().select().from(t.shippingZones).where(eq(t.shippingZones.active, true)).orderBy(asc(t.shippingZones.sort)),
  ]);
  return (
    <>
      <PageHeader back={{ href: "/admin/orders", label: "Orders" }} title="New order" description="For orders taken by phone, WhatsApp or Facebook." />
      <ActionForm action={createManualOrderAction} className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_380px]">
        <Card title="Products">
          <ItemRows variants={variants.map((v) => ({ sku: v.sku, label: `${v.name} · ${v.label} · ৳${v.price} (${v.stock} in stock)` }))} />
        </Card>
        <div className="flex flex-col gap-5">
          <Card title="Customer">
            <div className="flex flex-col gap-3">
              <Field label="Name">
                <input name="name" required className={inputCls} />
              </Field>
              <Field label="Phone">
                <input name="phone" required inputMode="tel" placeholder="01XXXXXXXXX" className={inputCls} />
              </Field>
              <Field label="Address">
                <textarea name="address" required rows={2} className={inputCls + " h-auto py-2"} />
              </Field>
              <Field label="Delivery area">
                <Select name="zone" options={zones.map((z) => ({ value: z.slug, label: `${z.name} · ৳${z.charge}` }))} />
              </Field>
            </div>
          </Card>
          <Card title="Order">
            <div className="flex flex-col gap-3">
              <Field label="Source">
                <Select name="source" options={[{ value: "phone", label: "Phone call" }, { value: "whatsapp", label: "WhatsApp" }, { value: "facebook", label: "Facebook / Messenger" }, { value: "instagram", label: "Instagram" }, { value: "walk-in", label: "Walk-in" }]} />
              </Field>
              <Field label="Payment">
                <Select name="paymentMethod" options={[{ value: "cod", label: "Cash on Delivery" }, { value: "bkash", label: "bKash" }]} />
              </Field>
              <Field label="Coupon (optional)">
                <input name="coupon" className={inputCls} />
              </Field>
              <Field label="Note (optional)">
                <input name="note" className={inputCls} />
              </Field>
              <SubmitButton className="h-11">Create order</SubmitButton>
            </div>
          </Card>
        </div>
      </ActionForm>
    </>
  );
}
