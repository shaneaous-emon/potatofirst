# Project Architecture

## Folder structure
```
public/
  images/{banners,products,categories,reviews,story}/*.webp   ← exported from Figma
  logo-dark.svg, logo-light.svg, logo.png
src/
  app/                     ← routes (App Router). Pages are thin: fetch → compose components
  components/
    ui/                    ← shadcn-style primitives (Button, Input, Sheet, Tabs, Accordion, RadioCard…)
    common/                ← Logo, SectionHeader, Breadcrumb, Stars, Carousel, PageTitle…
    layout/                ← SiteHeader, CategoryNav, MobileMenu, SearchBox, SiteFooter
    product/               ← ProductCard (+ actions), ProductGrid, Gallery, PurchasePanel, ProductTabs
    cart/                  ← CartDrawer, CartView, CartLineItem, PromoCode
    checkout/              ← CheckoutForm, OrderConfirmation
    shop/                  ← ProductListing (filters/sort/pagination), FilterPanel, SortSelect
    forms/                 ← ContactForm, TrackOrderForm
    sections/              ← reusable page sections + registry + renderer
  content/
    site.ts                ← global settings (contacts, nav, footer, delivery charges)
    pages/home.ts, about.ts← page content = ordered list of sections
  data/mock/               ← mock catalogue, categories, reviews, policies (DEV ONLY)
  lib/
    repositories/          ← data access layer (the only place pages read data from)
    services/orders.ts     ← client-side order/promo/tracking service (mock adapter)
    validation/schemas.ts  ← Zod schemas (checkout, contact, track, newsletter)
    listing-params.ts      ← URL ⇄ filter/sort state
  stores/                  ← Zustand: cart, wishlist, hydration flag
  types/                   ← domain models (Product, Category, CartLine, Order…)
  fonts/                   ← self-hosted woff2
```

## Data flow
```
page.tsx (Server Component)
   └─ lib/repositories/*  ──(phase 1)──► data/mock/*
                          ──(phase 2)──► Laravel REST API
   └─ components (typed props only — never raw API payloads)
client interactions ─► stores/* (cart, wishlist) / services/* (orders)
```
UI components never import from `data/mock`. Swapping to the API only changes repository/service bodies.

## Section system (CMS-ready)
- A page = `PageContent { sections: Section[] }` (typed, JSON-serialisable) — `src/components/sections/types.ts`.
- `SectionRenderer` maps each `section.type` to a component via `sectionRegistry`.
- The homepage and About page are 100 % content-driven; reorder/duplicate/remove entries in
  `src/content/pages/*.ts`. A future admin page builder only needs to save the same JSON.

## Rendering & performance
- **Cache Components / Partial Prerendering** (`cacheComponents: true`): repositories use `"use cache"` +
  `cacheLife("hours")` + `cacheTag(...)`. Pages are prerendered static shells served from the CDN; product,
  category and policy pages are pre-generated via `generateStaticParams`.
- Request-specific parts (shop/search/category filters reading `searchParams`) stream inside `<Suspense>`.
- Phase 2 cache invalidation: when the admin edits data, Laravel calls a Next.js route handler that runs
  `revalidateTag("products")` / `revalidateTag("product:<slug>")` → only affected pages refresh.
- Server Components by default; client JS only for cart/wishlist buttons, drawers, forms, tabs, carousels.
- `next/image` with explicit sizes, AVIF/WebP, priority on LCP (hero, product image); below-the-fold
  sections stream with skeleton fallbacks.
- Fonts self-hosted (no Google request), Bangla font not preloaded (loads only when needed).
- No carousel/animation library — CSS scroll-snap + Tailwind transitions; `prefers-reduced-motion` respected.

## State
- `useCart` / `useWishlist` (Zustand + persist, `skipHydration`). `<StoreHydrator/>` rehydrates after mount and
  sets `useHydrated()` so cart/checkout/wishlist show skeletons instead of a false "empty" state.

## Responsive
Mobile-first Tailwind. Breakpoints: `xs 400`, `sm 640`, `md 768`, `lg 1024`, `xl 1280`. Container max 1280px.
Verified with no horizontal overflow at 1440 / 1280 / 768 / 390 / 360 on all routes.
- < lg: sticky mobile header (menu · logo · cart), search row, scrollable category chips, menu drawer (Figma
  "Mobile Menu Drawer"), filters in a drawer, collections/reviews become swipe carousels, 2-column product grid.

## Accessibility & SEO
Semantic landmarks, skip link, labelled controls, `aria-live` totals, focus-visible rings, keyboard-reachable
dropdowns/tabs/drawers (Radix). Metadata per page, canonical URLs, OG images, sitemap, robots, Product JSON-LD.
