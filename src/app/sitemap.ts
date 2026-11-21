import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getAllProductSlugs, getCategories, getPolicies } from "@/lib/repositories";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, cats, policies] = await Promise.all([getAllProductSlugs(), getCategories(), getPolicies()]);
  const u = (p: string) => `${site.url}${p}`;
  return [
    ...["", "/shop", "/about", "/contact", "/track-order"].map((p) => ({ url: u(p), changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...cats.map((c) => ({ url: u(`/category/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...slugs.map((s) => ({ url: u(`/product/${s}`), changeFrequency: "weekly" as const, priority: 0.9 })),
    ...policies.map((p) => ({ url: u(`/policies/${p.slug}`), changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
