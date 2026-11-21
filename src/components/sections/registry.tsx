/**
 * SECTION REGISTRY
 * Maps a section `type` (stored in page content / future CMS JSON) to the
 * component that renders it. To add a new reusable section:
 *   1. add its content type to ./types.ts (Section union)
 *   2. build the component in this folder
 *   3. register it below
 */
import type { ComponentType } from "react";
import { CategoryGrid } from "./category-grid";
import { FaqSection } from "./faq-section";
import { FeatureGrid } from "./feature-grid";
import { HeroBanner } from "./hero-banner";
import { NewsletterSocial } from "./newsletter-social";
import { ProductCollection } from "./product-collection";
import { ProductShowcase } from "./product-showcase";
import { PromoBanner } from "./promo-banner";
import { ReviewReels } from "./review-reels";
import { SplitSection } from "./split-section";
import { StorySection } from "./story-section";
import { TrustHighlights } from "./trust-highlights";
import type { Section, SectionType } from "./types";

type Registry = { [K in SectionType]: ComponentType<Extract<Section, { type: K }>> };

export const sectionRegistry: Registry = {
  hero: HeroBanner,
  trust: TrustHighlights,
  categoryGrid: CategoryGrid,
  productShowcase: ProductShowcase,
  promoBanner: PromoBanner,
  productCollection: ProductCollection,
  story: StorySection,
  reviewReels: ReviewReels,
  newsletter: NewsletterSocial,
  faq: FaqSection,
  split: SplitSection,
  featureGrid: FeatureGrid,
};

/** Human-readable catalogue (for docs and the future admin "Add section" picker). */
export const sectionCatalogue: Record<SectionType, string> = {
  hero: "Hero banner (main + side image slots)",
  trust: "Trust highlights (icon + title + Bangla line)",
  categoryGrid: "Shop by category cards",
  productShowcase: "Product grid with optional category tabs",
  promoBanner: "Wide promotional banner with CTA",
  productCollection: "Category collection: feature tile + product carousel",
  story: "Brand story (dark) with points and CTAs",
  reviewReels: "Customer photo/video review reels",
  newsletter: "Newsletter + social discovery",
  faq: "FAQ accordion",
  split: "Image + text split block",
  featureGrid: "Icon feature grid",
};
