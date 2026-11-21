import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { PageTitle } from "@/components/common/page-title";
import { SectionHeader } from "@/components/common/section-header";
import { ProductGrid } from "@/components/product/product-grid";
import { getProducts } from "@/lib/repositories";

export const metadata: Metadata = { title: "Your Cart", robots: { index: false } };

export default async function CartPage() {
  const suggestions = await getProducts({ slugs: ["masala-potato-chips", "medjool-dates", "date-and-nut-mix", "masala-peanuts"] });
  return (
    <>
      <PageTitle crumbs={[{ label: "Shop", href: "/shop" }, { label: "Cart" }]} title="Your Cart" />
      <div className="container-site pt-8 lg:pt-10">
        <CartView />
      </div>
      <section className="pt-16 lg:pt-20">
        <div className="container-site flex flex-col gap-7">
          <SectionHeader eyebrow="Add more to your bag" title="You may also like" subtitle="একসাথে কিনলে আরো মজা" />
          <ProductGrid products={suggestions} />
        </div>
      </section>
    </>
  );
}
