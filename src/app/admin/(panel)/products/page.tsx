import Image from "next/image";
import Link from "next/link";
import { count, desc, eq, sql } from "drizzle-orm";
import { Package, Plus, Eye, EyeOff } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import {
  Forbidden,
  PageHeader,
  Table,
  Td,
  Badge,
  Card,
  StatCard,
  SearchFilter,
  btn,
  taka,
} from "@/components/admin/ui";
import { db, t } from "@/db";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { toggleProductStatusAction } from "@/app/admin/_actions/settings";

export const metadata = { title: "Products" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "products.view")) return <Forbidden perm="products.view" />;

  const sp = (await searchParams) as Record<string, string>;
  const d = db();

  const [productsRows, [{ totalProducts }], categories] = await Promise.all([
    d
      .select({
        id: t.products.id,
        name: t.products.name,
        slug: t.products.slug,
        status: t.products.status,
        categoryId: t.products.categoryId,
        categoryName: t.categories.name,
        image: sql<string>`(select src from product_images pi where pi.product_id = ${t.products.id} order by sort limit 1)`,
        minPrice: sql<number>`(select min(price) from product_variants pv where pv.product_id = ${t.products.id})`,
        totalStock: sql<number>`(select coalesce(sum(stock_on_hand), 0) from product_variants pv where pv.product_id = ${t.products.id})`,
      })
      .from(t.products)
      .leftJoin(t.categories, eq(t.categories.id, t.products.categoryId))
      .orderBy(desc(t.products.createdAt))
      .limit(50),
    d.select({ totalProducts: count() }).from(t.products),
    d.select({ id: t.categories.id, name: t.categories.name }).from(t.categories),
  ]);

  const publishedCount = productsRows.filter((p) => p.status === "published").length;
  const editable = can(admin.permissions, "products.edit");

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage catalogue items, pricing, stock levels, and store visibility."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Products"
          value={totalProducts}
          hint="Catalog items"
          icon={<Package />}
        />
        <StatCard
          label="Published Online"
          value={publishedCount}
          hint="Visible in customer storefront"
          tone="good"
          icon={<Eye />}
        />
        <StatCard
          label="Drafts / Hidden"
          value={totalProducts - publishedCount}
          hint="Hidden from shop"
          icon={<EyeOff />}
        />
      </div>

      <SearchFilter placeholder="Search products..." defaultValue={sp.q} />

      <Card title="Product Catalog">
        <Table
          head={[
            "Product",
            "Category",
            "Price From",
            "Stock",
            "Status",
            editable ? "Visibility" : null,
          ].filter(Boolean)}
          empty="No products found in catalogue."
        >
          {productsRows.map((p) => (
            <tr key={p.id} className="hover:bg-cream-50">
              <Td>
                <div className="flex items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded border border-line bg-cream-100">
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-[10px] text-ink-muted">
                        No img
                      </div>
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/product/${p.slug}`}
                      target="_blank"
                      className="font-semibold text-brown-700 hover:underline"
                    >
                      {p.name}
                    </Link>
                    <span className="block text-[11px] text-ink-muted">/{p.slug}</span>
                  </div>
                </div>
              </Td>
              <Td className="text-[13px] text-ink-soft">
                {p.categoryName || "Uncategorized"}
              </Td>
              <Td className="whitespace-nowrap font-medium text-ink">
                {p.minPrice != null ? taka(Number(p.minPrice)) : "—"}
              </Td>
              <Td>
                <span
                  className={`font-semibold ${
                    Number(p.totalStock) > 10
                      ? "text-green-600"
                      : Number(p.totalStock) > 0
                        ? "text-orange-600"
                        : "text-sale"
                  }`}
                >
                  {p.totalStock ?? 0} units
                </span>
              </Td>
              <Td>
                <Badge tone={p.status === "published" ? "green" : "gray"}>
                  {p.status.toUpperCase()}
                </Badge>
              </Td>
              {editable && (
                <Td className="whitespace-nowrap">
                  <ActionForm action={toggleProductStatusAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={p.status === "published" ? "draft" : "published"}
                    />
                    <SubmitButton
                      className="h-8 px-3 text-[13px] border border-line bg-white hover:bg-cream-100 text-ink"
                    >
                      {p.status === "published" ? "Set to Draft" : "Publish"}
                    </SubmitButton>
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
