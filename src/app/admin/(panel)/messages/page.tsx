import { desc, eq } from "drizzle-orm";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Badge, Card, Forbidden, PageHeader, Select, fmtDate } from "@/components/admin/ui";
import { db, t } from "@/db";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { messageStatusAction } from "../../_actions/manage";

export const metadata = { title: "Messages" };

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "closed", label: "Closed" },
];

export default async function MessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "content.view")) return <Forbidden perm="content.view" />;
  const sp = (await searchParams) as Record<string, string>;
  const status = ["new", "in_progress", "closed"].includes(sp.status) ? (sp.status as "new") : undefined;
  const rows = await db().select().from(t.contactMessages).where(status ? eq(t.contactMessages.status, status) : undefined).orderBy(desc(t.contactMessages.createdAt)).limit(100);
  const edit = can(admin.permissions, "content.edit");
  return (
    <>
      <PageHeader title="Messages" description="Messages sent from the Contact form on your website." />
      <form className="mb-4 flex gap-2">
        <Select name="status" defaultValue={sp.status ?? ""} options={[{ value: "", label: "All" }, ...STATUS_OPTIONS]} />
        <button className="h-10 cursor-pointer rounded-sm bg-brown-700 px-4 text-[14px] font-medium text-cream-100">Filter</button>
      </form>
      <div className="flex flex-col gap-3">
        {rows.map((m) => (
          <Card key={m.id}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-ink">
                  {m.name} <span className="font-normal text-ink-muted">· {[m.phone, m.email].filter(Boolean).join(" · ")}</span>
                </p>
                {m.subject && <p className="text-[13px] font-medium text-ink-soft">{m.subject}</p>}
              </div>
              <Badge tone={m.status === "new" ? "orange" : m.status === "closed" ? "green" : "blue"}>{m.status.replace("_", " ")}</Badge>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-[14px] text-ink">{m.message}</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[12px] text-ink-muted">
              <span>{fmtDate(m.createdAt)}</span>
              {edit && (
                <ActionForm action={messageStatusAction} className="flex gap-2">
                  <input type="hidden" name="id" value={m.id} />
                  <Select name="status" defaultValue={m.status} className="h-9" options={STATUS_OPTIONS} />
                  <SubmitButton className="h-9 px-3">Update</SubmitButton>
                </ActionForm>
              )}
            </div>
          </Card>
        ))}
        {!rows.length && <p className="rounded-md border border-line bg-white px-4 py-12 text-center text-[14px] text-ink-muted">No messages.</p>}
      </div>
    </>
  );
}
