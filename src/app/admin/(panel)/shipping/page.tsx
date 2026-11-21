import { asc } from "drizzle-orm";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Card, Forbidden, PageHeader, inputCls } from "@/components/admin/ui";
import { db, t } from "@/db";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { createZoneAction, saveZoneAction } from "../../_actions/manage";

export const metadata = { title: "Delivery Charges" };

export default async function ShippingPage() {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "shipping.view")) return <Forbidden perm="shipping.view" />;
  const zones = await db().select().from(t.shippingZones).orderBy(asc(t.shippingZones.sort));
  const edit = can(admin.permissions, "shipping.edit");
  return (
    <>
      <PageHeader title="Delivery Charges" description="The charge customers pay at checkout for each delivery area." />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {zones.map((z) => (
          <Card key={z.id} title={z.name}>
            <ActionForm action={saveZoneAction} className="grid grid-cols-2 gap-3 text-[13px]">
              <input type="hidden" name="slug" value={z.slug} />
              <label className="flex flex-col gap-1">
                Charge (৳)
                <input name="charge" type="number" min={0} defaultValue={z.charge} disabled={!edit} className={inputCls} />
              </label>
              <label className="flex flex-col gap-1">
                Free delivery over (৳)
                <input name="freeOver" type="number" min={0} defaultValue={z.freeOver ?? ""} placeholder="never" disabled={!edit} className={inputCls} />
              </label>
              <label className="flex flex-col gap-1">
                Delivery time
                <input name="eta" defaultValue={z.eta} disabled={!edit} className={inputCls} />
              </label>
              <div className="flex flex-col justify-end gap-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="codAvailable" defaultChecked={z.codAvailable} disabled={!edit} className="accent-brown-700" /> Cash on Delivery
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="active" defaultChecked={z.active} disabled={!edit} className="accent-brown-700" /> Active
                </label>
              </div>
              {edit && <SubmitButton className="col-span-2">Save</SubmitButton>}
            </ActionForm>
          </Card>
        ))}
        {edit && (
          <Card title="Add a delivery area">
            <ActionForm action={createZoneAction} resetOnSuccess className="grid grid-cols-2 gap-3 text-[13px]">
              <label className="col-span-2 flex flex-col gap-1">
                Name
                <input name="name" required placeholder="e.g. Chattogram" className={inputCls} />
              </label>
              <label className="flex flex-col gap-1">
                Charge (৳)
                <input name="charge" type="number" min={0} required className={inputCls} />
              </label>
              <label className="flex flex-col gap-1">
                Free over (৳)
                <input name="freeOver" type="number" min={0} className={inputCls} />
              </label>
              <label className="col-span-2 flex flex-col gap-1">
                Delivery time
                <input name="eta" placeholder="2–4 days" className={inputCls} />
              </label>
              <SubmitButton className="col-span-2">Add area</SubmitButton>
            </ActionForm>
          </Card>
        )}
      </div>
    </>
  );
}
