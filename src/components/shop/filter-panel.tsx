"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PACK_SIZES } from "@/lib/listing-params";
import { cn } from "@/lib/utils";

type Props = {
  categories?: { slug: string; name: string; count: number }[];
  initial: { categories: string[]; packSizes: string[]; min?: number; max?: number; inStock: boolean; offer: boolean };
};

/** Figma: Shop › Filter Sidebar (desktop) / bottom-sheet style drawer (mobile). */
function FilterForm({ categories, initial, onApplied }: Props & { onApplied?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [cats, setCats] = useState(initial.categories);
  const [packs, setPacks] = useState(initial.packSizes);
  const [min, setMin] = useState(initial.min?.toString() ?? "");
  const [max, setMax] = useState(initial.max?.toString() ?? "");
  const [stock, setStock] = useState(initial.inStock);
  const [offer, setOffer] = useState(initial.offer);

  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const apply = (clear = false) => {
    const u = new URLSearchParams(params);
    const set = (k: string, v?: string) => (v ? u.set(k, v) : u.delete(k));
    set("category", clear ? undefined : cats.join(","));
    set("pack", clear ? undefined : packs.join(","));
    set("min", clear ? undefined : min);
    set("max", clear ? undefined : max);
    set("stock", !clear && stock ? "1" : undefined);
    const currentTag = u.get("tag") ?? undefined;
    set("tag", clear ? undefined : offer ? "offer" : currentTag === "offer" ? undefined : currentTag);
    u.delete("page");
    if (clear) {
      setCats([]);
      setPacks([]);
      setMin("");
      setMax("");
      setStock(false);
      setOffer(false);
    }
    router.push(`${pathname}${u.size ? `?${u}` : ""}`, { scroll: false });
    onApplied?.();
  };

  const group = "flex flex-col gap-3 border-t border-line pt-5";
  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 t-h4 text-ink">
          <SlidersHorizontal className="size-[18px]" aria-hidden /> Filters
        </p>
        <button type="button" onClick={() => apply(true)} className="cursor-pointer t-body-s text-orange-600 hover:underline">
          Clear all
        </button>
      </div>
      {categories && (
        <fieldset className={group}>
          <legend className="mb-3 t-label text-ink">Category</legend>
          {categories.map((c) => (
            <label key={c.slug} className="flex cursor-pointer items-center gap-2.5">
              <Checkbox checked={cats.includes(c.slug)} onCheckedChange={() => setCats(toggle(cats, c.slug))} />
              <span className="flex-1 t-body-s text-ink-soft">{c.name}</span>
              <span className="t-caption text-ink-muted">{c.count}</span>
            </label>
          ))}
        </fieldset>
      )}
      <fieldset className={group}>
        <legend className="mb-3 t-label text-ink">Pack Size</legend>
        <div className="flex flex-wrap gap-2">
          {PACK_SIZES.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={packs.includes(p)}
              onClick={() => setPacks(toggle(packs, p))}
              className={cn(
                "cursor-pointer rounded-full border px-4 py-2 t-label transition-colors",
                packs.includes(p) ? "border-brown-700 bg-brown-700 text-cream-100" : "border-line bg-white text-ink-soft hover:border-brown-700",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className={group}>
        <legend className="mb-3 t-label text-ink">Price Range (৳)</legend>
        <div className="flex items-center gap-2">
          <input inputMode="numeric" aria-label="Minimum price" placeholder="৳ Min" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} className="h-10 w-full min-w-0 rounded-sm border border-line px-3 t-body-s outline-none focus:border-orange-500" />
          <span className="text-ink-muted">–</span>
          <input inputMode="numeric" aria-label="Maximum price" placeholder="৳ Max" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} className="h-10 w-full min-w-0 rounded-sm border border-line px-3 t-body-s outline-none focus:border-orange-500" />
        </div>
      </fieldset>
      <fieldset className={group}>
        <legend className="mb-3 t-label text-ink">Availability</legend>
        <label className="flex cursor-pointer items-center gap-2.5">
          <Checkbox checked={offer} onCheckedChange={(v) => setOffer(v === true)} />
          <span className="t-body-s text-ink-soft">On Offer</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2.5">
          <Checkbox checked={stock} onCheckedChange={(v) => setStock(v === true)} />
          <span className="t-body-s text-ink-soft">In Stock</span>
        </label>
      </fieldset>
      <Button type="submit" className="w-full">
        Apply Filters
      </Button>
    </form>
  );
}

export function FilterSidebar(props: Props) {
  return (
    <aside className="hidden w-[280px] shrink-0 self-start rounded-md border border-line bg-white p-6 lg:block">
      <FilterForm {...props} />
    </aside>
  );
}

export function MobileFilterButton({ activeCount, ...props }: Props & { activeCount: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <SlidersHorizontal /> Filters{activeCount > 0 && ` (${activeCount})`}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto p-6 pt-16">
        <SheetTitle className="sr-only">Filters</SheetTitle>
        <SheetDescription className="sr-only">Filter products</SheetDescription>
        <FilterForm {...props} onApplied={() => setOpen(false)} />
        <SheetClose className="sr-only">Close</SheetClose>
      </SheetContent>
    </Sheet>
  );
}
