import { count, desc } from "drizzle-orm";
import { TicketPercent, Plus, CheckCircle2 } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import {
  Forbidden,
  PageHeader,
  Table,
  Td,
  Badge,
  Card,
  StatCard,
  taka,
  fmtDate,
} from "@/components/admin/ui";
import { db, t } from "@/db";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { createCouponAction } from "@/app/admin/_actions/settings";

export const metadata = { title: "Coupons & Discounts" };

export default async function CouponsPage() {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "coupons.view")) return <Forbidden perm="coupons.view" />;

  const d = db();
  const couponsRows = await d
    .select()
    .from(t.coupons)
    .orderBy(desc(t.coupons.createdAt))
    .limit(50);

  const editable = can(admin.permissions, "coupons.edit");

  return (
    <>
      <PageHeader
        title="Coupons & Discounts"
        description="Create and manage promotional discount codes and free delivery vouchers."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Coupons"
          value={couponsRows.length}
          hint="Active campaigns"
          icon={<TicketPercent />}
        />
        <StatCard
          label="Total Redemptions"
          value={couponsRows.reduce((acc, c) => acc + c.usedCount, 0)}
          hint="Times applied by customers"
          tone="good"
          icon={<CheckCircle2 />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <Card title="Active Coupons">
          <Table
            head={["Code", "Type", "Discount", "Min Order", "Used", "Status"]}
            empty="No coupons found."
          >
            {couponsRows.map((c) => (
              <tr key={c.id} className="hover:bg-cream-50">
                <Td className="font-mono font-bold text-brown-700">{c.code}</Td>
                <Td className="capitalize text-ink-soft">
                  {c.type === "free_delivery" ? "Free Delivery" : c.type}
                </Td>
                <Td className="whitespace-nowrap font-medium text-ink">
                  {c.type === "percent"
                    ? `${c.value}%`
                    : c.type === "fixed"
                      ? taka(c.value)
                      : "Free Delivery"}
                </Td>
                <Td className="whitespace-nowrap text-[13px] text-ink-muted">
                  {c.minOrder > 0 ? taka(c.minOrder) : "No minimum"}
                </Td>
                <Td className="text-[13px] font-semibold text-ink">{c.usedCount} times</Td>
                <Td>
                  {c.active ? (
                    <Badge tone="green">Active</Badge>
                  ) : (
                    <Badge tone="gray">Disabled</Badge>
                  )}
                </Td>
              </tr>
            ))}
          </Table>
        </Card>

        {editable && (
          <Card title="Create New Coupon">
            <ActionForm action={createCouponAction}>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-ink-soft">Coupon Code</label>
                  <input
                    type="text"
                    name="code"
                    required
                    placeholder="e.g. POTATO20"
                    className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 font-mono font-bold uppercase text-[14px]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-ink-soft">Discount Type</label>
                  <select
                    name="type"
                    className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                    <option value="free_delivery">Free Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-ink-soft">Discount Value (% or ৳)</label>
                  <input
                    type="number"
                    name="value"
                    defaultValue={10}
                    min={0}
                    className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-ink-soft">Minimum Order (৳)</label>
                  <input
                    type="number"
                    name="minOrder"
                    defaultValue={300}
                    min={0}
                    className="mt-1 h-10 w-full rounded-md border border-line bg-white px-3 text-[14px]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="firstOrderOnly"
                    name="firstOrderOnly"
                    className="size-4 cursor-pointer accent-brown-700"
                  />
                  <label htmlFor="firstOrderOnly" className="cursor-pointer text-[13px] text-ink">
                    First order only
                  </label>
                </div>

                <SubmitButton className="mt-2 w-full">Create Coupon</SubmitButton>
              </div>
            </ActionForm>
          </Card>
        )}
      </div>
    </>
  );
}
