import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { ProductGrid } from "@/components/product/product-grid";
import { buttonVariants } from "@/components/ui/button";
import { getCategories, getCategoryCounts, getProducts, getFilterFacets } from "@/lib/repositories";
import { PAGE_SIZE, parseListingParams, type SearchParams } from "@/lib/listing-params";
import { FilterSidebar, MobileFilterButton } from "./filter-panel";
import { Pagination } from "./pagination";
import { SortSelect } from "./sort-select";
import type { ProductQuery } from "@/types";
import { Bn } from "@/components/common/bn";

/**
 * Shared product listing: filters + sort + grid + pagination.
 * Used by Shop, Category and Search pages. Filtering happens in the
 * repository (→ Laravel query params in phase 2), state lives in the URL.
 */
export async function ProductListing({
  basePath,
  searchParams,
  fixed = {},
  showCategoryFilter = true,
  emptyAction = { label: "Browse all products", href: "/shop" },
  topSlot,
}: {
  /** Rendered above the toolbar in the products column (e.g. quick category chips) */
  topSlot?: React.ReactNode;
  basePath: string;
  searchParams: Promise<SearchParams>;
  fixed?: ProductQuery;
  showCategoryFilter?: boolean;
  emptyAction?: { label: string; href: string };
}) {
  const sp = await searchParams;
  const { query, page, sort } = parseListingParams(sp);
  const [all, categories, counts, facets] = await Promise.all([getProducts({ ...query, ...fixed }), getCategories(), getCategoryCounts(), getFilterFacets(fixed)]);
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const products = all.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const from = all.length ? (current - 1) * PAGE_SIZE + 1 : 0;

  const filterProps = {
    facets,
    categories: showCategoryFilter ? categories.map((c) => ({ slug: c.slug, name: c.name, count: counts[c.slug] ?? 0 })) : undefined,
    initial: {
      categories: query.categories ?? [],
      packSizes: query.packSizes ?? [],
      min: query.minPrice,
      max: query.maxPrice,
      inStock: !!query.inStock,
      offer: query.tag === "offer",
    },
  };
  const activeCount = (query.categories?.length ?? 0) + (query.packSizes?.length ?? 0) + (query.minPrice != null || query.maxPrice != null ? 1 : 0) + (query.inStock ? 1 : 0) + (query.tag === "offer" ? 1 : 0);

  return (
    <div className="flex gap-8">
      <FilterSidebar {...filterProps} />
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {topSlot}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="t-body-s text-ink-soft" aria-live="polite">
            {all.length ? `Showing ${from}–${from + products.length - 1} of ${all.length} products` : "No products found"}
          </p>
          <div className="flex items-center gap-2">
            <MobileFilterButton {...filterProps} activeCount={activeCount} />
            <SortSelect value={sort} />
          </div>
        </div>
        {products.length ? (
          <ProductGrid products={products} columns={3} priorityCount={3} />
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-line bg-white px-6 py-16 text-center">
            <PackageSearch className="size-12 text-ink-muted" aria-hidden />
            <p className="t-h3 text-ink">No snacks match your filters</p>
            <Bn className="t-bn-s text-ink-soft">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</Bn>
            <Link href={emptyAction.href} className={buttonVariants({ variant: "outline" })}>
              {emptyAction.label}
            </Link>
          </div>
        )}
        <Pagination basePath={basePath} sp={sp} page={current} totalPages={totalPages} />
      </div>
    </div>
  );
}
