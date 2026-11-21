# Potato First — Project Context & Guidelines (CLAUDE.md)

Customer-facing storefront for **Potato First** (Good Food. First Choice.), built from Figma specifications.

## Technology Stack
- **Framework:** Next.js 16 (App Router, React Server Components, PPR / Cache Components)
- **Library / Runtime:** React 19, Node.js >= 20.9 (22 LTS recommended)
- **Language:** TypeScript (strict mode enabled)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/turbopack`), custom design tokens in `src/app/globals.css`
- **UI Components:** Radix UI primitives, shadcn-style architecture, Lucide React icons
- **State Management:** Zustand (cart & wishlist stores with localStorage persistence and hydration handling)
- **Forms & Validation:** React Hook Form, Zod
- **Database & ORM:** Drizzle ORM (`drizzle-orm`, `drizzle-kit`, `mysql2`)
- **Notifications:** Sonner toasts
- **Fonts:** Self-hosted local fonts (`next/font/local`): Poppins (headings), Inter (body), Hind Siliguri (Bangla)

---

## Common Development Commands
```bash
npm run dev          # Start local development server (http://localhost:3000)
npm run build        # Build for production (includes type checking)
npm start            # Run production build
npm run lint         # Run ESLint (Next.js & ESLint 9 flat config)
npm run typecheck    # Run TypeScript compiler check (tsc --noEmit)
npm run db:push      # Push Drizzle schema migrations to database
npm run db:seed      # Seed database using scripts/seed.ts
```

---

## Directory & Architecture Overview
```
├── public/                 # Static assets, exported webp images, logos
├── scripts/                # Database seed scripts (scripts/seed.ts)
├── src/
│   ├── app/                # Next.js App Router pages & API route handlers
│   │   ├── (storefront)/   # Customer routes (/, /shop, /product/[slug], /category/[slug], etc.)
│   │   ├── account/        # Customer account dashboard & auth
│   │   ├── api/            # API endpoints & webhook handlers
│   │   ├── globals.css     # Global styles & Tailwind v4 CSS variables
│   │   └── layout.tsx      # Root layout & font declarations
│   ├── components/
│   │   ├── ui/             # Reusable primitives (Button, Input, Sheet, Tabs, Accordion, etc.)
│   │   ├── common/         # Global widgets (Logo, Stars, Carousel, SectionHeader, etc.)
│   │   ├── layout/         # SiteHeader, CategoryNav, MobileMenu, SiteFooter, CartDrawer
│   │   ├── product/        # ProductCard, ProductGrid, Gallery, PurchasePanel, ProductTabs
│   │   ├── cart/           # CartView, CartLineItem, PromoCode
│   │   ├── checkout/       # CheckoutForm, OrderConfirmation
│   │   ├── shop/           # ProductListing, FilterPanel, SortSelect
│   │   └── sections/       # CMS-style modular section registry & renderer
│   ├── content/
│   │   ├── site.ts         # Global metadata, contact info, navigation, delivery charges
│   │   └── pages/          # Section-based page configurations (home.ts, about.ts)
│   ├── data/mock/          # Mock catalogue, categories, reviews, and policies (Phase 1)
│   ├── db/                 # Drizzle schema definitions & client initialization
│   ├── lib/
│   │   ├── repositories/   # Data abstraction layer (decouples UI from mock vs live API)
│   │   ├── services/       # Business logic (order processing, tracking, promo verification)
│   │   └── validation/     # Zod validation schemas
│   ├── stores/             # Zustand stores (cart-store.ts, wishlist-store.ts)
│   └── types/              # TypeScript domain types & interfaces
```

---

## Core Conventions & Rules
1. **Next.js 16 Standards:**
   - Pages are Server Components by default. Keep them thin: fetch data via repositories, pass typed props to components.
   - Use `"use client"` only when interactive browser state (forms, drawers, tabs, Zustand stores) is needed.
   - Do NOT import directly from `data/mock` inside UI components. Always use `src/lib/repositories/*` so swapping to live API/DB requires zero component changes.
2. **Design & Styling:**
   - Mobile-first approach using Tailwind breakpoints (`xs: 400`, `sm: 640`, `md: 768`, `lg: 1024`, `xl: 1280`).
   - Use semantic color tokens defined in `globals.css` (primary, secondary, accent, muted, destructive, etc.).
3. **State & Hydration:**
   - Store state in `useCart` / `useWishlist` (Zustand with `skipHydration: true`).
   - Use `<StoreHydrator />` and `useHydrated()` to prevent SSR mismatch errors.
4. **Localization & Currency:**
   - Bangladeshi Taka (`৳`) formatting throughout the storefront.
   - Self-hosted Bangla font (Hind Siliguri) loaded dynamically for Bengali text.

---

## Deployment & Hosting
- **Server:** LiteSpeed Web Server / cPanel (`136.243.82.43`)
- **Domain:** `https://potatofirst.premiumexportshoes.com/`
- **GitHub Repository:** `https://github.com/shaneaous-emon/potatofirst.git`
