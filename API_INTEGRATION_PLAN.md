# API Integration Plan — Laravel + MySQL (Phase 2)

Goal: replace mock data with the Laravel REST API **without changing UI components**.
Only `src/lib/repositories/*` and `src/lib/services/*` change.

## 1. API client
Create `src/lib/api.ts`:
```ts
const BASE = process.env.API_URL!; // e.g. https://api.potatofirst.com/api/v1
export async function apiGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const url = new URL(BASE + path);
  Object.entries(params ?? {}).forEach(([k, v]) => v != null && url.searchParams.set(k, Array.isArray(v) ? v.join(",") : String(v)));
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`API ${res.status} ${path}`);
  return (await res.json()).data as T;
}
```
Keep `"use cache"` + `cacheTag()` in repositories; Laravel triggers revalidation (section 4).

## 2. Endpoints (Laravel API Resources must match `src/types`)
| Repository / service fn | Method & path | Notes |
|---|---|---|
| `getProducts(query)` | `GET /products?categories=&sub=&tag=&pack=&min=&max=&stock=&q=&sort=&limit=` | Return `Product[]` (+ pagination meta later) |
| `getProductBySlug(slug)` | `GET /products/{slug}` | 404 → `null` |
| `getAllProductSlugs()` | `GET /products/slugs` | for `generateStaticParams` |
| `getRelatedProducts(p)` | `GET /products/{slug}/related?limit=4` | |
| `getProductReviews(id)` | `GET /products/{id}/reviews` | approved only |
| `getCategories()` / `getCategoryBySlug()` | `GET /categories`, `GET /categories/{slug}` | include `subCategories`, `banner` |
| `getCategoryCounts()` | `GET /categories/counts` | or include `productCount` in categories |
| `getPage(slug)` | `GET /pages/{slug}` | returns `PageContent` JSON (sections) — future page builder |
| `getReelReviews()` | `GET /reviews/featured` | UGC with image/video URL |
| `getPolicies()` / `getPolicy()` / `getFaqs()` | `GET /policies`, `/policies/{slug}`, `/faqs` | |
| `site` settings | `GET /settings` | hotline, WhatsApp, delivery charges, announcement, socials |
| `placeOrder()` | `POST /orders` | body: customer, deliveryArea, paymentMethod, note, items[{variantId, qty}], couponCode → returns `Order` |
| `getLastOrder()` | `GET /orders/{id}?phone=` | confirmation page |
| `trackOrder()` | `GET /orders/track?orderId=&phone=` | timeline steps |
| `validatePromo()` | `POST /coupons/validate` | `{ ok, discount, message }` |
| Newsletter / Contact | `POST /newsletter`, `POST /contact` | currently simulated in the forms |

**Server must recalculate prices, delivery charge, discount and total** — never trust cart prices from the client.

## 3. Suggested MySQL tables
`categories`, `sub_categories`, `products`, `product_variants` (pack size, price, compare_at_price, sku, stock),
`product_images`, `reviews`, `pages` (slug, title, `sections` JSON), `settings`, `delivery_zones`,
`orders`, `order_items`, `order_status_history`, `coupons`, `customers` (optional login), `newsletter_subscribers`,
`contact_messages`.

## 4. Cache revalidation webhook
Add `src/app/api/revalidate/route.ts` (POST, secret header). Laravel model observers call it after admin saves:
`revalidateTag("products")`, `revalidateTag("product:<slug>")`, `revalidateTag("categories")`, `revalidateTag("page:home")`.

## 5. Payments
- COD: order `pending_confirmation`.
- bKash / SSLCommerz: `POST /orders` returns `paymentUrl` → redirect; gateway callback updates Laravel → redirect
  to `/order-confirmed?id=`.

## 6. Images
Serve admin-uploaded images from Laravel storage/S3/Cloudinary; add the host to `images.remotePatterns` in
`next.config.ts`. `ImageAsset` must include width/height.

## 7. Auth (optional customer accounts)
Laravel Sanctum (token or cookie). `/account` currently a placeholder; checkout stays guest-first.

## Swap checklist
1. Add `API_URL` env. 2. Implement `lib/api.ts`. 3. Replace repository bodies one by one (keep signatures).
4. Replace `services/orders.ts` mock adapter with fetch calls. 5. Move `content/site.ts` values to `GET /settings`.
6. Delete `src/data/mock`. 7. `npm run build` — TypeScript will flag any shape mismatch.
