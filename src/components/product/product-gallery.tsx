"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ImageAsset, ProductBadge } from "@/types";

/**
 * Figma: Product Details › Gallery (main image + thumbnails).
 * Auto-advances in a loop; pauses on hover/focus; arrows on hover; swipe on touch.
 */
export function ProductGallery({ images, badge, intervalMs = 4000 }: { images: ImageAsset[]; badge?: ProductBadge; intervalMs?: number }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = images.length;
  const img = images[active] ?? images[0];
  const go = useCallback((d: number) => setActive((a) => (a + d + n) % n), [n]);

  useEffect(() => {
    if (n < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => go(1), intervalMs);
    return () => clearInterval(t);
  }, [n, paused, intervalMs, go, active]);

  const arrow = "absolute top-1/2 z-10 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white/90 text-ink shadow-card transition-all hover:bg-brown-700 hover:text-cream-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus-visible:opacity-100";

  return (
    <div className="flex flex-col gap-3 sm:gap-4" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div
        className="group relative aspect-square overflow-hidden rounded-lg bg-cream-100"
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
          setPaused(true);
        }}
        onTouchEnd={(e) => {
          const start = touchX.current;
          touchX.current = null;
          if (start == null) return;
          const dx = e.changedTouches[0].clientX - start;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
      >
        <Image key={img.src + active} src={img.src} alt={img.alt} fill priority={active === 0} sizes="(min-width:1024px) 620px, 100vw" className="object-cover animate-in fade-in-0 duration-500" />
        {badge && (
          <Badge tone={badge.tone} className="absolute left-4 top-4 sm:left-5 sm:top-5">
            {badge.text}
          </Badge>
        )}
        {n > 1 && (
          <>
            <button type="button" aria-label="Previous image" onClick={() => go(-1)} className={cn(arrow, "left-3 sm:left-4")}>
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" aria-label="Next image" onClick={() => go(1)} className={cn(arrow, "right-3 sm:right-4")}>
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>
      {n > 1 && (
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
                  i === active ? "border-2 border-orange-500" : "border-line opacity-70 hover:border-orange-500/60 hover:opacity-100",
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
