import { Suspense } from "react";
import { and, count, eq, lte } from "drizzle-orm";
import { AdminSidebar } from "@/components/admin/sidebar";
import { db, t } from "@/db";
import { requireAdmin } from "@/lib/admin/auth";
import { logoutAction } from "../_actions/auth";

async function Shell({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const d = db();
  const [[pending], [fraud], [reviews], [stock]] = await Promise.all([
    d.select({ n: count() }).from(t.orders).where(eq(t.orders.status, "pending")),
    d.select({ n: count() }).from(t.orders).where(and(eq(t.orders.fraudDecision, "none"), eq(t.orders.riskLevel, "high"))),
    d.select({ n: count() }).from(t.reviews).where(eq(t.reviews.status, "pending")),
    d.select({ n: count() }).from(t.productVariants).where(lte(t.productVariants.stockOnHand, t.productVariants.lowStockThreshold)),
  ]);
  return (
    <div className="flex min-h-dvh">
      <AdminSidebar
        permissions={admin.permissions}
        name={admin.name}
        role={admin.role}
        badges={{ pendingOrders: pending.n, fraud: fraud.n, reviews: reviews.n, stock: stock.n }}
        logout={logoutAction}
      />
      <main className="min-w-0 flex-1 px-4 pb-16 pt-16 sm:px-6 xl:px-8 xl:pt-8">{children}</main>
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
