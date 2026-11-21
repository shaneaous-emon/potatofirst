import type { Metadata } from "next";
import { Suspense } from "react";
import { PageTitle } from "@/components/common/page-title";
import { CategoryChips } from "@/components/shop/category-chips";
import { ListingSkeleton } from "@/components/shop/listing-skeleton";
import { ProductListing } from "@/components/shop/product-listing";
import { getCategories } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "Shop All Snacks",
  description: "Shop potato snacks, date snacks, peanut snacks and snack combos from Potato First.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const categories = await getCategories();
  return (
    <>
      <PageTitle crumbs={[{ label: "Shop" }]} title="Shop All Snacks" />
      <div className="container-site pt-8 lg:pt-10">
        <Suspense fallback={<ListingSkeleton />}>
          <ProductListing
            basePath="/shop"
            searchParams={searchParams}
            topSlot={
              <CategoryChips chips={[{ label: "All", href: "/shop", active: true }, ...categories.map((c) => ({ label: c.name, href: `/category/${c.slug}` }))]} />
            }
          />
        </Suspense>
      </div>
    </>
  );
}
