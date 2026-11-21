import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { SectionHeader } from "@/components/common/section-header";
import { Stars } from "@/components/common/stars";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductGallery } from "@/components/product/product-gallery";
import { DeliveryPanel, DescriptionPanel, ReviewsPanel } from "@/components/product/product-tab-panels";
import { ProductTabs, REVIEWS_ANCHOR } from "@/components/product/product-tabs";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { productTemplate } from "@/content/templates";
import { headerProps } from "@/components/sections/visibility";
import { WishlistButton } from "@/components/product/wishlist-button";
import { site } from "@/content/site";
import { getAllProductSlugs, getProductBySlug, getProductReviews, getRelatedProducts } from "@/lib/repositories";
import { Bn } from "@/components/common/bn";

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return {};
  return {
    title: `${p.name} (${p.subtitle})`,
    description: `${p.name} — ${p.subtitle}. ${p.categoryName} from Potato First. Order online with Cash on Delivery.`,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { images: [p.images[0].src] },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const [reviews, related] = await Promise.all([getProductReviews(product.id), getRelatedProducts(product)]);
  const v = product.variants[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((i) => `${site.url}${i.src}`),
    description: product.shortDescription,
    sku: v.sku,
    brand: { "@type": "Brand", name: site.name },
    aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating.average, reviewCount: product.rating.count },
    offers: product.variants.map((x) => ({
      "@type": "Offer",
      priceCurrency: "BDT",
      price: x.price,
      availability: x.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${site.url}/product/${product.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="pt-6">
        <div className="container-site flex flex-col gap-6">
          <Breadcrumb items={[{ label: product.categoryName, href: `/category/${product.categorySlug}` }, { label: product.name }]} />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[620px_1fr] lg:gap-14">
            <ProductGallery images={product.images} badge={product.badge} />
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <Link href={`/category/${product.categorySlug}`} className="t-eyebrow self-start text-green-600 hover:underline">
                  {product.categoryName}
                </Link>
                <div className="flex items-start justify-between gap-4">
                  <h1 className="t-h1 text-ink">{product.name}</h1>
                  <WishlistButton productId={product.id} productName={product.name} className="size-11 border border-line shadow-none" />
                </div>
                <a href={`#${REVIEWS_ANCHOR}`} className="flex items-center gap-2 self-start hover:underline">
                  <Stars value={product.rating.average} />
                  <span className="t-body-s text-ink-soft">
                    {product.rating.average.toFixed(1)} ({product.rating.count} reviews)
                  </span>
                </a>
                {productTemplate.shortDescription.enabled && <Bn className="t-body text-ink-soft">{product.shortDescription}</Bn>}
              </div>
              <div className="h-px bg-line" />
              <PurchasePanel
                product={{ id: product.id, slug: product.slug, name: product.name, image: product.images[0], variants: product.variants, categoryName: product.categoryName, categorySlug: product.categorySlug }}
              />
            </div>
          </div>
        </div>
      </section>
      <section className="pt-14 lg:pt-16">
        <div className="container-site">
          <ProductTabs
            reviewCount={product.rating.count}
            description={<DescriptionPanel product={product} />}
            reviews={<ReviewsPanel product={product} reviews={reviews} />}
            delivery={<DeliveryPanel />}
          />
        </div>
      </section>
      {productTemplate.related.enabled && related.length > 0 && (
        <section className="pt-16 lg:pt-20">
          <div className="container-site flex flex-col gap-7">
            <SectionHeader
              {...headerProps({ ...productTemplate.related.header, viewAll: { href: `/category/${product.categorySlug}` } }, productTemplate.related.hide)}
            />
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </>
  );
}
