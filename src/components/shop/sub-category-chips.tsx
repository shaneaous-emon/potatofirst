import Link from "next/link";
import { toSearchString, type SearchParams } from "@/lib/listing-params";
import { cn } from "@/lib/utils";

export async function SubCategoryChips({ basePath, items, searchParams }: { basePath: string; items: { slug: string; label: string }[]; searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const active = (Array.isArray(sp.sub) ? sp.sub[0] : sp.sub) ?? "";
  const chips = [{ slug: "", label: "All" }, ...items];
  return (
    <nav aria-label="Sub categories" className="scrollbar-none -mx-4 flex gap-2.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {chips.map((c) => (
        <Link
          key={c.slug || "all"}
          href={`${basePath}${toSearchString(sp, { sub: c.slug || undefined, page: undefined })}`}
          aria-current={active === c.slug ? "page" : undefined}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 t-label transition-colors",
            active === c.slug ? "border-brown-700 bg-brown-700 text-cream-100" : "border-line bg-white text-ink-soft hover:border-brown-700",
          )}
        >
          {c.label}
        </Link>
      ))}
    </nav>
  );
}
