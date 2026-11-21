import { Activity, BarChart, Tag, CheckCircle } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Forbidden, PageHeader, Card } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { getSettings } from "@/lib/settings";
import { saveMarketingSettingsAction } from "@/app/admin/_actions/settings";

export const metadata = { title: "Marketing & Pixels" };

export default async function MarketingPage() {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "marketing.view")) return <Forbidden perm="marketing.view" />;

  const { tracking } = await getSettings("tracking");
  const editable = can(admin.permissions, "marketing.edit");

  return (
    <>
      <PageHeader
        title="Marketing & Pixels"
        description="Configure Facebook Pixel, Google Tag Manager, and GA4 for conversion tracking and ad attribution."
      />

      <ActionForm action={saveMarketingSettingsAction}>
        <div className="flex max-w-4xl flex-col gap-6">
          {/* Meta Pixel */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <Activity className="size-5 text-[#1877F2]" />
                <span>Meta (Facebook) Pixel</span>
              </div>
            }
          >
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[13px] font-medium text-ink-soft">
                  Meta Pixel ID / Dataset ID
                </label>
                <input
                  type="text"
                  name="metaPixelId"
                  defaultValue={tracking.metaPixelId}
                  placeholder="e.g. 123456789012345"
                  className="mt-1 h-10 w-full max-w-md rounded-md border border-line bg-white px-3 font-mono text-[14px]"
                />
                <p className="mt-1 text-[12px] text-ink-muted">
                  Events automatically tracked: PageView, ViewContent, AddToCart, InitiateCheckout, and Purchase.
                </p>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft">
                  Purchase Event Trigger
                </label>
                <select
                  name="purchaseOn"
                  defaultValue={tracking.purchaseOn}
                  className="mt-1 h-10 w-full max-w-md rounded-md border border-line bg-white px-3 text-[14px]"
                >
                  <option value="placed">When order is placed (Immediate on thank-you page)</option>
                  <option value="confirmed">Only after order is confirmed by phone call (Prevents fake COD data)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Google Tag Manager */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <Tag className="size-5 text-[#4285F4]" />
                <span>Google Tag Manager (GTM)</span>
              </div>
            }
          >
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[13px] font-medium text-ink-soft">
                  GTM Container ID
                </label>
                <input
                  type="text"
                  name="gtmId"
                  defaultValue={tracking.gtmId}
                  placeholder="e.g. GTM-XXXXXXX"
                  className="mt-1 h-10 w-full max-w-md rounded-md border border-line bg-white px-3 font-mono text-[14px]"
                />
                <p className="mt-1 text-[12px] text-ink-muted">
                  Injects Google Tag Manager scripts into both head and body across all pages.
                </p>
              </div>
            </div>
          </Card>

          {/* Google Analytics 4 */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <BarChart className="size-5 text-[#F57C00]" />
                <span>Google Analytics 4 (GA4)</span>
              </div>
            }
          >
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[13px] font-medium text-ink-soft">
                  GA4 Measurement ID
                </label>
                <input
                  type="text"
                  name="ga4Id"
                  defaultValue={tracking.ga4Id}
                  placeholder="e.g. G-XXXXXXXXXX"
                  className="mt-1 h-10 w-full max-w-md rounded-md border border-line bg-white px-3 font-mono text-[14px]"
                />
                <p className="mt-1 text-[12px] text-ink-muted">
                  Use this if you are not using GTM for Google Analytics tracking.
                </p>
              </div>
            </div>
          </Card>

          {editable && (
            <div className="flex justify-end">
              <SubmitButton className="h-11 px-8">
                Save Tracking & Pixels
              </SubmitButton>
            </div>
          )}
        </div>
      </ActionForm>
    </>
  );
}
