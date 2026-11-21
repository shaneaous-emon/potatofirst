/**
 * Page templates — reusable blocks on product / cart pages.
 * Each block keeps all its copy; `enabled` and `hide` control what shows.
 * Phase 2: loaded from the admin "templates" settings.
 */
import type { Header } from "@/components/sections/types";

type Block = { enabled: boolean; header: Header; hide?: string[] };

export const productTemplate = {
  related: {
    enabled: true,
    header: { eyebrow: "You may also like", title: "Related Products", subtitle: "একই ধরনের আরো কিছু স্ন্যাকস" },
    hide: ["eyebrow", "subtitle"],
  } satisfies Block,
  /** Quick Facts box beside the description (off: description uses full width). */
  quickFacts: { enabled: false },
  /** Short line under the product name. */
  shortDescription: { enabled: true },
};

export const cartTemplate = {
  upsell: {
    enabled: true,
    header: { eyebrow: "Add more to your bag", title: "You may also like", subtitle: "একসাথে কিনলে আরো মজা" },
    hide: ["eyebrow", "subtitle"],
  } satisfies Block,
};
