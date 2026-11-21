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

## Section visibility (enable / hide)

Every section in `src/content/pages/*.ts` accepts:

- `enabled: false` — the whole section is skipped by `SectionRenderer`; neighbouring sections close up, no empty gap.
- `hide: ["key", ...]` — switches off optional elements inside a section. Layout reflows (e.g. a hidden side column turns a two-column grid into one).

| Section type | hide keys |
|---|---|
| hero | `side` |
| trust | `subtitle` |
| categories / feature-grid / faq | `eyebrow`, `subtitle`, `viewAll` (+ `bodyBn` for feature-grid) |
| showcase (bestsellers) | `eyebrow`, `subtitle`, `viewAll`, `cta` |
| promo | `eyebrow`, `subtitle`, `offerChip` |
| collection | `eyebrow`, `subtitle`, `viewAll`, `feature`, `featureSubtitle`, `controls` |
| story | `eyebrow`, `body`, `bodyBn`, `floatingCard`, `points`, `ctas` |
| reviews | `eyebrow`, `subtitle`, `viewAll`, `share` |
| newsletter | `newsletter`, `social`, `socialImages`, `socialNote` |
| split | `eyebrow`, `bodyBn`, `cta` |

Elements removed in the approved Figma (section eyebrows, story Bangla line, newsletter note) keep their content but ship with `hide` set. In Phase 2 these flags come from the admin panel (Laravel `page_sections.enabled` + `hidden_elements` JSON).

## Live search

`SearchBox` (client) calls `GET /api/search?q=` (debounced 200 ms, min 2 chars) and shows up to 6 suggestions; Enter/"See all" opens `/search?q=`. Arrow keys + Enter select, Esc closes. Phase 2: point the route handler at Laravel `GET /products?q=`.

## Site-wide switches (`src/content/site.ts → features`)

| Switch | Default | Effect |
|---|---|---|
| `bangla` | `false` | Every Bangla secondary line (section subtitles, helper text, `English · বাংলা` halves) is hidden. Uses `bn()` / `<Bn>` from `lib/bn.ts`. Turn on to show them all again; per-section `hide` still applies. |
| `wishlist.enabled` / `hoverOnly` | `false` / `true` | Heart buttons, menu link, `/wishlist`. |
| `accounts` | on, Google + Facebook | Login / sign up / social buttons on `/account`. Guest checkout always works. |

`announcement.messages` rotates in the top bar every `intervalMs`.

## Page templates (`src/content/templates/index.ts`)

Product page: `related` (header + hide keys), `quickFacts` (off), `shortDescription`. Cart: `upsell`. All copy is kept; only visibility changes.

## Hero

`hero.slides[]` (main slider, autoplay + drag + arrows on hover + dots) and `hero.side[]` (one = fixed). Recommended banner size 1720×880 (main), 792×880 (side).

## Shop filters

Pack sizes and price bounds come from `getFilterFacets()` (catalogue-driven). Categories show 6 then "Show more"; quick chips scroll with arrows when they overflow.

## Product description

`product.descriptionHtml` from the admin rich-text editor is rendered with `<RichText>` (headings, lists, links, images, tables). Sanitise on the server.
