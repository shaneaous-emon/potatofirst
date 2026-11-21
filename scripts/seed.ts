/**
 * Seed the database with roles, the first Super Admin, catalogue, zones,
 * content and demo orders.  Run:  npm run db:seed
 * Env: DATABASE_URL, ADMIN_EMAIL (default admin@potatofirst.com), ADMIN_PASSWORD (default ChangeMe!123)
 */
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as t from "../src/db/schema";
import { DEFAULT_ROLES } from "../src/lib/admin/permissions";
import { categories as mockCats } from "../src/data/mock/categories";
import { products as mockProducts } from "../src/data/mock/products";
import { reelReviews } from "../src/data/mock/reviews";
import { faqs as mockFaqs, policies } from "../src/data/mock/policies";
import { homePage } from "../src/content/pages/home";
import { IMG } from "../src/data/mock/images";
import { SETTINGS_DEFAULTS } from "../src/lib/settings/defaults";

async function main() {
  const pool = mysql.createPool({ uri: process.env.DATABASE_URL!, timezone: "Z", ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: true } : undefined });
  const db = drizzle(pool, { schema: t, mode: "default" });
  const demo = process.argv.includes("--demo");

  const existing = await db.select().from(t.roles).limit(1);
  if (existing.length) {
    console.log("Database already seeded — skipping.");
    await pool.end();
    return;
  }

  // roles + super admin
  for (const r of DEFAULT_ROLES) await db.insert(t.roles).values(r);
  const [superRole] = await db.select().from(t.roles).limit(1);
  const email = process.env.ADMIN_EMAIL ?? "admin@potatofirst.com";
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe!123";
  await db.insert(t.adminUsers).values({ name: "Super Admin", email, passwordHash: await bcrypt.hash(password, 10), roleId: superRole.id });

  // categories
  const catId: Record<string, number> = {};
  for (const [i, c] of mockCats.entries()) {
    const [r] = await db.insert(t.categories).values({
      slug: c.slug,
      name: c.name,
      nameBn: c.nameBn,
      description: c.description,
      descriptionBn: c.descriptionBn,
      image: c.image.src,
      banner: c.banner.src,
      subCategories: c.subCategories ?? [],
      sort: i,
      featured: true,
    });
    catId[c.slug] = r.insertId;
  }

  // products, images, variants (+ opening stock with a batch)
  const variantIds: { id: number; price: number; label: string; sku: string; productId: number; name: string; image: string }[] = [];
  for (const p of mockProducts) {
    const [r] = await db.insert(t.products).values({
      slug: p.slug,
      name: p.name,
      subtitle: p.subtitle,
      shortDescription: p.shortDescription,
      shortDescriptionBn: p.shortDescriptionBn,
      descriptionHtml: p.descriptionHtml,
      categoryId: catId[p.categorySlug],
      subCategory: p.subCategory,
      status: "published",
      badgeText: p.badge?.text,
      badgeTone: p.badge?.tone as "orange" | "green" | "red" | "brown" | undefined,
      tags: p.tags,
      popularity: p.popularity,
      ratingAvg: Math.round(p.rating.average * 10),
      ratingCount: p.rating.count,
      createdAt: new Date(p.createdAt),
    });
    const pid = r.insertId;
    for (const [i, im] of p.images.entries()) await db.insert(t.productImages).values({ productId: pid, src: im.src, alt: im.alt, width: im.width, height: im.height, sort: i });
    for (const [i, v] of p.variants.entries()) {
      const stock = 40 + ((pid * 7 + i * 13) % 60);
      const [vr] = await db.insert(t.productVariants).values({ productId: pid, label: v.label, sku: v.sku, price: v.price, compareAtPrice: v.compareAtPrice, costPrice: Math.round(v.price * 0.62), stockOnHand: stock, sort: i });
      const exp = new Date(Date.now() + (20 + ((pid + i) % 9) * 25) * 86400000);
      const [br] = await db.insert(t.inventoryBatches).values({ variantId: vr.insertId, batchNo: `B-${2611}-${pid}${i}`, supplier: "Opening stock", receivedQty: stock, remainingQty: stock, unitCost: Math.round(v.price * 0.62), manufacturedAt: new Date(Date.now() - 20 * 86400000), expiresAt: exp });
      await db.insert(t.stockMovements).values({ variantId: vr.insertId, batchId: br.insertId, type: "in", qty: stock, before: 0, after: stock, reason: "Opening stock" });
      variantIds.push({ id: vr.insertId, price: v.price, label: v.label, sku: v.sku, productId: pid, name: p.name, image: p.images[0].src });
    }
  }

  // shipping zones
  await db.insert(t.shippingZones).values([
    { slug: "inside-dhaka", name: "Inside Dhaka", nameBn: "ঢাকার ভিতরে", charge: 70, eta: "1–2 days", sort: 0 },
    { slug: "outside-dhaka", name: "Outside Dhaka", nameBn: "ঢাকার বাইরে", charge: 130, eta: "2–4 days", sort: 1 },
  ]);

  // content
  await db.insert(t.banners).values([
    { placement: "hero_main", image: IMG.heroMain.src, alt: IMG.heroMain.alt, href: "/shop", sort: 0 },
    { placement: "hero_main", image: IMG.promoCombo.src, alt: IMG.promoCombo.alt, href: "/category/snack-combos", sort: 1 },
    { placement: "hero_main", image: IMG.brandScene.src, alt: IMG.brandScene.alt, href: "/shop", sort: 2 },
    { placement: "hero_side", image: IMG.heroSide.src, alt: IMG.heroSide.alt, href: "/track-order", sort: 0 },
  ]);
  for (const [i, f] of mockFaqs.entries()) await db.insert(t.faqs).values({ question: f.q, answer: f.a, sort: i });
  for (const p of policies) {
    const html = [`<p>${p.intro}</p>`, ...p.sections.map((s) => `<h3>${s.heading}</h3><p>${s.body}</p>`)].join("\n");
    await db.insert(t.pages).values({ slug: p.slug, title: p.title, bodyHtml: html });
  }
  for (const [k, v] of Object.entries(SETTINGS_DEFAULTS)) await db.insert(t.settings).values({ key: k, value: v });
  await db.insert(t.settings).values({ key: "home", value: homePage });
  await db.insert(t.coupons).values([
    { code: "WELCOME10", type: "percent", value: 10, minOrder: 300, maxDiscount: 100, firstOrderOnly: true },
    { code: "FREEDEL", type: "free_delivery", value: 0, minOrder: 800 },
  ]);
  const productByLegacy: Record<string, number> = {};
  for (const p of mockProducts) {
    const v = variantIds.find((x) => x.name === p.name);
    if (v) productByLegacy[p.id] = v.productId;
  }
  for (const r of reelReviews)
    await db.insert(t.reviews).values({ productId: productByLegacy[r.productId], name: "Customer", rating: r.rating, body: r.body.replace(/[“”]/g, ""), media: r.image ? [r.image.src] : [], status: "approved", featured: true });

  // demo orders (dashboard / reports preview)
  if (demo) {
    const names = ["Rahim Uddin", "Nusrat Jahan", "Tanvir Ahmed", "Farhana Akter", "Sakib Hasan", "Mithila Rahman", "Arif Hossain", "Sumaiya Islam"];
    const statuses: t.OrderStatusKey[] = ["delivered", "delivered", "delivered", "shipped", "confirmed", "pending", "pending", "cancelled", "returned", "packed"];
    for (let n = 0; n < 48; n++) {
      const daysAgo = Math.floor((n * 29) / 48);
      const created = new Date(Date.now() - daysAgo * 86400000 - (n % 9) * 3600000);
      const items = [variantIds[(n * 5) % variantIds.length], ...(n % 3 === 0 ? [variantIds[(n * 11 + 3) % variantIds.length]] : [])];
      const qty = (i: number) => 1 + ((n + i) % 3);
      const subtotal = items.reduce((s, v, i) => s + v.price * qty(i), 0);
      const inside = n % 3 !== 0;
      const charge = inside ? 70 : 130;
      const status = statuses[n % statuses.length];
      const phone = `017${String(10000000 + ((n * 7919) % 8999999)).padStart(8, "0")}`;
      const [o] = await db.insert(t.orders).values({
        number: `PF-${240100 + n}`,
        name: names[n % names.length],
        phone,
        address: `House ${n + 3}, Road ${(n % 12) + 1}, ${inside ? "Dhanmondi, Dhaka" : "Agrabad, Chattogram"}`,
        zoneLabel: inside ? "Inside Dhaka" : "Outside Dhaka",
        paymentMethod: n % 5 === 0 ? "bkash" : "cod",
        paymentStatus: status === "delivered" ? "paid" : "pending",
        status,
        subtotal,
        deliveryCharge: charge,
        total: subtotal + charge,
        riskReasons: [],
        courier: ["shipped", "delivered", "returned"].includes(status) ? ["steadfast", "pathao", "redx"][n % 3] : null,
        trackingId: ["shipped", "delivered", "returned"].includes(status) ? `TRK${880000 + n}` : null,
        createdAt: created,
        updatedAt: created,
      });
      for (const [i, v] of items.entries())
        await db.insert(t.orderItems).values({ orderId: o.insertId, productId: v.productId, variantId: v.id, name: v.name, variantLabel: v.label, sku: v.sku, image: v.image, unitPrice: v.price, costPrice: Math.round(v.price * 0.62), quantity: qty(i) });
      await db.insert(t.orderHistory).values({ orderId: o.insertId, toStatus: "pending", note: "Order placed on website", createdAt: created });
      if (status !== "pending") await db.insert(t.orderHistory).values({ orderId: o.insertId, fromStatus: "pending", toStatus: status, createdAt: new Date(created.getTime() + 3600000) });
    }
  }

  console.log(`Seeded. Admin login: ${email} / ${password}`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
