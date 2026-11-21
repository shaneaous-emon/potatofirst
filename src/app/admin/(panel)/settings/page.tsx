import { Settings, Phone, Store, CreditCard } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Forbidden, PageHeader, Card } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { getSettings } from "@/lib/settings";
import { saveStoreSettingsAction } from "@/app/admin/_actions/settings";

export const metadata = { title: "Store Settings" };

export default async function SettingsPage() {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "settings.view")) return <Forbidden perm="settings.view" />;

  const { store, checkout } = await getSettings("store", "checkout");
  const editable = can(admin.permissions, "settings.edit");

  return (
    <>
      <PageHeader
        title="Store Settings"
        description="Manage store contact information, business hours, and checkout payment rules."
      />

      <ActionForm action={saveStoreSettingsAction}>
        <div className="flex max-w-4xl flex-col gap-6">
          {/* General Store Details */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <Store className="size-5 text-brown-700" />
                <span>Store Information</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[13px] font-medium text-ink-soft">Store Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={store.name}
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft">Tagline</label>
                <input
                  type="text"
                  name="tagline"
                  defaultValue={store.tagline}
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft">Hotline Phone</label>
                <input
                  type="text"
                  name="hotline"
                  defaultValue={store.hotline}
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 font-mono text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft">WhatsApp Number</label>
                <input
                  type="text"
                  name="whatsapp"
                  defaultValue={store.whatsapp}
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 font-mono text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft">Support Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={store.email}
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft">Business Hours</label>
                <input
                  type="text"
                  name="hours"
                  defaultValue={store.hours}
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[13px] font-medium text-ink-soft">Address / Office</label>
                <input
                  type="text"
                  name="address"
                  defaultValue={store.address}
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft">Facebook Page URL</label>
                <input
                  type="url"
                  name="facebook"
                  defaultValue={store.facebook}
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft">Instagram URL</label>
                <input
                  type="url"
                  name="instagram"
                  defaultValue={store.instagram}
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                />
              </div>
            </div>
          </Card>

          {/* Checkout & Payment Rules */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <CreditCard className="size-5 text-brown-700" />
                <span>Checkout & Payments</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 sm:col-span-2">
                <input
                  type="checkbox"
                  id="codEnabled"
                  name="codEnabled"
                  defaultChecked={checkout.codEnabled}
                  className="size-4 cursor-pointer accent-brown-700"
                />
                <label htmlFor="codEnabled" className="text-[14px] font-medium text-ink">
                  Enable Cash on Delivery (COD)
                </label>
              </div>

              <div className="flex items-center gap-3 sm:col-span-2">
                <input
                  type="checkbox"
                  id="bkashEnabled"
                  name="bkashEnabled"
                  defaultChecked={checkout.bkashEnabled}
                  className="size-4 cursor-pointer accent-brown-700"
                />
                <label htmlFor="bkashEnabled" className="text-[14px] font-medium text-ink">
                  Enable bKash Manual Payment
                </label>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft">bKash Number</label>
                <input
                  type="text"
                  name="bkashNumber"
                  defaultValue={checkout.bkashNumber}
                  placeholder="01XXXXXXXXX"
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 font-mono text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft">bKash Account Type</label>
                <select
                  name="bkashType"
                  defaultValue={checkout.bkashType}
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                >
                  <option value="Personal">Personal (Send Money)</option>
                  <option value="Merchant">Merchant (Payment)</option>
                  <option value="Agent">Agent (Cash Out)</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft">Order Prefix</label>
                <input
                  type="text"
                  name="orderPrefix"
                  defaultValue={checkout.orderPrefix}
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 font-mono text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft">Minimum Order Value (৳)</label>
                <input
                  type="number"
                  name="minOrder"
                  defaultValue={checkout.minOrder}
                  min={0}
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                />
              </div>
            </div>
          </Card>

          {editable && (
            <div className="flex justify-end">
              <SubmitButton className="h-11 px-8">
                Save All Settings
              </SubmitButton>
            </div>
          )}
        </div>
      </ActionForm>
    </>
  );
}
