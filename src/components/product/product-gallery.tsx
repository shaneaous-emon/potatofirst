"use client";

import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ImageAsset, ProductBadge } from "@/types";

/** Figma: Product Details › Gallery (main image + thumbnails). */
export function ProductGallery({ images, badge }: { images: ImageAsset[]; badge?: ProductBadge }) {
  const [active, setActive] = useState(0);
  const img = images[active] ?? images[0];
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-cream-100">
        <Image key={img.src} src={img.src} alt={img.alt} fill priority sizes="(min-width:1024px) 620px, 100vw" className="object-cover animate-in fade-in-0 duration-300" />
        {badge && (
          <Badge tone={badge.tone} className="absolute left-4 top-4 sm:left-5 sm:top-5">
            {badge.text}
          </Badge>
        )}
      </div>
      {images.length > 1 && (
        <ul className="grid grid-cols-4 gap-2 sm:gap-3" aria-label="Product images">
          {images.map((im, i) => (
            <li key={im.src + i}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  "relative block aspect-[1/1.1] w-full cursor-pointer overflow-hidden rounded-sm border bg-cream-100 transition",
                  i === active ? "border-2 border-orange-500" : "border-line opacity-80 hover:opacity-100",
                )}
              >
                <Image src={im.src} alt="" fill sizes="140px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
