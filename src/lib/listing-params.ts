import type { ProductQuery, ProductSort, ProductTag } from "@/types";

export type SearchParams = Record<string, string | string[] | undefined>;
export const PAGE_SIZE = 12;
export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];
const TAGS: ProductTag[] = ["bestseller", "new", "popular", "offer"];

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const list = (v: string | string[] | undefined) => (one(v) ? one(v)!.split(",").filter(Boolean) : []);
const num = (v: string | string[] | undefined) => {
  const n = Number(one(v));
  return one(v) && Number.isFinite(n) ? n : undefined;
};

/** URL search params → typed listing state (shared by Shop, Category, Search). */
export function parseListingParams(sp: SearchParams) {
  const sort = SORT_OPTIONS.some((o) => o.value === one(sp.sort)) ? (one(sp.sort) as ProductSort) : "popular";
  const tag = TAGS.includes(one(sp.tag) as ProductTag) ? (one(sp.tag) as ProductTag) : undefined;
  const page = Math.max(1, Math.floor(num(sp.page) ?? 1));
  const query: ProductQuery = {
    categories: list(sp.category),
    subCategory: one(sp.sub) || undefined,
    packSizes: list(sp.pack),
    minPrice: num(sp.min),
    maxPrice: num(sp.max),
    inStock: one(sp.stock) === "1" || undefined,
    tag,
    search: one(sp.q)?.trim() || undefined,
    sort,
  };
  return { query, page, sort };
}

export function toSearchString(sp: SearchParams, patch: Record<string, string | undefined>) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const val = one(v);
    if (val) u.set(k, val);
  }
  for (const [k, v] of Object.entries(patch)) {
    if (v) u.set(k, v);
    else u.delete(k);
  }
  const s = u.toString();
  return s ? `?${s}` : "";
}
