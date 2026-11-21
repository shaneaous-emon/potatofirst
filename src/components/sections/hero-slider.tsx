"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "./types";

/**
 * Banner slider: auto-advances, pauses on hover, drag/swipe to change,
 * arrows on hover, dots bottom-left. One slide = static banner.
 */
export function HeroSlider({
  slides,
  intervalMs = 4000,
  priority,
  sizes,
  className,
  imageClassName,
  label = "Featured banners",
}: {
  slides: HeroSlide[];
  intervalMs?: number;
  priority?: boolean;
  sizes: string;
  className?: string;
  imageClassName?: string;
  label?: string;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const n = slides.length;

  const goTo = useCallback(
    (i: number) => {
      const el = track.current;
      if (!el) return;
      const next = (i + n) % n;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    },
    [n],
  );

  // keep index in sync with scroll position (swipe, drag, arrows)
  useEffect(() => {
    const el = track.current;
    if (!el || n < 2) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [n]);

  useEffect(() => {
    if (n < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => goTo(index + 1), intervalMs);
    return () => clearTimeout(t);
  }, [index, paused, n, intervalMs, goTo]);

  const arrow =
    "absolute top-1/2 z-10 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white/90 text-ink shadow-card transition-all hover:bg-brown-700 hover:text-cream-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/hero:opacity-100 focus-visible:opacity-100 max-sm:size-9";

  return (
    <div
      className={cn("group/hero relative overflow-hidden rounded-lg", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        drag.current = null;
      }}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <ul
        ref={track}
        className={cn("scrollbar-none flex h-full snap-x snap-mandatory overflow-x-auto", n > 1 && "cursor-grab active:cursor-grabbing")}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || n < 2 || !track.current) return;
          drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false };
          track.current.style.scrollSnapType = "none";
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || !track.current) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 4) d.moved = true;
          track.current.scrollLeft = d.left - dx;
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          if (!d || !track.current) return;
          const el = track.current;
          const dx = e.clientX - d.x;
          const base = Math.round(d.left / el.clientWidth);
          el.style.scrollSnapType = "";
          goTo(Math.abs(dx) > 60 ? base + (dx < 0 ? 1 : -1) : base);
          if (!d.moved) drag.current = null;
          else setTimeout(() => (drag.current = null), 0);
        }}
      >
        {slides.map((s, i) => (
          <li key={s.image.src + i} className="relative w-full shrink-0 snap-start" aria-roledescription="slide" aria-label={`${i + 1} of ${n}`}>
            <Link
              href={s.href}
              draggable={false}
              onClick={(e) => {
                if (drag.current?.moved) e.preventDefault();
              }}
              className="block size-full"
              tabIndex={i === index ? 0 : -1}
            >
              {s.mobileImage && (
                <Image
                  src={s.mobileImage.src}
                  alt={s.mobileImage.alt}
                  width={s.mobileImage.width}
                  height={s.mobileImage.height}
                  priority={priority && i === 0}
                  sizes="100vw"
                  draggable={false}
                  className="h-auto w-full sm:hidden"
                />
              )}
              <Image
                src={s.image.src}
                alt={s.image.alt}
                width={s.image.width}
                height={s.image.height}
                priority={priority && i === 0}
                fetchPriority={priority && i === 0 ? "high" : undefined}
                sizes={sizes}
                draggable={false}
                className={cn("size-full select-none object-cover", imageClassName, s.mobileImage && "max-sm:hidden")}
              />
            </Link>
          </li>
        ))}
      </ul>
      {n > 1 && (
        <>
          <button type="button" aria-label="Previous banner" onClick={() => goTo(index - 1)} className={cn(arrow, "left-3 sm:left-4")}>
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" aria-label="Next banner" onClick={() => goTo(index + 1)} className={cn(arrow, "right-3 sm:right-4")}>
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute bottom-3 left-4 z-10 flex gap-2 sm:bottom-5 sm:left-6">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to banner ${i + 1}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
                className={cn(
                  "h-2.5 cursor-pointer rounded-full transition-all",
                  i === index ? "w-7 bg-orange-500" : "w-2.5 bg-white/70 hover:bg-white",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
