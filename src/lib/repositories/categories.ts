/** Category repository. Phase 2 → GET /api/categories */
import { cacheLife, cacheTag } from "next/cache";
import { categories as mockCategories } from "@/data/mock/categories";
import { products } from "@/data/mock/products";
import type { Category } from "@/types";

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");
  return mockCategories;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");
  return mockCategories.find((c) => c.slug === slug) ?? null;
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  "use cache";
  cacheLife("hours");
  return Object.fromEntries(mockCategories.map((c) => [c.slug, products.filter((p) => p.categorySlug === c.slug).length]));
}
