import type { Metadata } from "next";
import { PageTitle } from "@/components/common/page-title";
import { ProductCard } from "@/components/product/product-card";
import { WishlistView } from "@/components/product/wishlist-view";
import { getProducts } from "@/lib/repositories";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

/** Phase 2: fetch only wishlisted ids (GET /api/products?ids=…) or the customer's saved list. */
export default async function WishlistPage() {
  const products = await getProducts();
  return (
    <>
      <PageTitle crumbs={[{ label: "Wishlist" }]} title="Your Wishlist" subtitle="পছন্দের স্ন্যাকস সেভ করে রাখুন" />
      <div className="container-site flex flex-col gap-6 pt-8 lg:pt-10">
        <WishlistView items={products.map((p) => ({ id: p.id, node: <ProductCard product={p} /> }))} />
      </div>
    </>
  );
}
