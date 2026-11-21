# Potato First — E-commerce Frontend

Customer-facing storefront for **Potato First** (Good Food. First Choice.), built from the approved Figma design
([Figma file](https://www.figma.com/design/M802jAuJDRmnyuKzZIz7Ew)).

> Phase 1 = frontend only, running on **mock data**. The backend (Laravel + MySQL) and admin panel come later —
> see `API_INTEGRATION_PLAN.md`.

## Tech stack
| | |
|---|---|
| Framework | Next.js 16 (App Router, React Server Components, Cache Components / PPR) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 — tokens mirror the Figma variables (`src/app/globals.css`) |
| UI primitives | shadcn/ui pattern on Radix (`src/components/ui`) + Lucide icons |
| State | Zustand (cart + wishlist, persisted to localStorage) |
| Forms | React Hook Form + Zod |
| Notifications | Sonner |
| Fonts | Self-hosted via `next/font/local`: Poppins (headings), Inter (body), Hind Siliguri (Bangla) |

## Getting started (Windows / macOS / Linux)
Requires **Node.js 20.9+** (22 LTS recommended).

```bash
cd C:\projects\potatofirst
npm install
npm run dev        # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (type-checks too) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type-check only |

Optional `.env.local`:
```
NEXT_PUBLIC_SITE_URL=https://www.potatofirst.com
```

## Pages
| Route | Page |
|---|---|
| `/` | Homepage (section-driven, `src/content/pages/home.ts`) |
| `/shop` | All products — filters, sort, pagination (state in URL) |
| `/category/[slug]` | Category pages: potato-snacks, date-snacks, peanut-snacks, snack-combos |
| `/product/[slug]` | Product details — gallery, pack sizes, qty, Add to Cart / Order Now / WhatsApp, tabs, related |
| `/cart` | Cart + order summary + promo code |
| `/checkout` | One-page guest checkout (COD default, bKash, Online) |
| `/order-confirmed` | Thank-you page |
| `/track-order` | Order tracking (demo timeline) |
| `/search?q=` | Search results |
| `/wishlist` | Saved products |
| `/about`, `/contact` | Info pages |
| `/policies/[slug]` | privacy, terms, returns, delivery, faq |
| `/account` | Placeholder (accounts optional, phase 2) |

Global: header (desktop + mobile), mega-dropdowns, mobile menu drawer, cart drawer, toasts, 404, error page,
`sitemap.xml`, `robots.txt`, Product JSON-LD.

## Placeholders to replace before launch
Prices, delivery charges (৳70 / ৳130), hotline `01XXX-XXXXXX`, WhatsApp number, email, address, social links,
review names/quotes, policy text, promo codes. Most live in `src/content/site.ts` and `src/data/mock/*`.
The footer credit link (`site.credit.href`) needs the real Facebook profile URL.

## Docs
- `PROJECT_ARCHITECTURE.md` — folders, data flow, rendering & caching
- `COMPONENT_GUIDE.md` — components, sections, how to add/reuse a section
- `API_INTEGRATION_PLAN.md` — Laravel REST endpoints and how to swap mock → API
