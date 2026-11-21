"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, t } from "@/db";
import { getAdmin, logActivity } from "@/lib/admin/auth";
import { clientIp, createSession, destroySession } from "@/lib/admin/session";
import type { ActionResult } from "@/components/admin/action-form";

const LOCK_AFTER = 5;
const LOCK_MINUTES = 15;

export async function loginAction(_: ActionResult, form: FormData): Promise<ActionResult> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { ok: false, message: "Enter your email and password" };

  const [u] = await db().select().from(t.adminUsers).where(eq(t.adminUsers.email, email)).limit(1);
  const generic = { ok: false, message: "Email or password is incorrect" };
  if (!u || !u.active) {
    await bcrypt.compare(password, "$2a$10$abcdefghijklmnopqrstuuS0ZT7bJt5W1yZpXQ3c9j8pV6QHq7dS"); // equalise timing
    return generic;
  }
  if (u.lockedUntil && u.lockedUntil > new Date()) return { ok: false, message: `Too many attempts. Try again after ${LOCK_MINUTES} minutes.` };

  if (!(await bcrypt.compare(password, u.passwordHash))) {
    const failed = u.failedLogins + 1;
    await db()
      .update(t.adminUsers)
      .set({ failedLogins: failed >= LOCK_AFTER ? 0 : failed, lockedUntil: failed >= LOCK_AFTER ? new Date(Date.now() + LOCK_MINUTES * 60000) : null })
      .where(eq(t.adminUsers.id, u.id));
    await db().insert(t.activityLogs).values({ adminId: u.id, action: "login_failed", entity: "auth", summary: `Failed login for ${email}`, ip: await clientIp() });
    return generic;
  }

  await db().update(t.adminUsers).set({ failedLogins: 0, lockedUntil: null, lastLoginAt: new Date(), lastLoginIp: await clientIp() }).where(eq(t.adminUsers.id, u.id));
  await createSession(u.id);
  await db().insert(t.activityLogs).values({ adminId: u.id, action: "login", entity: "auth", summary: `${u.name} logged in`, ip: await clientIp() });
  redirect(String(form.get("next") || "/admin"));
}

export async function logoutAction() {
  const a = await getAdmin();
  if (a) await logActivity(a, "logout", "auth", a.id, `${a.name} logged out`);
  await destroySession();
  redirect("/admin/login");
}
