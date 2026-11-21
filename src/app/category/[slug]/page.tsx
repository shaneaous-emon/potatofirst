import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { CategoryCard } from "@/components/sections/category-card";
import { ListingSkeleton } from "@/components/shop/listing-skeleton";
import { ProductListing } from "@/components/shop/product-listing";
import { SubCategoryChips } from "@/components/shop/sub-category-chips";
import { getCategories, getCategoryBySlug, getCategoryCounts } from "@/lib/repositories";

export async function generateStaticParams() {
  const cats = await getCategories();
  return cats.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) return {};
  return {
    title: cat.name,
    description: `${cat.name} from Potato First — ${cat.description}`,
    alternates: { canonical: `/category/${cat.slug}` },
    openGraph: { images: [cat.banner.src] },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const [cat, all, counts] = await Promise.all([getCategoryBySlug(slug), getCategories(), getCategoryCounts()]);
  if (!cat) notFound();
  const others = all.filter((c) => c.slug !== cat.slug);

  return (
    <>
      <section className="pt-6">
        <div className="container-site flex flex-col gap-4">
          <Breadcrumb items={[{ label: "Shop", href: "/shop" }, { label: cat.name }]} />
          {/* Figma: Category Banner (CMS image slot) */}
          <div className="relative isolate flex min-h-[200px] flex-col justify-center gap-2.5 overflow-hidden rounded-lg px-6 py-8 sm:min-h-[260px] sm:px-14">
            <Image src={cat.banner.src} alt="" fill priority sizes="(min-width:1280px) 1280px, 100vw" className="-z-10 object-cover" />
            <span className="absolute inset-0 -z-10 bg-gradient-to-r from-brown-900/90 via-brown-900/50 to-transparent" aria-hidden />
            <h1 className="t-h1 text-white">{cat.name}</h1>
            <p className="max-w-md t-bn text-cream-100">{cat.description}</p>
            <span className="self-start rounded-full bg-orange-500 px-3 py-1.5 t-caption text-brown-900">{counts[cat.slug] ?? 0} products</span>
          </div>
        </div>
      </section>
      <div className="container-site flex flex-col gap-6 pt-8">
        <Suspense fallback={null}>
          <SubCategoryChips basePath={`/category/${cat.slug}`} items={cat.subCategories} searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<ListingSkeleton />}>
          <ProductListing basePath={`/category/${cat.slug}`} searchParams={searchParams} fixed={{ category: cat.slug }} showCategoryFilter={false} emptyAction={{ label: `View all ${cat.name}`, href: `/category/${cat.slug}` }} />
        </Suspense>
      </div>
      <section className="pt-16 lg:pt-20">
        <div className="container-site flex flex-col gap-6">
          <h2 className="t-h2 text-ink">Explore other categories</h2>
          <ul className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:gap-8">
            {others.map((c) => (
              <li key={c.slug}>
                <CategoryCard category={c} sizes="(min-width:1024px) 400px, 50vw" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
