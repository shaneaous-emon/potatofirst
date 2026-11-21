import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageTitle } from "@/components/common/page-title";
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
              <ul className="scrollbar-none -mx-4 flex gap-2.5 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Quick categories">
                <li>
                  <Link href="/shop" className="block shrink-0 whitespace-nowrap rounded-full border border-brown-700 bg-brown-700 px-4 py-2 t-label text-cream-100">
                    All
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/category/${c.slug}`} className="block shrink-0 whitespace-nowrap rounded-full border border-line bg-white px-4 py-2 t-label text-ink-soft hover:border-brown-700 hover:text-brown-700">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            }
          />
        </Suspense>
      </div>
    </>
  );
}
