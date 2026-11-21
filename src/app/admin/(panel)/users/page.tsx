import { asc, eq } from "drizzle-orm";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Badge, Card, Forbidden, PageHeader, Select, Table, Td, fmtDate, inputCls } from "@/components/admin/ui";
import { db, t } from "@/db";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { createAdminUserAction, updateAdminUserAction } from "../../_actions/manage";

export const metadata = { title: "Admin Users" };

export default async function UsersPage() {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "users.view")) return <Forbidden perm="users.view" />;
  const d = db();
  const [users, roles] = await Promise.all([
    d
      .select({ id: t.adminUsers.id, name: t.adminUsers.name, email: t.adminUsers.email, active: t.adminUsers.active, lastLoginAt: t.adminUsers.lastLoginAt, roleId: t.adminUsers.roleId, role: t.roles.name, perms: t.roles.permissions })
      .from(t.adminUsers)
      .innerJoin(t.roles, eq(t.roles.id, t.adminUsers.roleId))
      .orderBy(asc(t.adminUsers.id)),
    d.select().from(t.roles).orderBy(asc(t.roles.id)),
  ]);
  const edit = can(admin.permissions, "users.edit");
  const isSuper = admin.permissions.includes("*");
  const assignable = roles.filter((r) => isSuper || !r.permissions.includes("*")).map((r) => ({ value: String(r.id), label: r.name }));

  return (
    <>
      <PageHeader title="Admin Users" description="Who can log in to this panel, and what they can do." />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">
        <Card bodyClassName="p-0 sm:p-0">
          <Table head={["User", "Role", "Last login", "Status", edit ? "Actions" : null].filter(Boolean)}>
            {users.map((u) => {
              const locked = u.perms.includes("*") && !isSuper;
              return (
                <tr key={u.id} className="align-top">
                  <Td>
                    <b>{u.name}</b>
                    {u.id === admin.id && <span className="ml-1 text-[12px] text-ink-muted">(you)</span>}
                    <span className="block text-[12px] text-ink-muted">{u.email}</span>
                  </Td>
                  <Td>
                    {edit && !locked && u.id !== admin.id ? (
                      <ActionForm action={updateAdminUserAction} className="flex gap-1.5">
                        <input type="hidden" name="id" value={u.id} />
                        <Select name="roleId" defaultValue={String(u.roleId)} className="h-9" options={assignable.some((o) => o.value === String(u.roleId)) ? assignable : [{ value: String(u.roleId), label: u.role }, ...assignable]} />
                        <SubmitButton className="h-9 px-3">Set</SubmitButton>
                      </ActionForm>
                    ) : (
                      <Badge tone="brown">{u.role}</Badge>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap text-[13px] text-ink-muted">{fmtDate(u.lastLoginAt)}</Td>
                  <Td>
                    <Badge tone={u.active ? "green" : "gray"}>{u.active ? "Active" : "Disabled"}</Badge>
                  </Td>
                  {edit && (
                    <Td>
                      {!locked && (
                        <div className="flex flex-col gap-2">
                          {u.id !== admin.id && (
                            <ActionForm action={updateAdminUserAction} confirm={u.active ? `Disable ${u.name}?` : undefined}>
                              <input type="hidden" name="id" value={u.id} />
                              <input type="hidden" name="active" value={String(!u.active)} />
                              <SubmitButton className="h-8 border border-line bg-white px-3 text-[13px] text-ink hover:bg-cream-100">{u.active ? "Disable" : "Enable"}</SubmitButton>
                            </ActionForm>
                          )}
                          <ActionForm action={updateAdminUserAction} resetOnSuccess className="flex gap-1.5">
                            <input type="hidden" name="id" value={u.id} />
                            <input name="password" type="password" minLength={8} placeholder="New password" autoComplete="new-password" className={`${inputCls} h-8 w-36 text-[13px]`} />
                            <SubmitButton className="h-8 px-3 text-[13px]">Reset</SubmitButton>
                          </ActionForm>
                        </div>
                      )}
                    </Td>
                  )}
                </tr>
              );
            })}
          </Table>
        </Card>

        {edit && (
          <Card title="Add admin user">
            <ActionForm action={createAdminUserAction} resetOnSuccess className="flex flex-col gap-3 text-[13px]">
              <input name="name" required placeholder="Full name" className={inputCls} />
              <input name="email" type="email" required placeholder="Email" className={inputCls} />
              <input name="password" type="password" required minLength={8} placeholder="Password (min 8 characters)" autoComplete="new-password" className={inputCls} />
              <Select name="roleId" defaultValue="" options={[{ value: "", label: "Choose role…" }, ...assignable]} />
              <SubmitButton>Add user</SubmitButton>
            </ActionForm>
          </Card>
        )}
      </div>
    </>
  );
}
