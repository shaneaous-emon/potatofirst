import { Suspense } from "react";
import { connection } from "next/server";
import { count, eq, lte } from "drizzle-orm";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AiAssistant } from "@/components/admin/ai-assistant";
import { db, t } from "@/db";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { PROVIDERS } from "@/lib/ai/providers";
import { getSetting } from "@/lib/settings";
import { logoutAction } from "../_actions/auth";

async function Shell({ children }: { children: React.ReactNode }) {
  await connection();
  const admin = await requireAdmin();
  const ai = await getSetting("ai");
  const keyed = PROVIDERS.some((p) => !!(ai.keys[p.id] || process.env[p.env]));
  let badges = { pendingOrders: 0, stock: 0, messages: 0 };
  try {
    const d = db();
    const [[pending], [stock], [messages]] = await Promise.all([
      d.select({ n: count() }).from(t.orders).where(eq(t.orders.status, "pending")),
      d.select({ n: count() }).from(t.productVariants).where(lte(t.productVariants.stockOnHand, t.productVariants.lowStockThreshold)),
      d.select({ n: count() }).from(t.contactMessages).where(eq(t.contactMessages.status, "new")),
    ]);
    badges = { pendingOrders: pending?.n ?? 0, stock: stock?.n ?? 0, messages: messages?.n ?? 0 };
  } catch (err) {
    console.error("Failed to load admin badges:", err);
  }
  return (
    <div className="flex min-h-dvh">
      <AdminSidebar permissions={admin.permissions} name={admin.name} role={admin.role} badges={badges} logout={logoutAction} />
      <main className="min-w-0 flex-1 px-4 pb-24 pt-16 sm:px-6 xl:px-8 xl:pt-8">{children}</main>
      {ai.enabled && can(admin.permissions, "ai.use") && <AiAssistant model={ai.model} auto={ai.autoExecute} ready={keyed} canConfigure={can(admin.permissions, "ai.configure")} />}
    </div>
  );
}

function Loading() {
  return (
    <div className="flex min-h-dvh">
      <div className="hidden w-[248px] shrink-0 bg-brown-900 xl:block" />
      <div className="flex-1 animate-pulse px-8 pt-8">
        <div className="h-8 w-56 rounded bg-cream-200" />
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-md bg-cream-200" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
