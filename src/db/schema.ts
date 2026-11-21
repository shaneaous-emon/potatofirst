/**
 * Potato First — MySQL 8 schema (Drizzle ORM).
 * Money is stored in whole BDT (int). Times are UTC; UI shows Asia/Dhaka.
 */
import { relations } from "drizzle-orm";
import {
  boolean,
  datetime,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  serial,
  text,
  timestamp,
  varchar,
  bigint,
} from "drizzle-orm/mysql-core";

const id = () => serial("id").primaryKey();
const fk = (name: string) => bigint(name, { mode: "number", unsigned: true });
const created = () => timestamp("created_at").notNull().defaultNow();
const updated = () => timestamp("updated_at").notNull().defaultNow().onUpdateNow();

/* ───────────── Identity ───────────── */

export const roles = mysqlTable("roles", {
  id: id(),
  slug: varchar("slug", { length: 40 }).notNull().unique(),
  name: varchar("name", { length: 80 }).notNull(),
  /** permission keys, e.g. ["orders.view","orders.edit"]; ["*"] = everything */
  permissions: json("permissions").$type<string[]>().notNull(),
  createdAt: created(),
});

export const adminUsers = mysqlTable("admin_users", {
  id: id(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 190 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 100 }).notNull(),
  roleId: fk("role_id").notNull(),
  active: boolean("active").notNull().default(true),
  failedLogins: int("failed_logins").notNull().default(0),
  lockedUntil: datetime("locked_until"),
  lastLoginAt: datetime("last_login_at"),
  lastLoginIp: varchar("last_login_ip", { length: 64 }),
  createdAt: created(),
});

export const activityLogs = mysqlTable(
  "activity_logs",
  {
    id: id(),
    adminId: fk("admin_id"),
    action: varchar("action", { length: 60 }).notNull(),
    entity: varchar("entity", { length: 40 }).notNull(),
    entityId: varchar("entity_id", { length: 40 }),
    summary: varchar("summary", { length: 500 }).notNull(),
    ip: varchar("ip", { length: 64 }),
    createdAt: created(),
  },
  (t) => [index("activity_entity_idx").on(t.entity, t.entityId), index("activity_created_idx").on(t.createdAt)],
);

/* ───────────── Catalog ───────────── */

export const categories = mysqlTable("categories", {
  id: id(),
  parentId: fk("parent_id"),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  nameBn: varchar("name_bn", { length: 160 }),
  description: text("description"),
  descriptionBn: text("description_bn"),
  image: varchar("image", { length: 500 }),
  banner: varchar("banner", { length: 500 }),
  /** sub-category chips: [{slug,label}] */
  subCategories: json("sub_categories").$type<{ slug: string; label: string }[]>().notNull(),
  sort: int("sort").notNull().default(0),
  active: boolean("active").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  seoTitle: varchar("seo_title", { length: 190 }),
  seoDescription: varchar("seo_description", { length: 320 }),
  createdAt: created(),
  updatedAt: updated(),
});

export const products = mysqlTable(
  "products",
  {
    id: id(),
    slug: varchar("slug", { length: 160 }).notNull().unique(),
    name: varchar("name", { length: 160 }).notNull(),
    nameBn: varchar("name_bn", { length: 200 }),
    subtitle: varchar("subtitle", { length: 160 }).notNull().default(""),
    shortDescription: varchar("short_description", { length: 500 }).notNull().default(""),
    shortDescriptionBn: varchar("short_description_bn", { length: 700 }),
    descriptionHtml: text("description_html"),
    categoryId: fk("category_id").notNull(),
    subCategory: varchar("sub_category", { length: 80 }),
    status: mysqlEnum("status", ["draft", "published", "archived"]).notNull().default("draft"),
    badgeText: varchar("badge_text", { length: 40 }),
    badgeTone: mysqlEnum("badge_tone", ["orange", "green", "red", "brown"]),
    tags: json("tags").$type<string[]>().notNull(),
    popularity: int("popularity").notNull().default(100),
    ratingAvg: int("rating_avg_x10").notNull().default(0),
    ratingCount: int("rating_count").notNull().default(0),
    seoTitle: varchar("seo_title", { length: 190 }),
    seoDescription: varchar("seo_description", { length: 320 }),
    createdAt: created(),
    updatedAt: updated(),
  },
  (t) => [index("products_category_idx").on(t.categoryId), index("products_status_idx").on(t.status)],
);

