import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { Forbidden, PageHeader } from "@/components/admin/ui";
import { db, t } from "@/db";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { ProductForm } from "../product-form";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "products.edit")) return <Forbidden perm="products.edit" />;
  const { id } = await params;
  const pid = Number(id);
  if (!Number.isInteger(pid)) notFound();
  const d = db();
  const [p] = await d.select().from(t.products).where(eq(t.products.id, pid));
  if (!p) notFound();
  const [variants, images, categories] = await Promise.all([
    d.select().from(t.productVariants).where(and(eq(t.productVariants.productId, pid), eq(t.productVariants.active, true))).orderBy(asc(t.productVariants.sort)),
    d.select().from(t.productImages).where(eq(t.productImages.productId, pid)).orderBy(asc(t.productImages.sort)),
    d.select({ id: t.categories.id, name: t.categories.name }).from(t.categories).orderBy(asc(t.categories.sort)),
  ]);
  return (
    <>
      <PageHeader back={{ href: "/admin/products", label: "Products" }} title={p.name} description={`/${p.slug}`} />
      <ProductForm
        categories={categories}
        data={{
          id: p.id,
          name: p.name,
          nameBn: p.nameBn ?? "",
          subtitle: p.subtitle,
          shortDescription: p.shortDescription,
          descriptionHtml: p.descriptionHtml ?? "",
          categoryId: p.categoryId,
          status: p.status,
          badgeText: p.badgeText ?? "",
          images: images.map((i) => i.src),
          variants: variants.map((v) => ({ id: v.id, label: v.label, sku: v.sku, price: v.price, compareAtPrice: v.compareAtPrice, costPrice: v.costPrice, stock: v.stockOnHand })),
        }}
      />
    </>
  );
}
