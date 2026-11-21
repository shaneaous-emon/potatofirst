"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { SORT_OPTIONS } from "@/lib/listing-params";

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <label className="flex items-center gap-3">
      <span className="hidden t-body-s text-ink-muted sm:inline">Sort by</span>
      <span className="relative">
        <select
          aria-label="Sort products"
          value={value}
          onChange={(e) => {
            const u = new URLSearchParams(params);
            u.set("sort", e.target.value);
            u.delete("page");
            router.push(`${pathname}?${u}`, { scroll: false });
          }}
          className="h-10 cursor-pointer appearance-none rounded-sm border border-line bg-white py-2 pl-4 pr-10 t-label text-ink outline-none focus-visible:border-orange-500"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink" aria-hidden />
      </span>
    </label>
  );
}
