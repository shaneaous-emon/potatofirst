/** CMS-like content repository (page sections, reviews, policies). Phase 2 → Laravel CMS endpoints. */
import { cacheLife, cacheTag } from "next/cache";
import { reelReviews } from "@/data/mock/reviews";
import { faqs, policies } from "@/data/mock/policies";
import { aboutPage } from "@/content/pages/about";
import { homePage } from "@/content/pages/home";
import type { PageContent } from "@/components/sections/types";

const pages: Record<string, PageContent> = { home: homePage, about: aboutPage };

export async function getPage(slug: string): Promise<PageContent | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(`page:${slug}`);
  return pages[slug] ?? null;
}

export async function getReelReviews() {
  "use cache";
  cacheLife("hours");
  return reelReviews;
}

export async function getPolicies() {
  "use cache";
  cacheLife("days");
  return policies;
}

export async function getPolicy(slug: string) {
  "use cache";
  cacheLife("days");
  return policies.find((p) => p.slug === slug) ?? null;
}

export async function getFaqs() {
  "use cache";
  cacheLife("days");
  return faqs;
}
