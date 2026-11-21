import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Price } from "./price";
import { ProductCardActions } from "./product-card-actions";
import { WishlistButton } from "./wishlist-button";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

/**
 * Figma: Product Card (State = Default | Hover | In Cart).
 * Server component; only the cart/wishlist controls hydrate on the client.
 */
export function ProductCard({ product, priority, className }: { product: Product; priority?: boolean; className?: string }) {
  const variant = product.variants[0];
  const href = `/product/${product.slug}`;
  return (
    <article
      className={cn(
        "group/card relative flex h-full flex-col overflow-hidden rounded-md border border-line bg-white shadow-card transition-[border-color,box-shadow,transform] duration-200 hover:border-orange-500 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative aspect-[296/272] overflow-hidden bg-cream-100 sm:aspect-[296/250]">
        <Link href={href} tabIndex={-1} aria-hidden>
          <Image
            src={product.images[0].src}
            alt={product.images[0].alt}
            fill
            priority={priority}
            sizes="(min-width:1280px) 296px, (min-width:768px) 30vw, 50vw"
            className="object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.06]"
          />
        </Link>
        {product.badge && (
          <Badge tone={product.badge.tone} className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3">
            {product.badge.text}
          </Badge>
        )}
        <WishlistButton productId={product.id} productName={product.name} className="absolute right-2 top-2 transition-opacity sm:right-3 sm:top-3" hoverReveal />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3 sm:gap-1.5 sm:p-4">
        <p className="t-eyebrow truncate !tracking-[0.06em] text-orange-600 max-sm:text-[10px]">{product.categoryName}</p>
        <h3 className="font-display text-[15px] font-semibold leading-snug text-ink sm:t-h4">
          <Link href={href} className="line-clamp-2 after:absolute after:inset-0 after:z-0 hover:text-brown-700">
            {product.name}
          </Link>
        </h3>
        <p className="t-body-s truncate text-ink-muted max-sm:text-xs">
          {product.subtitle} · {variant.label}
        </p>
        <Price price={variant.price} compareAt={variant.compareAtPrice} className="[&>span:first-child]:max-sm:text-lg" />
        <div className="relative z-10 mt-auto pt-2.5 sm:pt-3">
          <ProductCardActions
            item={{
              productId: product.id,
              variantId: variant.id,
              slug: product.slug,
              name: product.name,
              variantLabel: variant.label,
              image: product.images[0],
              price: variant.price,
            }}
            inStock={variant.inStock}
          />
        </div>
      </div>
    </article>
  );
}
