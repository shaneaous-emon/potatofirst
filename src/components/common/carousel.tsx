"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Lightweight scroll-snap carousel (no library). Fits items in a row; if
 * there are more items than fit, it scrolls with arrows + progress bar.
 * Figma: Collection Row (scrollable) + Slider Controls.
 */
export function Carousel({
  children,
  itemClassName,
  className,
  label,
  controls = true,
}: {
  children: React.ReactNode[];
  itemClassName?: string;
  className?: string;
  label: string;
  controls?: boolean;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const [state, setState] = useState({ progress: 0, ratio: 1, start: true, end: true });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setState({
      progress: max > 0 ? el.scrollLeft / max : 0,
      ratio: el.scrollWidth > 0 ? Math.min(1, el.clientWidth / el.scrollWidth) : 1,
      start: el.scrollLeft <= 2,
      end: el.scrollLeft >= max - 2,
    });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const scrollable = state.ratio < 0.999;

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <ul
        ref={ref}
        onScroll={update}
        aria-label={label}
        className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 sm:mx-0 sm:gap-6 sm:px-0"
      >
        {children.map((child, i) => (
          <li key={i} className={cn("shrink-0 snap-start", itemClassName)}>
            {child}
          </li>
        ))}
      </ul>
      {controls && scrollable && (
        <div className="flex items-center gap-2.5">
          <div className="relative h-1 w-full max-w-[360px] overflow-hidden rounded-full bg-line" aria-hidden>
            <div
              className="absolute inset-y-0 rounded-full bg-orange-500 transition-[left] duration-150"
              style={{ width: `${state.ratio * 100}%`, left: `${state.progress * (1 - state.ratio) * 100}%` }}
            />
          </div>
          <div className="ml-auto flex gap-2.5">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => scroll(-1)}
              disabled={state.start}
              className="grid size-11 cursor-pointer place-items-center rounded-full border border-line bg-white text-brown-700 transition-colors hover:border-brown-700 disabled:cursor-default disabled:opacity-40"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => scroll(1)}
              disabled={state.end}
              className="grid size-11 cursor-pointer place-items-center rounded-full bg-brown-700 text-cream-100 transition-colors hover:bg-brown-900 disabled:cursor-default disabled:opacity-40"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
