import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, t } from "@/db";
import { can, type Permission } from "./permissions";
import { clientIp, readSession } from "./session";

export type AdminContext = { id: number; name: string; email: string; role: string; roleSlug: string; permissions: string[] };

/** Current admin (memoised per request). */
export const getAdmin = cache(async (): Promise<AdminContext | null> => {
  const id = await readSession();
  if (!id) return null;
  const rows = await db()
    .select({ id: t.adminUsers.id, name: t.adminUsers.name, email: t.adminUsers.email, active: t.adminUsers.active, role: t.roles.name, roleSlug: t.roles.slug, permissions: t.roles.permissions })
    .from(t.adminUsers)
    .innerJoin(t.roles, eq(t.roles.id, t.adminUsers.roleId))
    .where(eq(t.adminUsers.id, id))
    .limit(1);
  const a = rows[0];
  if (!a || !a.active) return null;
  return { id: a.id, name: a.name, email: a.email, role: a.role, roleSlug: a.roleSlug, permissions: a.permissions };
});

export async function requireAdmin(): Promise<AdminContext> {
  const a = await getAdmin();
  if (!a) redirect("/admin/login");
  return a;
}

/** Page/action guard: redirects to login, or throws 403-style error if the role lacks the permission. */
export async function requirePermission(p: Permission): Promise<AdminContext> {
  const a = await requireAdmin();
  if (!can(a.permissions, p)) throw new Error(`Forbidden: your role does not have "${p}"`);
  return a;
}

export async function logActivity(admin: AdminContext | null, action: string, entity: string, entityId: string | number | null, summary: string) {
  await db()
    .insert(t.activityLogs)
    .values({ adminId: admin?.id ?? null, action, entity, entityId: entityId == null ? null : String(entityId), summary: summary.slice(0, 500), ip: await clientIp() });
}
