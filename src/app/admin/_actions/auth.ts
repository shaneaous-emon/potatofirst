"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, hasDatabase, t } from "@/db";
import { MissingSecretError } from "@/lib/secrets";
import { getAdmin, logActivity } from "@/lib/admin/auth";
import { clientIp, createSession, destroySession } from "@/lib/admin/session";
import type { ActionResult } from "@/components/admin/action-form";

const LOCK_AFTER = 5;
const LOCK_MINUTES = 15;

export async function loginAction(_: ActionResult, form: FormData): Promise<ActionResult> {
  try {
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    if (!email || !password) return { ok: false, message: "Enter your email and password" };
    if (!hasDatabase) {
      console.error("Admin login: DATABASE_URL is not set on the server");
      return { ok: false, message: "Server is not connected to the database (DATABASE_URL missing). Contact the site developer." };
    }

    const generic = { ok: false, message: "Email or password is incorrect" };

    let u;
    try {
      const rows = await db().select().from(t.adminUsers).where(eq(t.adminUsers.email, email)).limit(1);
      u = rows[0];
    } catch (dbErr) {
      console.error("Admin login db error:", dbErr);
      return { ok: false, message: "Database connection failed. Please verify server settings." };
    }

    if (!u || !u.active) {
      await bcrypt.compare(password, "$2a$10$abcdefghijklmnopqrstuuS0ZT7bJt5W1yZpXQ3c9j8pV6QHq7dS"); // equalise timing
      return generic;
    }
    if (u.lockedUntil && u.lockedUntil > new Date()) return { ok: false, message: `Too many attempts. Try again after ${LOCK_MINUTES} minutes.` };

    if (!(await bcrypt.compare(password, u.passwordHash))) {
      const failed = u.failedLogins + 1;
      try {
        await db()
          .update(t.adminUsers)
          .set({ failedLogins: failed >= LOCK_AFTER ? 0 : failed, lockedUntil: failed >= LOCK_AFTER ? new Date(Date.now() + LOCK_MINUTES * 60000) : null })
          .where(eq(t.adminUsers.id, u.id));
        await db().insert(t.activityLogs).values({ adminId: u.id, action: "login_failed", entity: "auth", summary: `Failed login for ${email}`, ip: await clientIp() });
      } catch (logErr) {
        console.error("Failed to log activity:", logErr);
      }
      return generic;
    }

    try {
      await db().update(t.adminUsers).set({ failedLogins: 0, lockedUntil: null, lastLoginAt: new Date(), lastLoginIp: await clientIp() }).where(eq(t.adminUsers.id, u.id));
      await createSession(u.id);
      await db().insert(t.activityLogs).values({ adminId: u.id, action: "login", entity: "auth", summary: `${u.name} logged in`, ip: await clientIp() });
    } catch (sessionErr) {
      console.error("Failed to create session / update login:", sessionErr);
      if (sessionErr instanceof MissingSecretError) {
        return { ok: false, message: "Server setup incomplete: ADMIN_SESSION_SECRET is missing. Contact the site developer." };
      }
      return { ok: false, message: "Failed to establish login session. Please try again." };
    }

    redirect(String(form.get("next") || "/admin"));
  } catch (err: unknown) {
    if (err && typeof err === "object" && "digest" in err && String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("Unexpected login error:", err);
    return { ok: false, message: err instanceof Error ? err.message : "An unexpected error occurred during login." };
  }
}

export async function logoutAction() {
  const a = await getAdmin();
  if (a) await logActivity(a, "logout", "auth", a.id, `${a.name} logged out`);
  await destroySession();
  redirect("/admin/login");
}
