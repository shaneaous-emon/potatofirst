import Link from "next/link";
import { and, asc, eq, gt, like, lte, or, sql, type SQL } from "drizzle-orm";
import { AlertTriangle, Banknote, Boxes, PackageX, Wallet } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Badge, Card, Forbidden, PageHeader, SearchFilter, Select, StatCard, Table, Td, inputCls, taka } from "@/components/admin/ui";
import { db, t } from "@/db";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { adjustStockAction } from "../../_actions/manage";

export const metadata = { title: "Stock" };

export default async function InventoryPage({ searchParams }: PageProps<"/admin/inventory">) {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "inventory.view")) return <Forbidden perm="inventory.view" />;
  const sp = (await searchParams) as Record<string, string>;
  const d = db();
  const v = t.productVariants;
  const w: (SQL | undefined)[] = [eq(v.active, true)];
  if (sp.q) w.push(or(like(t.products.name, `%${sp.q}%`), like(v.sku, `%${sp.q}%`)));
  if (sp.filter === "low") w.push(and(lte(v.stockOnHand, v.lowStockThreshold), gt(v.stockOnHand, 0)));
  if (sp.filter === "out") w.push(lte(v.stockOnHand, 0));

  const [rows, [tot]] = await Promise.all([
    d.select({ v, name: t.products.name }).from(v).innerJoin(t.products, eq(t.products.id, v.productId)).where(and(...w)).orderBy(asc(v.stockOnHand)).limit(100),
    d
      .select({
        units: sql<number>`coalesce(sum(${v.stockOnHand}),0)`,
        value: sql<number>`coalesce(sum(${v.stockOnHand}*${v.price}),0)`,
        cost: sql<number>`coalesce(sum(${v.stockOnHand}*coalesce(${v.costPrice},0)),0)`,
        low: sql<number>`coalesce(sum(case when ${v.stockOnHand} > 0 and ${v.stockOnHand} <= ${v.lowStockThreshold} then 1 else 0 end),0)`,
        out: sql<number>`coalesce(sum(case when ${v.stockOnHand} <= 0 then 1 else 0 end),0)`,
      })
      .from(v)
      .where(eq(v.active, true)),
  ]);
  const edit = can(admin.permissions, "inventory.adjust");

  return (
    <>
      <PageHeader title="Stock" description="See what’s in stock and add / remove units in one step." />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Total stock" value={`${Number(tot.units)} pcs`} icon={<Boxes />} />
        <StatCard label="Stock value" value={taka(Number(tot.value))} icon={<Banknote />} hint="selling price" />
        <StatCard label="Purchase value" value={taka(Number(tot.cost))} icon={<Wallet />} hint="cost price" />
        <StatCard label="Low stock" value={Number(tot.low)} icon={<AlertTriangle />} tone={Number(tot.low) ? "warn" : "default"} href="/admin/inventory?filter=low" />
        <StatCard label="Out of stock" value={Number(tot.out)} icon={<PackageX />} tone={Number(tot.out) ? "danger" : "default"} href="/admin/inventory?filter=out" />
      </div>
      <SearchFilter placeholder="Product name or SKU" defaultValue={sp.q}>
        <Select name="filter" defaultValue={sp.filter ?? ""} options={[{ value: "", label: "All stock" }, { value: "low", label: "Low stock" }, { value: "out", label: "Out of stock" }]} />
      </SearchFilter>
      <Card bodyClassName="p-0 sm:p-0">
        <Table head={["Product", "SKU", "Stock", "Price / Cost", edit ? "Adjust stock" : null].filter(Boolean)} empty="Nothing matches.">
          {rows.map(({ v: x, name }) => (
            <tr key={x.id} className="hover:bg-cream-50">
              <Td>
                <Link href={`/admin/products/${x.productId}`} className="font-medium text-ink hover:text-brown-700">
                  {name}
                </Link>
                <span className="block text-[12px] text-ink-muted">{x.label}</span>
              </Td>
              <Td className="font-mono text-[12px]">{x.sku}</Td>
              <Td>
                <b className={x.stockOnHand <= 0 ? "text-sale" : x.stockOnHand <= x.lowStockThreshold ? "text-orange-600" : "text-green-600"}>{x.stockOnHand}</b>
                {x.stockOnHand <= 0 ? (
                  <Badge tone="red" className="ml-2">
                    Out
                  </Badge>
                ) : x.stockOnHand <= x.lowStockThreshold ? (
                  <Badge tone="orange" className="ml-2">
                    Low
                  </Badge>
                ) : null}
              </Td>
              <Td className="whitespace-nowrap text-[13px]">
                {taka(x.price)}
                <span className="block text-ink-muted">cost {x.costPrice != null ? taka(x.costPrice) : "—"}</span>
              </Td>
              {edit && (
                <Td>
                  <ActionForm action={adjustStockAction} className="flex items-center gap-1.5" resetOnSuccess>
                    <input type="hidden" name="sku" value={x.sku} />
                    <Select name="mode" defaultValue="add" className="h-9 w-[92px]" options={[{ value: "add", label: "Add" }, { value: "remove", label: "Remove" }, { value: "set", label: "Set to" }]} />
                    <input name="qty" type="number" min={0} required placeholder="Qty" className={`${inputCls} h-9 w-20`} />
                    <SubmitButton className="h-9 px-3">Save</SubmitButton>
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
