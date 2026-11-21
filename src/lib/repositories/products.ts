/**
 * Product repository — the ONLY place pages/sections read product data from.
 *
 * Phase 1: reads the mock catalogue.
 * Phase 2: replace the bodies with calls to the Laravel REST API
 *   (e.g. `apiGet<Paginated<Product>>("/products", query)`), keeping
 *   the same signatures so no UI code changes.
 */
import { cacheLife, cacheTag } from "next/cache";
import { products as mockProducts } from "@/data/mock/products";
import { sampleReviewsFor } from "@/data/mock/reviews";
import type { Product, ProductQuery, Review } from "@/types";

export const minPrice = (p: Product) => Math.min(...p.variants.map((v) => v.price));

function applyQuery(list: Product[], q: ProductQuery): Product[] {
  let out = [...list];
  if (q.slugs) out = q.slugs.map((s) => out.find((p) => p.slug === s)).filter(Boolean) as Product[];
  if (q.category) out = out.filter((p) => p.categorySlug === q.category);
  if (q.categories?.length) out = out.filter((p) => q.categories!.includes(p.categorySlug));
  if (q.packSizes?.length) out = out.filter((p) => p.variants.some((v) => q.packSizes!.includes(v.label)));
  if (q.minPrice != null) out = out.filter((p) => minPrice(p) >= q.minPrice!);
  if (q.maxPrice != null) out = out.filter((p) => minPrice(p) <= q.maxPrice!);
  if (q.inStock) out = out.filter((p) => p.variants.some((v) => v.inStock));
  if (q.subCategory) out = out.filter((p) => p.subCategory === q.subCategory);
  if (q.tag) out = out.filter((p) => p.tags.includes(q.tag!));
  if (q.search) {
    const term = q.search.trim().toLowerCase();
    out = out.filter((p) =>
      [p.name, p.subtitle, p.categorySlug, p.shortDescription].some((f) => f.toLowerCase().includes(term)),
    );
  }
  switch (q.sort) {
    case "newest":
      out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "price-asc":
      out.sort((a, b) => minPrice(a) - minPrice(b));
      break;
    case "price-desc":
      out.sort((a, b) => minPrice(b) - minPrice(a));
      break;
    case "popular":
      out.sort((a, b) => a.popularity - b.popularity);
      break;
    default:
      if (!q.slugs) out.sort((a, b) => a.popularity - b.popularity);
  }
  if (q.limit) out = out.slice(0, q.limit);
  return out;
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  return applyQuery(mockProducts, query);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("products", `product:${slug}`);
  return mockProducts.find((p) => p.slug === slug) ?? null;
}

export async function getAllProductSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  return mockProducts.map((p) => p.slug);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  const same = mockProducts.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id);
  const others = mockProducts.filter((p) => p.categorySlug !== product.categorySlug);
  return [...same, ...others].slice(0, limit);
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(`reviews:${productId}`);
  return sampleReviewsFor(productId);
}
