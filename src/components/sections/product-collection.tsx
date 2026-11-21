import Image from "next/image";
import Link from "next/link";
import { Carousel } from "@/components/common/carousel";
import { MobileViewAll, SectionHeader } from "@/components/common/section-header";
import { ProductCard } from "@/components/product/product-card";
import { buttonVariants } from "@/components/ui/button";
import { getProducts } from "@/lib/repositories";
import { SectionShell } from "./section-shell";
import type { ProductCollectionSection } from "./types";

/**
 * Figma: 08–10 Category collections — feature tile + product row.
 * Reuse for any category by changing `query.category` and the feature tile.
 */
export async function ProductCollection({ header, query, feature, spacingTop = "lg", spacingBottom = "lg", background }: ProductCollectionSection) {
  const products = await getProducts(query);
  return (
    <SectionShell spacingTop={spacingTop} spacingBottom={spacingBottom} background={background}>
      <div className="flex flex-col gap-6 lg:gap-8">
        <SectionHeader {...header} />
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row">
          <Link
            href={feature.cta.href}
            className="group relative isolate flex min-h-[240px] shrink-0 flex-col justify-end gap-3 overflow-hidden rounded-lg p-6 sm:min-h-[300px] sm:p-7 lg:min-h-[460px] lg:w-[400px]"
          >
            <Image src={feature.image.src} alt={feature.image.alt} fill sizes="(min-width:1024px) 400px, 100vw" className="-z-10 object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
            <span className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent from-30% to-brown-900/90" aria-hidden />
            <p className="t-h2 whitespace-pre-line text-white">{feature.title}</p>
            {feature.subtitle && <p className="t-bn-s text-cream-100">{feature.subtitle}</p>}
            <span className={buttonVariants({ variant: "accent", className: "self-start" })}>{feature.cta.label}</span>
          </Link>
          <div className="min-w-0 flex-1">
            <Carousel label={header.title} itemClassName="w-[46%] xs:w-[44%] sm:w-[calc((100%-48px)/3)] lg:w-[calc((100%-48px)/3)]">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </Carousel>
          </div>
        </div>
        {header.viewAll && <MobileViewAll href={header.viewAll.href} />}
      </div>
    </SectionShell>
  );
}
