import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Card, Forbidden, PageHeader, inputCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { getSetting } from "@/lib/settings";
import { blockListAction } from "../../_actions/manage";

export const metadata = { title: "Block List" };

function List({ kind, items, edit }: { kind: "phone" | "ip"; items: string[]; edit: boolean }) {
  return (
    <Card title={kind === "phone" ? "Blocked phone numbers" : "Blocked IP addresses"}>
      {edit && (
        <ActionForm action={blockListAction} resetOnSuccess className="mb-4 flex gap-2">
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="action" value="add" />
          <input name="value" required placeholder={kind === "phone" ? "01XXXXXXXXX" : "123.45.67.89"} className={inputCls} />
          <SubmitButton>Block</SubmitButton>
        </ActionForm>
      )}
      <ul className="flex flex-col gap-1.5 text-[14px]">
        {items.map((v) => (
          <li key={v} className="flex items-center justify-between rounded-sm bg-cream-50 px-3 py-2">
            <span className="font-mono">{v}</span>
            {edit && (
              <ActionForm action={blockListAction}>
                <input type="hidden" name="kind" value={kind} />
                <input type="hidden" name="action" value="remove" />
                <input type="hidden" name="value" value={v} />
                <SubmitButton className="h-8 bg-white px-3 text-[13px] text-sale ring-1 ring-sale/40 hover:bg-sale hover:text-white">Unblock</SubmitButton>
              </ActionForm>
            )}
          </li>
        ))}
        {!items.length && <li className="text-ink-muted">Nobody is blocked.</li>}
      </ul>
    </Card>
  );
}

export default async function BlockListPage() {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "customers.view")) return <Forbidden perm="customers.view" />;
  const fraud = await getSetting("fraud");
  const edit = can(admin.permissions, "customers.edit");
  return (
    <>
      <PageHeader title="Block List" description="Orders from these phone numbers or IPs are flagged as high-risk. Seeing fake-order spam? Add the number here." />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <List kind="phone" items={fraud.blockedPhones} edit={edit} />
        <List kind="ip" items={fraud.blockedIps} edit={edit} />
      </div>
    </>
  );
}