export const productImages = mysqlTable("product_images", {
  id: id(),
  productId: fk("product_id").notNull(),
  src: varchar("src", { length: 500 }).notNull(),
  alt: varchar("alt", { length: 255 }).notNull().default(""),
  width: int("width").notNull().default(1200),
  height: int("height").notNull().default(1200),
  sort: int("sort").notNull().default(0),
});

export const productVariants = mysqlTable(
  "product_variants",
  {
    id: id(),
    productId: fk("product_id").notNull(),
    label: varchar("label", { length: 60 }).notNull(),
    sku: varchar("sku", { length: 80 }).notNull().unique(),
    price: int("price").notNull(),
    compareAtPrice: int("compare_at_price"),
    costPrice: int("cost_price"),
    weightG: int("weight_g"),
    stockOnHand: int("stock_on_hand").notNull().default(0),
    lowStockThreshold: int("low_stock_threshold").notNull().default(10),
    active: boolean("active").notNull().default(true),
    sort: int("sort").notNull().default(0),
  },
  (t) => [index("variants_product_idx").on(t.productId)],
);

/* ───────────── Inventory ───────────── */

export const inventoryBatches = mysqlTable(
  "inventory_batches",
  {
    id: id(),
    variantId: fk("variant_id").notNull(),
    batchNo: varchar("batch_no", { length: 60 }).notNull(),
    supplier: varchar("supplier", { length: 160 }),
    receivedQty: int("received_qty").notNull(),
    remainingQty: int("remaining_qty").notNull(),
    unitCost: int("unit_cost"),
    manufacturedAt: datetime("manufactured_at"),
    expiresAt: datetime("expires_at"),
    createdAt: created(),
  },
  (t) => [index("batches_variant_idx").on(t.variantId), index("batches_expiry_idx").on(t.expiresAt)],
);

export const stockMovements = mysqlTable(
  "stock_movements",
  {
    id: id(),
    variantId: fk("variant_id").notNull(),
    batchId: fk("batch_id"),
    type: mysqlEnum("type", ["in", "adjust", "damage", "wastage", "return", "sale", "cancel"]).notNull(),
    qty: int("qty").notNull(),
    before: int("before").notNull(),
    after: int("after").notNull(),
    reason: varchar("reason", { length: 255 }),
    reference: varchar("reference", { length: 80 }),
    adminId: fk("admin_id"),
    createdAt: created(),
  },
  (t) => [index("movements_variant_idx").on(t.variantId), index("movements_created_idx").on(t.createdAt)],
);

/* ───────────── Customers & orders ───────────── */

export const customers = mysqlTable("customers", {
  id: id(),
  name: varchar("name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 20 }).unique(),
  email: varchar("email", { length: 190 }).unique(),
  passwordHash: varchar("password_hash", { length: 100 }),
  provider: mysqlEnum("provider", ["guest", "password", "google", "facebook"]).notNull().default("guest"),
  address: varchar("address", { length: 500 }),
  group: mysqlEnum("group", ["new", "returning", "vip", "inactive", "risk"]).notNull().default("new"),
  blocked: boolean("blocked").notNull().default(false),
  blockReason: varchar("block_reason", { length: 255 }),
  notes: text("notes"),
  createdAt: created(),
});

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
  "refunded",
  "failed",
] as const;
export type OrderStatusKey = (typeof ORDER_STATUSES)[number];

