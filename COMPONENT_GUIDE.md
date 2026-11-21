# Component Guide

Figma component → code mapping (Design System page of the Figma file).

| Figma | Code |
|---|---|
| Button (Primary/Accent/Outline/Light/WhatsApp × Default/Hover/Disabled) | `ui/button.tsx` → `<Button variant size>` / `buttonVariants()` for links |
| Badge (Orange/Green/Brown/Red) | `ui/badge.tsx` |
| Input Field (Default/Focus/Error) | `ui/input.tsx` + `ui/form-field.tsx` |
| Radio Option | `ui/radio-card.tsx` |
| Quantity Stepper | `product/quantity-stepper.tsx` |
| Breadcrumb | `common/breadcrumb.tsx` |
| Section Header | `common/section-header.tsx` |
| Product Card (Default/Hover/In Cart) | `product/product-card.tsx` (+ `product-card-actions.tsx`, `wishlist-button.tsx`) |
| Category Card | `sections/category-card.tsx` |
| Cart Item | `cart/cart-line-item.tsx` (`variant="page" | "drawer" | "summary"`) |
| Product Tabs | `product/product-tabs.tsx` + `product-tab-panels.tsx` |
| Review Reel Card | `sections/review-reel-card.tsx` |
| Toast | Sonner (`toast()` from `sonner`), styled in `app/layout.tsx` |
| Site Header / Mobile Header / Menu Drawer | `layout/site-header.tsx`, `layout/mobile-menu.tsx` |
| Site Footer | `layout/site-footer.tsx` |

## Reusable sections
All live in `src/components/sections/`, are registered in `registry.tsx`, and take typed content props
(`types.ts`). Each supports `spacingTop`, `spacingBottom` (`none|sm|md|lg`) and `background`
(`none|cream|cream-soft|white|brown`).

| `type` | Component | Used on |
|---|---|---|
| `hero` | HeroBanner — main + side image slots | Home |
| `trust` | TrustHighlights | Home |
| `categoryGrid` | CategoryGrid | Home |
| `productShowcase` | ProductShowcase — grid + optional category tabs | Home |
| `promoBanner` | PromoBanner | Home |
| `productCollection` | ProductCollection — feature tile + carousel | Home ×3 |
| `story` | StorySection (dark brand story) | Home |
| `reviewReels` | ReviewReels | Home |
| `newsletter` | NewsletterSocial | Home, About |
| `faq` | FaqSection | Contact |
| `split` | SplitSection (image + text) | About ×2 |
| `featureGrid` | FeatureGrid | About |

### Add a new category collection to the homepage (no code)
```ts
// src/content/pages/home.ts → sections[]
{
  id: "honey-collection",
  type: "productCollection",
  background: "white",
  header: { eyebrow: "Honey Snacks Collection", title: "Honey Snacks", viewAll: { href: "/category/honey-snacks" } },
  query: { category: "honey-snacks" },
  feature: { image: IMG.catDates, title: "Sweet & golden.", cta: { label: "Shop Honey Snacks", href: "/category/honey-snacks" } },
},
```

### Create a brand-new section type
1. Add `XxxSection = Base & { type: "xxx"; ... }` to `types.ts` and to the `Section` union.
2. Build `xxx-section.tsx` (Server Component; fetch through `lib/repositories` if it needs data).
3. Register it in `sectionRegistry` and `sectionCatalogue`.
TypeScript will error until all three are done.

## Conventions
- Server Components by default; add `"use client"` only for interactivity, and keep client parts small
  (e.g. `ProductCard` is server, only its buttons are client).
- Use design tokens (`bg-brown-700`, `text-ink-soft`, `t-h2`, `t-bn`…) — never hex values.
- Bangla text uses `t-bn` / `t-bn-s` (Hind Siliguri).
- Images: always `next/image` with `sizes`; content images come from content/data, never hardcoded in components.
- Links styled as buttons: `<Link className={buttonVariants({ variant: "outline" })}>`.
