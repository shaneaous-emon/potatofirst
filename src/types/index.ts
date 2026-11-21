/* ------------------------------------------------------------------
 * Domain models. These mirror the planned Laravel REST API resources
 * (see API_INTEGRATION_PLAN.md). Keep UI components typed against
 * these — never against raw API payloads.
 * ----------------------------------------------------------------- */

export type ImageAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type BadgeTone = "orange" | "green" | "brown" | "red";

export type ProductBadge = { text: string; tone: BadgeTone };

export type ProductTag = "bestseller" | "new" | "popular" | "offer";

export type ProductVariant = {
  id: string;
  /** Pack size shown to customers, e.g. "250 g" */
  label: string;
  /** Price in BDT (integer) */
  price: number;
  /** Original price for strike-through, if discounted */
  compareAtPrice?: number;
  sku: string;
  inStock: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  /** Short flavour / descriptor shown on cards, e.g. "Classic salted" */
  subtitle: string;
  categorySlug: string;
  categoryName: string;
  subCategory?: string;
  shortDescription: string;
  shortDescriptionBn?: string;
  /** Sanitised HTML from the admin rich-text editor */
  descriptionHtml?: string;
  description: string[];
  highlights: string[];
  facts: { label: string; value: string }[];
  images: ImageAsset[];
  variants: ProductVariant[];
  badge?: ProductBadge;
  tags: ProductTag[];
  rating: { average: number; count: number };
  /** Lower = shown earlier in "Most popular" sort */
  popularity: number;
  createdAt: string;
};

export type Category = {
  slug: string;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn?: string;
  image: ImageAsset;
  banner: ImageAsset;
  subCategories: { slug: string; label: string }[];
};

export type Review = {
  id: string;
  productId: string;
  author: string;
  location?: string;
  rating: number;
  body: string;
  date: string;
  image?: ImageAsset;
  videoUrl?: string;
};

export type CartLine = {
  /** `${productId}:${variantId}` */
  key: string;
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  variantLabel: string;
  image: ImageAsset;
  price: number;
  quantity: number;
};

export type DeliveryArea = "inside-dhaka" | "outside-dhaka";
export type PaymentMethod = "cod" | "bkash" | "online";

export type OrderStatus = "placed" | "confirmed" | "packed" | "shipped" | "delivered";

export type Order = {
  id: string;
  createdAt: string;
  customer: { name: string; phone: string; email?: string; address: string };
  deliveryArea: DeliveryArea;
  paymentMethod: PaymentMethod;
  note?: string;
  lines: CartLine[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  status: OrderStatus;
};

export type ProductSort = "popular" | "newest" | "price-asc" | "price-desc";

export type ProductQuery = {
  category?: string;
  categories?: string[];
  packSizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  subCategory?: string;
  tag?: ProductTag;
  search?: string;
  sort?: ProductSort;
  limit?: number;
  slugs?: string[];
};
