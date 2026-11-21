import Image from "next/image";
import Link from "next/link";
import { count, desc, sql } from "drizzle-orm";
import { FolderTree } from "lucide-react";
import {
  Forbidden,
  PageHeader,
  Table,
  Td,
  Badge,
  Card,
  StatCard,
} from "@/components/admin/ui";
import { db, t } from "@/db";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "categories.view")) return <Forbidden perm="categories.view" />;

  const d = db();
  const categoriesRows = await d
    .select({
      id: t.categories.id,
      name: t.categories.name,
      nameBn: t.categories.nameBn,
      slug: t.categories.slug,
      image: t.categories.image,
      active: t.categories.active,
      featured: t.categories.featured,
      subCategories: t.categories.subCategories,
      productCount: sql<number>`(select count(*) from products p where p.category_id = ${t.categories.id})`,
    })
    .from(t.categories)
    .orderBy(t.categories.sort);

  return (
    <>
      <PageHeader
        title="Categories"
        description="Organize your shop into main snack categories and sub-category chips."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Total Categories"
          value={categoriesRows.length}
          hint="Storefront product collections"
          icon={<FolderTree />}
        />
        <StatCard
          label="Featured On Home"
          value={categoriesRows.filter((c) => c.featured).length}
          hint="Categories highlighted on homepage"
          tone="good"
          icon={<FolderTree />}
        />
      </div>

      <Card title="Active Categories">
        <Table
          head={["Category", "Slug", "Bengali Name", "Sub-Categories", "Products", "Featured"]}
          empty="No categories found."
        >
          {categoriesRows.map((c) => (
            <tr key={c.id} className="hover:bg-cream-50">
              <Td>
                <div className="flex items-center gap-3">
                  <div className="relative size-10 shrink-0 overflow-hidden rounded border border-line bg-cream-100">
                    {c.image ? (
                      <Image
                        src={c.image}
                        alt={c.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-[10px] text-ink-muted">
                        No img
                      </div>
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/category/${c.slug}`}
                      target="_blank"
                      className="font-semibold text-brown-700 hover:underline"
                    >
                      {c.name}
                    </Link>
                  </div>
                </div>
              </Td>
              <Td className="font-mono text-[13px] text-ink-soft">/{c.slug}</Td>
              <Td className="text-[13px] text-ink">{c.nameBn || "—"}</Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {c.subCategories && c.subCategories.length > 0 ? (
                    c.subCategories.map((s) => (
                      <span
                        key={s.slug}
                        className="rounded bg-cream-200 px-2 py-0.5 text-[11px] text-ink"
                      >
                        {s.label}
                      </span>
                    ))
                  ) : (
                    <span className="text-[12px] text-ink-muted">—</span>
                  )}
                </div>
              </Td>
              <Td className="whitespace-nowrap font-medium text-ink">
                {c.productCount} products
              </Td>
              <Td>
                {c.featured ? (
                  <Badge tone="orange">Featured</Badge>
                ) : (
                  <Badge tone="gray">Standard</Badge>
                )}
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
