import { count, desc } from "drizzle-orm";
import { Users, UserCheck, ShieldAlert, Ban } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import {
  Forbidden,
  PageHeader,
  Table,
  Td,
  fmtDate,
  Card,
  StatCard,
  SearchFilter,
  Badge,
} from "@/components/admin/ui";
import { db, t } from "@/db";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { toggleCustomerBlockAction } from "@/app/admin/_actions/settings";

import { eq } from "drizzle-orm";

export const metadata = { title: "Customers" };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "customers.view")) return <Forbidden perm="customers.view" />;

  const sp = (await searchParams) as Record<string, string>;
  const d = db();

  const [customerRows, [{ totalCustomers }], [{ blockedCount }]] = await Promise.all([
    d.select().from(t.customers).orderBy(desc(t.customers.createdAt)).limit(50),
    d.select({ totalCustomers: count() }).from(t.customers),
    d.select({ blockedCount: count() }).from(t.customers).where(eq(t.customers.blocked, true)),
  ]);

  const editable = can(admin.permissions, "customers.edit");

  return (
    <>
      <PageHeader
        title="Customers"
        description="View customer profiles, registration details, and security status."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Registered"
          value={totalCustomers}
          hint="Customers on Potato First"
          icon={<Users />}
        />
        <StatCard
          label="Active Accounts"
          value={totalCustomers - blockedCount}
          hint="In good standing"
          tone="good"
          icon={<UserCheck />}
        />
        <StatCard
          label="Blocked / Suspended"
          value={blockedCount}
          hint="Suspended due to fraud or returns"
          tone={blockedCount > 0 ? "danger" : "default"}
          icon={<Ban />}
        />
      </div>

      <SearchFilter placeholder="Search customer by name, phone or email..." defaultValue={sp.q} />

      <Card title="Customer Directory">
        <Table
          head={[
            "Customer",
            "Phone",
            "Email",
            "Group",
            "Provider",
            "Status",
            "Registered",
            editable ? "Action" : null,
          ].filter(Boolean)}
          empty="No customers found in database."
        >
          {customerRows.map((c) => (
            <tr key={c.id} className="hover:bg-cream-50">
              <Td>
                <div className="font-semibold text-ink">{c.name}</div>
                {c.address && (
                  <div className="max-w-[200px] truncate text-[11px] text-ink-muted">{c.address}</div>
                )}
              </Td>
              <Td className="whitespace-nowrap font-mono text-[13px] text-ink">
                {c.phone || "—"}
              </Td>
              <Td className="text-[13px] text-ink-soft">{c.email || "—"}</Td>
              <Td>
                <Badge
                  tone={
                    c.group === "vip"
                      ? "orange"
                      : c.group === "risk"
                        ? "red"
                        : c.group === "returning"
                          ? "blue"
                          : "gray"
                  }
                >
                  {c.group.toUpperCase()}
                </Badge>
              </Td>
              <Td className="text-[13px] capitalize text-ink-muted">{c.provider}</Td>
              <Td>
                {c.blocked ? (
                  <Badge tone="red">Blocked</Badge>
                ) : (
                  <Badge tone="green">Active</Badge>
                )}
              </Td>
              <Td className="whitespace-nowrap text-[13px] text-ink-muted">
                {fmtDate(c.createdAt)}
              </Td>
              {editable && (
                <Td className="whitespace-nowrap">
                  <ActionForm action={toggleCustomerBlockAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="block" value={c.blocked ? "false" : "true"} />
                    <SubmitButton
                      className={`h-8 px-3 text-[13px] ${
                        c.blocked
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-sale hover:bg-sale/90 text-white"
                      }`}
                    >
                      {c.blocked ? "Unblock" : "Block"}
                    </SubmitButton>
                  </ActionForm>
                </Td>
              )}
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
