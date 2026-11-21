/**
 * SECTION CONTENT TYPES
 * ---------------------
 * Every reusable page section is described by a typed, serialisable
 * content object. Pages are just an ordered list of these objects
 * (see src/content/pages/*). In phase 2 the Laravel admin will store
 * the same JSON shape per page, so a future page builder only has to
 * produce `PageContent` — no component changes needed.
 */
import type { IconName } from "@/components/common/icon";
import type { ImageAsset, ProductQuery } from "@/types";

export type Spacing = "none" | "sm" | "md" | "lg";
export type Background = "none" | "cream" | "cream-soft" | "white" | "brown";

type Base = {
  /** Stable id (used as React key and for admin editing) */
  id: string;
  spacingTop?: Spacing;
  spacingBottom?: Spacing;
  background?: Background;
};

export type Link = { label: string; href: string };
export type Header = { eyebrow?: string; title: string; subtitle?: string; viewAll?: { label?: string; href: string } };

export type HeroSection = Base & {
  type: "hero";
  main: { image: ImageAsset; mobileImage?: ImageAsset; href: string };
  side?: { image: ImageAsset; href: string };
};

export type TrustSection = Base & {
  type: "trust";
  items: { icon: IconName; title: string; subtitle: string }[];
};

export type CategoryGridSection = Base & {
  type: "categoryGrid";
  header: Header;
  /** Optional explicit list/order; defaults to all categories */
  categorySlugs?: string[];
};

export type ProductShowcaseSection = Base & {
  type: "productShowcase";
  header: Header;
  query: ProductQuery;
  /** Show category filter tabs above the grid */
  filterTabs?: boolean;
  cta?: Link;
};

export type PromoBannerSection = Base & {
  type: "promoBanner";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta: Link;
  offerChip?: string;
  image: ImageAsset;
};

export type ProductCollectionSection = Base & {
  type: "productCollection";
  header: Header;
  query: ProductQuery;
  feature: { image: ImageAsset; title: string; subtitle?: string; cta: Link };
};

export type StorySection = Base & {
  type: "story";
  eyebrow?: string;
  title: string;
  body: string;
  bodyBn?: string;
  image: ImageAsset;
  floatingCard?: { icon: IconName; title: string; subtitle: string };
  points: { icon: IconName; title: string; subtitle: string }[];
  ctas: Link[];
};

export type ReviewReelsSection = Base & {
  type: "reviewReels";
  header: Header;
  share?: { text: string; cta: Link };
};

export type NewsletterSection = Base & {
  type: "newsletter";
  newsletter: { title: string; subtitle: string };
  social: { title: string; subtitle: string; images: ImageAsset[] };
};

export type FaqSection = Base & {
  type: "faq";
  header: Header;
  items?: { q: string; a: string }[];
};

export type SplitSection = Base & {
  type: "split";
  eyebrow?: string;
  title: string;
  titleSize?: "display" | "h2";
  body?: string;
  bodyBn?: string;
  image: ImageAsset;
  imageSide?: "left" | "right";
  cta?: Link;
  breadcrumb?: string;
};

export type FeatureGridSection = Base & {
  type: "featureGrid";
  header: Header;
  items: { icon: IconName; title: string; body: string; bodyBn?: string }[];
};

export type Section =
  | HeroSection
  | TrustSection
  | CategoryGridSection
  | ProductShowcaseSection
  | PromoBannerSection
  | ProductCollectionSection
  | StorySection
  | ReviewReelsSection
  | NewsletterSection
  | FaqSection
  | SplitSection
  | FeatureGridSection;

export type SectionType = Section["type"];

export type PageContent = {
  slug: string;
  title: string;
  description?: string;
  sections: Section[];
};
