import Link from "next/link";
import { SectionHeader } from "@/components/common/section-header";
import { ProductCard } from "@/components/product/product-card";
import { ProductGrid } from "@/components/product/product-grid";
import { buttonVariants } from "@/components/ui/button";
import { getCategories, getProducts } from "@/lib/repositories";
import { FilterableGrid } from "./filterable-grid";
import { SectionShell } from "./section-shell";
import type { ProductShowcaseSection } from "./types";

/** Figma: 06 Bestselling Products — header, optional category tabs, product grid, CTA. */
export async function ProductShowcase({ header, query, filterTabs, cta, spacingTop, spacingBottom, background }: ProductShowcaseSection) {
  const [products, categories] = await Promise.all([getProducts(query), getCategories()]);
  return (
    <SectionShell spacingTop={spacingTop} spacingBottom={spacingBottom} background={background}>
      <div className="flex flex-col gap-6 lg:gap-7">
        <SectionHeader {...header} />
        {filterTabs ? (
          <FilterableGrid
            tabs={categories.map((c) => ({ value: c.slug, label: c.name }))}
            items={products.map((p) => ({ key: p.id, group: p.categorySlug, node: <ProductCard product={p} /> }))}
          />
        ) : (
          <ProductGrid products={products} />
        )}
        {cta && (
          <div className="flex justify-center pt-2">
            <Link href={cta.href} className={buttonVariants({ variant: "outline" })}>
              {cta.label}
            </Link>
          </div>
        )}
      </div>
    </SectionShell>
  );
}
