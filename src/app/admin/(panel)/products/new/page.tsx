import { asc } from "drizzle-orm";
import { Forbidden, PageHeader } from "@/components/admin/ui";
import { db, t } from "@/db";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { EMPTY_PRODUCT, ProductForm } from "../product-form";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "products.create")) return <Forbidden perm="products.create" />;
  const categories = await db().select({ id: t.categories.id, name: t.categories.name }).from(t.categories).orderBy(asc(t.categories.sort));
  return (
    <>
      <PageHeader back={{ href: "/admin/products", label: "Products" }} title="New product" />
      <ProductForm data={EMPTY_PRODUCT} categories={categories} />
    </>
  );
}