export const orders = mysqlTable(
  "orders",
  {
    id: id(),
    number: varchar("number", { length: 20 }).notNull().unique(),
    customerId: fk("customer_id"),
    name: varchar("name", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    email: varchar("email", { length: 190 }),
    address: varchar("address", { length: 500 }).notNull(),
    zoneId: fk("zone_id"),
    zoneLabel: varchar("zone_label", { length: 80 }).notNull(),
    paymentMethod: mysqlEnum("payment_method", ["cod", "bkash", "online"]).notNull(),
    paymentStatus: mysqlEnum("payment_status", ["pending", "paid", "failed", "refunded", "partially_refunded"]).notNull().default("pending"),
    bkashTrxId: varchar("bkash_trx_id", { length: 40 }),
    status: mysqlEnum("status", ORDER_STATUSES).notNull().default("pending"),
    subtotal: int("subtotal").notNull(),
    deliveryCharge: int("delivery_charge").notNull(),
    discount: int("discount").notNull().default(0),
    total: int("total").notNull(),
    couponCode: varchar("coupon_code", { length: 40 }),
    note: varchar("note", { length: 500 }),
    internalNote: text("internal_note"),
    source: varchar("source", { length: 40 }).notNull().default("website"),
    ip: varchar("ip", { length: 64 }),
    userAgent: varchar("user_agent", { length: 300 }),
    riskScore: int("risk_score").notNull().default(0),
    riskLevel: mysqlEnum("risk_level", ["low", "medium", "high"]).notNull().default("low"),
    riskReasons: json("risk_reasons").$type<string[]>().notNull(),
    fraudDecision: mysqlEnum("fraud_decision", ["none", "accepted", "hold", "rejected"]).notNull().default("none"),
    courier: varchar("courier", { length: 30 }),
    trackingId: varchar("tracking_id", { length: 80 }),
    assignedAdminId: fk("assigned_admin_id"),
    cancelReason: varchar("cancel_reason", { length: 255 }),
    createdAt: created(),
    updatedAt: updated(),
  },
  (t) => [
    index("orders_phone_idx").on(t.phone),
    index("orders_status_idx").on(t.status),
    index("orders_created_idx").on(t.createdAt),
    index("orders_ip_idx").on(t.ip),
  ],
);

export const orderItems = mysqlTable(
  "order_items",
  {
    id: id(),
    orderId: fk("order_id").notNull(),
    productId: fk("product_id"),
    variantId: fk("variant_id"),
    name: varchar("name", { length: 160 }).notNull(),
    variantLabel: varchar("variant_label", { length: 60 }).notNull(),
    sku: varchar("sku", { length: 80 }),
    image: varchar("image", { length: 500 }),
    unitPrice: int("unit_price").notNull(),
    costPrice: int("cost_price"),
    quantity: int("quantity").notNull(),
  },
  (t) => [index("items_order_idx").on(t.orderId), index("items_variant_idx").on(t.variantId)],
);

export const orderHistory = mysqlTable(
  "order_status_histories",
  {
    id: id(),
    orderId: fk("order_id").notNull(),
    fromStatus: varchar("from_status", { length: 30 }),
    toStatus: varchar("to_status", { length: 30 }).notNull(),
    note: varchar("note", { length: 500 }),
    adminId: fk("admin_id"),
    createdAt: created(),
  },
  (t) => [index("history_order_idx").on(t.orderId)],
);

export const payments = mysqlTable("payment_transactions", {
  id: id(),
  orderId: fk("order_id").notNull(),
  method: varchar("method", { length: 20 }).notNull(),
  kind: mysqlEnum("kind", ["payment", "refund"]).notNull().default("payment"),
  amount: int("amount").notNull(),
  status: mysqlEnum("status", ["pending", "paid", "failed", "refunded"]).notNull(),
  reference: varchar("reference", { length: 80 }),
  note: varchar("note", { length: 255 }),
  adminId: fk("admin_id"),
  createdAt: created(),
});

/* ───────────── Marketing & delivery ───────────── */

export const coupons = mysqlTable("coupons", {
  id: id(),
  code: varchar("code", { length: 40 }).notNull().unique(),
  type: mysqlEnum("type", ["percent", "fixed", "free_delivery"]).notNull(),
  value: int("value").notNull().default(0),
  minOrder: int("min_order").notNull().default(0),
  maxDiscount: int("max_discount"),
  usageLimit: int("usage_limit"),
  perCustomerLimit: int("per_customer_limit"),
  usedCount: int("used_count").notNull().default(0),
  firstOrderOnly: boolean("first_order_only").notNull().default(false),
  startsAt: datetime("starts_at"),
  endsAt: datetime("ends_at"),
  active: boolean("active").notNull().default(true),
  createdAt: created(),
});

export const shippingZones = mysqlTable("shipping_zones", {
  id: id(),
  slug: varchar("slug", { length: 60 }).notNull().unique(),
  name: varchar("name", { length: 80 }).notNull(),
  nameBn: varchar("name_bn", { length: 120 }),
  charge: int("charge").notNull(),
  freeOver: int("free_over"),
  eta: varchar("eta", { length: 40 }).notNull(),
  codAvailable: boolean("cod_available").notNull().default(true),
  active: boolean("active").notNull().default(true),
  sort: int("sort").notNull().default(0),
});

/* ───────────── Content ───────────── */

export const reviews = mysqlTable(
  "reviews",
  {
    id: id(),
    productId: fk("product_id"),
    orderId: fk("order_id"),
    name: varchar("name", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    location: varchar("location", { length: 80 }),
    rating: int("rating").notNull(),
    body: text("body").notNull(),
    media: json("media").$type<string[]>().notNull(),
    status: mysqlEnum("status", ["pending", "approved", "rejected", "hidden"]).notNull().default("pending"),
    verified: boolean("verified").notNull().default(false),
    featured: boolean("featured").notNull().default(false),
    adminReply: text("admin_reply"),
    createdAt: created(),
  },
  (t) => [index("reviews_product_idx").on(t.productId), index("reviews_status_idx").on(t.status)],
);

export const banners = mysqlTable("banners", {
  id: id(),
  placement: mysqlEnum("placement", ["hero_main", "hero_side"]).notNull(),
  image: varchar("image", { length: 500 }).notNull(),
  mobileImage: varchar("mobile_image", { length: 500 }),
  alt: varchar("alt", { length: 255 }).notNull().default(""),
  href: varchar("href", { length: 300 }).notNull().default("/shop"),
  sort: int("sort").notNull().default(0),
  active: boolean("active").notNull().default(true),
  startsAt: datetime("starts_at"),
  endsAt: datetime("ends_at"),
  createdAt: created(),
});

export const pages = mysqlTable("pages", {
  id: id(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  title: varchar("title", { length: 160 }).notNull(),
  bodyHtml: text("body_html").notNull(),
  active: boolean("active").notNull().default(true),
  updatedAt: updated(),
});

export const faqs = mysqlTable("faqs", {
  id: id(),
  question: varchar("question", { length: 300 }).notNull(),
  answer: text("answer").notNull(),
  sort: int("sort").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const contactMessages = mysqlTable("contact_messages", {
  id: id(),
  name: varchar("name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 190 }),
  subject: varchar("subject", { length: 160 }),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "in_progress", "closed"]).notNull().default("new"),
  createdAt: created(),
});

export const subscribers = mysqlTable("newsletter_subscribers", {
  id: id(),
  email: varchar("email", { length: 190 }).notNull().unique(),
  createdAt: created(),
});

/** Key/value JSON settings: store, features, announcement, tracking, couriers, home sections. */
export const settings = mysqlTable("settings", {
  key: varchar("key", { length: 60 }).primaryKey(),
  value: json("value").notNull(),
  updatedAt: updated(),
});

/* ───────────── Relations ───────────── */

export const productRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images: many(productImages),
  variants: many(productVariants),
}));
export const imageRelations = relations(productImages, ({ one }) => ({ product: one(products, { fields: [productImages.productId], references: [products.id] }) }));
export const variantRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
  batches: many(inventoryBatches),
}));
export const batchRelations = relations(inventoryBatches, ({ one }) => ({ variant: one(productVariants, { fields: [inventoryBatches.variantId], references: [productVariants.id] }) }));
export const orderRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  history: many(orderHistory),
  payments: many(payments),
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
}));
export const orderItemRelations = relations(orderItems, ({ one }) => ({ order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }) }));
export const historyRelations = relations(orderHistory, ({ one }) => ({ order: one(orders, { fields: [orderHistory.orderId], references: [orders.id] }) }));
export const paymentRelations = relations(payments, ({ one }) => ({ order: one(orders, { fields: [payments.orderId], references: [orders.id] }) }));
export const adminRelations = relations(adminUsers, ({ one }) => ({ role: one(roles, { fields: [adminUsers.roleId], references: [roles.id] }) }));
export const categoryRelations = relations(categories, ({ many }) => ({ products: many(products) }));
