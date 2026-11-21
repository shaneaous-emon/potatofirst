import Image from "next/image";
import Link from "next/link";
import { Carousel } from "@/components/common/carousel";
import { MobileViewAll, SectionHeader } from "@/components/common/section-header";
import { ProductCard } from "@/components/product/product-card";
import { buttonVariants } from "@/components/ui/button";
import { getProducts } from "@/lib/repositories";
import { SectionShell } from "./section-shell";
import { headerProps, isOn } from "./visibility";
import type { ProductCollectionSection } from "./types";

/**
 * Figma: 08–10 Category collections — feature tile + product row + slider controls.
 * Reuse for any category by changing `query.category` and the feature tile.
 * hide keys: eyebrow | subtitle | viewAll | feature | featureSubtitle | controls
 */
export async function ProductCollection({ header, hide, query, feature, spacingTop = "lg", spacingBottom = "lg", background }: ProductCollectionSection) {
  const products = await getProducts(query);
  const showFeature = isOn(hide, "feature");
  const h = headerProps(header, hide);

  const tile = (
    <Link
      href={feature.cta.href}
      className="group relative isolate flex h-full min-h-[300px] flex-col justify-end gap-3 overflow-hidden rounded-lg p-6 sm:p-7 lg:min-h-[458px]"
    >
      <Image src={feature.image.src} alt={feature.image.alt} fill sizes="(min-width:1024px) 400px, 80vw" className="-z-10 object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
      <span className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent from-30% to-brown-900/90" aria-hidden />
      <p className="t-h2 whitespace-pre-line text-white">{feature.title}</p>
      {feature.subtitle && isOn(hide, "featureSubtitle") && <p className="t-bn-s text-cream-100">{feature.subtitle}</p>}
      <span className={buttonVariants({ variant: "accent", className: "self-start" })}>{feature.cta.label}</span>
    </Link>
  );

  const items = [...(showFeature ? [tile] : []), ...products.map((p) => <ProductCard key={p.id} product={p} />)];

  return (
    <SectionShell spacingTop={spacingTop} spacingBottom={spacingBottom} background={background}>
      <div className="flex flex-col gap-6 lg:gap-8">
        <SectionHeader {...h} />
        <Carousel
          label={header.title}
          controls={isOn(hide, "controls") ? "always" : "auto"}
          firstItemClassName={showFeature ? "w-[82%] xs:w-[70%] sm:w-[calc((100%-48px)/2.4)] lg:w-[400px]" : undefined}
          itemClassName={
            showFeature
              ? "w-[46%] xs:w-[44%] sm:w-[calc((100%-48px)/3)] lg:w-[calc((100%-400px-72px)/3)]"
              : "w-[46%] xs:w-[44%] sm:w-[calc((100%-48px)/3)] lg:w-[calc((100%-72px)/4)]"
          }
        >
          {items}
        </Carousel>
        {h.viewAll && <MobileViewAll href={h.viewAll.href} />}
      </div>
    </SectionShell>
  );
}
