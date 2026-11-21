"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Chip = { label: string; href: string; active?: boolean };

/**
 * Quick category chips. Scrolls horizontally when categories outgrow the row
 * (any number of categories), with arrow buttons and edge fades on desktop.
 */
export function CategoryChips({ chips, label = "Quick categories" }: { chips: Chip[]; label?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setEdges({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest", inline: "center" });
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.7, behavior: "smooth" });
  const btn =
    "absolute top-1/2 z-10 hidden size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-line bg-white text-ink shadow-card transition-colors hover:border-brown-700 hover:bg-brown-700 hover:text-cream-100 sm:grid";

  return (
    <div className="relative -mx-4 sm:mx-0">
      {!edges.start && (
        <>
          <span className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-12 bg-gradient-to-r from-cream-50 to-transparent" aria-hidden />
          <button type="button" aria-label="Scroll categories left" onClick={() => scroll(-1)} className={cn(btn, "left-0")}>
            <ChevronLeft className="size-4" />
          </button>
        </>
      )}
      <ul ref={ref} className="scrollbar-none flex gap-2.5 overflow-x-auto scroll-smooth px-4 sm:px-0" aria-label={label}>
        {chips.map((c) => (
          <li key={c.href} className="shrink-0">
            <Link
              href={c.href}
              aria-current={c.active ? "page" : undefined}
              className={cn(
                "block whitespace-nowrap rounded-full border px-4 py-2 t-label transition-colors",
                c.active ? "border-brown-700 bg-brown-700 text-cream-100" : "border-line bg-white text-ink-soft hover:border-brown-700 hover:text-brown-700",
              )}
            >
              {c.label}
            </Link>
          </li>
        ))}
      </ul>
      {!edges.end && (
        <>
          <span className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-12 bg-gradient-to-l from-cream-50 to-transparent" aria-hidden />
          <button type="button" aria-label="Scroll categories right" onClick={() => scroll(1)} className={cn(btn, "right-0")}>
            <ChevronRight className="size-4" />
          </button>
        </>
      )}
    </div>
  );
}
