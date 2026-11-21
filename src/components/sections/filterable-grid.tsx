"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Client-side category tabs over server-rendered product cards (Figma: Bestselling › Filter Tabs). */
export function FilterableGrid({
  tabs,
  items,
}: {
  tabs: { value: string; label: string }[];
  items: { key: string; group: string; node: React.ReactNode }[];
}) {
  const [active, setActive] = useState("all");
  const visible = items.filter((i) => active === "all" || i.group === active);
  return (
    <div className="flex flex-col gap-6 lg:gap-7">
      <div role="tablist" aria-label="Filter by category" className="scrollbar-none -mx-4 flex gap-2.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {[{ value: "all", label: "All" }, ...tabs].map((t) => (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={active === t.value}
            onClick={() => setActive(t.value)}
            className={cn(
              "shrink-0 cursor-pointer rounded-full border px-[18px] py-2 t-label transition-colors",
              active === t.value ? "border-brown-700 bg-brown-700 text-cream-100" : "border-line bg-white text-ink-soft hover:border-brown-700 hover:text-brown-700",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
        {visible.map((i) => (
          <li key={i.key}>{i.node}</li>
        ))}
      </ul>
      {visible.length === 0 && <p className="py-8 text-center t-body text-ink-muted">No products in this category yet.</p>}
    </div>
  );
}
