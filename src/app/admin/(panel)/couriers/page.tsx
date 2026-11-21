import { Send, Truck, ExternalLink, ShieldCheck } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Forbidden, PageHeader, Card, btn } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { getSettings } from "@/lib/settings";
import { COURIERS } from "@/lib/couriers";
import { saveCourierSettingsAction } from "@/app/admin/_actions/settings";

export const metadata = { title: "Couriers Integration" };

export default async function CouriersPage() {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "shipping.view")) return <Forbidden perm="shipping.view" />;

  const { couriers } = await getSettings("couriers");
  const editable = can(admin.permissions, "shipping.edit");

  return (
    <>
      <PageHeader
        title="Couriers Integration"
        description="Connect Steadfast, Pathao, and RedX for automated parcel booking and live tracking."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {COURIERS.map((c) => {
          const cfg = couriers[c.slug as keyof typeof couriers];
          const isEnabled = cfg?.enabled;
          return (
            <div
              key={c.slug}
              className="flex flex-col justify-between rounded-md border border-line bg-white p-5 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-[17px] font-semibold text-ink">{c.name}</h3>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      isEnabled ? "bg-green-100 text-green-700" : "bg-cream-200 text-ink-muted"
                    }`}
                  >
                    {isEnabled ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-ink-soft">
                  Mode: <span className="font-semibold capitalize">{cfg?.mode || "manual"}</span>
                </p>
              </div>
              <a
                href={c.panel}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-brown-700 hover:text-orange-600 hover:underline"
              >
                Open Merchant Portal <ExternalLink className="size-3.5" />
              </a>
            </div>
          );
        })}
      </div>

      <ActionForm action={saveCourierSettingsAction}>
        <div className="flex flex-col gap-6">
          {/* Steadfast Courier */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <Truck className="size-5 text-brown-700" />
                <span>Steadfast Courier API</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 sm:col-span-2">
                <input
                  type="checkbox"
                  id="steadfast_enabled"
                  name="steadfast_enabled"
                  defaultChecked={couriers.steadfast.enabled}
                  className="size-4 cursor-pointer accent-brown-700"
                />
                <label htmlFor="steadfast_enabled" className="text-[14px] font-medium text-ink">
                  Enable Steadfast Courier Integration
                </label>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft">Booking Mode</label>
                <select
                  name="steadfast_mode"
                  defaultValue={couriers.steadfast.mode}
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                >
                  <option value="manual">Manual (Paste consignment ID)</option>
                  <option value="api">Automated API (Instant consignment creation)</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft">API Key</label>
                <input
                  type="text"
                  name="steadfast_apiKey"
                  defaultValue={couriers.steadfast.apiKey}
                  placeholder="Steadfast API Key"
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[13px] font-medium text-ink-soft">Secret Key</label>
                <input
                  type="password"
                  name="steadfast_secretKey"
                  defaultValue={couriers.steadfast.secretKey}
                  placeholder="Steadfast Secret Key"
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                />
              </div>
            </div>
          </Card>

          {/* Pathao Courier */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <Send className="size-5 text-brown-700" />
                <span>Pathao Courier API</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 sm:col-span-2">
                <input
                  type="checkbox"
                  id="pathao_enabled"
                  name="pathao_enabled"
                  defaultChecked={couriers.pathao.enabled}
                  className="size-4 cursor-pointer accent-brown-700"
                />
                <label htmlFor="pathao_enabled" className="text-[14px] font-medium text-ink">
                  Enable Pathao Courier Integration
                </label>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft">Booking Mode</label>
                <select
                  name="pathao_mode"
                  defaultValue={couriers.pathao.mode}
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                >
                  <option value="manual">Manual (Paste consignment ID)</option>
                  <option value="api">Automated API</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft">Store ID</label>
                <input
                  type="text"
                  name="pathao_storeId"
                  defaultValue={couriers.pathao.storeId}
                  placeholder="Pathao Store ID"
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft">Client ID</label>
                <input
                  type="text"
                  name="pathao_clientId"
                  defaultValue={couriers.pathao.clientId}
                  placeholder="Pathao Client ID"
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft">Client Secret</label>
                <input
                  type="password"
                  name="pathao_clientSecret"
                  defaultValue={couriers.pathao.clientSecret}
                  placeholder="Pathao Client Secret"
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft">Account Username (Email)</label>
                <input
                  type="text"
                  name="pathao_username"
                  defaultValue={couriers.pathao.username}
                  placeholder="merchant@email.com"
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft">Account Password</label>
                <input
                  type="password"
                  name="pathao_password"
                  defaultValue={couriers.pathao.password}
                  placeholder="••••••••"
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                />
              </div>
            </div>
          </Card>

          {/* RedX Courier */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <Truck className="size-5 text-brown-700" />
                <span>RedX Courier</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 sm:col-span-2">
                <input
                  type="checkbox"
                  id="redx_enabled"
                  name="redx_enabled"
                  defaultChecked={couriers.redx.enabled}
                  className="size-4 cursor-pointer accent-brown-700"
                />
                <label htmlFor="redx_enabled" className="text-[14px] font-medium text-ink">
                  Enable RedX Courier Integration
                </label>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft">Booking Mode</label>
                <select
                  name="redx_mode"
                  defaultValue={couriers.redx.mode}
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                >
                  <option value="manual">Manual (Paste consignment ID)</option>
                  <option value="api">Automated API</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft">Access Token</label>
                <input
                  type="password"
                  name="redx_token"
                  defaultValue={couriers.redx.token}
                  placeholder="RedX Bearer Token"
                  className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                />
              </div>
            </div>
          </Card>

          {editable && (
            <div className="flex justify-end">
              <SubmitButton className="h-11 px-8">
                Save Courier Configurations
              </SubmitButton>
            </div>
          )}
        </div>
      </ActionForm>
    </>
  );
}
