import { count, desc, eq, like } from "drizzle-orm";
import { Card, Forbidden, PageHeader, Pagination, SearchFilter, Table, Td, fmtDate } from "@/components/admin/ui";
import { db, t } from "@/db";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";

export const metadata = { title: "Activity Log" };
const PER = 50;

export default async function LogsPage({ searchParams }: PageProps<"/admin/logs">) {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "logs.view")) return <Forbidden perm="logs.view" />;
  const sp = (await searchParams) as Record<string, string>;
  const page = Math.max(1, Number(sp.page) || 1);
  const where = sp.q ? like(t.activityLogs.summary, `%${sp.q}%`) : undefined;
  const d = db();
  const [rows, [{ n }]] = await Promise.all([
    d.select({ l: t.activityLogs, by: t.adminUsers.name }).from(t.activityLogs).leftJoin(t.adminUsers, eq(t.adminUsers.id, t.activityLogs.adminId)).where(where).orderBy(desc(t.activityLogs.id)).limit(PER).offset((page - 1) * PER),
    d.select({ n: count() }).from(t.activityLogs).where(where),
  ]);
  return (
    <>
      <PageHeader title="Activity Log" description="Every change made in the admin panel — including changes made by the AI assistant." />
      <SearchFilter placeholder="Search activity" defaultValue={sp.q} />
      <Card bodyClassName="p-0 sm:p-0">
        <Table head={["When", "Who", "Action", "Details"]} empty="No activity yet.">
          {rows.map(({ l, by }) => (
            <tr key={l.id}>
              <Td className="whitespace-nowrap text-[13px] text-ink-muted">{fmtDate(l.createdAt)}</Td>
              <Td className="whitespace-nowrap text-[13px]">{by ?? "System"}</Td>
              <Td className="whitespace-nowrap font-mono text-[12px]">{l.action}</Td>
              <Td className="text-[13px]">{l.summary}</Td>
            </tr>
          ))}
        </Table>
      </Card>
      <Pagination page={page} pages={Math.ceil(n / PER)} total={n} makeHref={(p) => `/admin/logs?${new URLSearchParams({ ...(sp.q ? { q: sp.q } : {}), page: String(p) })}`} />
    </>
  );
}
