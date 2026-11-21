"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { RANGES } from "@/lib/admin/range";
import { cn } from "@/lib/utils";

/** Today / Yesterday / 7d / 30d / Month / Custom chips. */
export function RangeFilter({ current, from, to }: { current: string; from?: string; to?: string }) {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  const [f, setF] = useState(from ?? "");
  const [tt, setT] = useState(to ?? "");
  const go = (range: string, extra: Record<string, string> = {}) => {
    const u = new URLSearchParams(sp);
    u.set("range", range);
    u.delete("from");
    u.delete("to");
    for (const [k, v] of Object.entries(extra)) u.set(k, v);
    router.push(`${path}?${u}`);
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      {RANGES.filter((r) => r.value !== "custom").map((r) => (
        <button
          key={r.value}
          type="button"
          onClick={() => go(r.value)}
          className={cn(
            "h-9 cursor-pointer rounded-full border px-3.5 text-[13px] font-medium transition-colors",
            current === r.value ? "border-brown-700 bg-brown-700 text-cream-100" : "border-line bg-white text-ink-soft hover:border-brown-700 hover:text-brown-700",
          )}
        >
          {r.label}
        </button>
      ))}
      <span className="flex items-center gap-1.5">
        <input type="date" value={f} onChange={(e) => setF(e.target.value)} aria-label="From date" className="h-9 rounded-sm border border-line bg-white px-2 text-[13px]" />
        <span className="text-ink-muted">–</span>
        <input type="date" value={tt} onChange={(e) => setT(e.target.value)} aria-label="To date" className="h-9 rounded-sm border border-line bg-white px-2 text-[13px]" />
        <button
          type="button"
          disabled={!f || !tt}
          onClick={() => go("custom", { from: f, to: tt })}
          className={cn("h-9 cursor-pointer rounded-sm border px-3 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40", current === "custom" ? "border-brown-700 bg-brown-700 text-cream-100" : "border-line bg-white hover:border-brown-700")}
        >
          Apply
        </button>
      </span>
    </div>
  );
}
