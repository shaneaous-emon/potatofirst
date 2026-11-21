import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchBox } from "@/components/layout/search-box";
import { ListingSkeleton } from "@/components/shop/listing-skeleton";
import { ProductListing } from "@/components/shop/product-listing";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

async function SearchHeading({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim();
  return <h1 className="t-h1 text-ink">{q ? <>Results for “{q}”</> : "Search snacks"}</h1>;
}

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <>
      <section className="bg-cream-100 pb-9 pt-7">
        <div className="container-site flex flex-col gap-4">
          <Suspense fallback={<h1 className="t-h1 text-ink">Search snacks</h1>}>
            <SearchHeading searchParams={searchParams} />
          </Suspense>
          <SearchBox className="max-w-2xl" />
        </div>
      </section>
      <div className="container-site pt-8 lg:pt-10">
        <Suspense fallback={<ListingSkeleton />}>
          <ProductListing basePath="/search" searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}
