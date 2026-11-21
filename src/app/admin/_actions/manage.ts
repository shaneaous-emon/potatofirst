"use server";

import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, t } from "@/db";
import { logActivity, requirePermission } from "@/lib/admin/auth";
import * as ops from "@/lib/admin/ops";
import { moveStock } from "@/lib/services/inventory.server";
import type { ActionResult } from "@/components/admin/action-form";

const ok = (path: string, message: string): ActionResult => {
  revalidatePath(path);
  return { ok: true, message };
};
const fail = (e: unknown): ActionResult => ({ ok: false, message: e instanceof Error ? e.message : "Something went wrong" });
const num = (v: FormDataEntryValue | null) => (v == null || v === "" ? null : Number(v));
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);

/* ───────────── Stock ───────────── */

export async function adjustStockAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("inventory.adjust");
    const sku = String(f.get("sku"));
    const mode = String(f.get("mode"));
    const qty = Math.round(Number(f.get("qty")));
    if (!Number.isFinite(qty)) return { ok: false, message: "Enter a quantity" };
    const r = await ops.adjustStock(admin, sku, mode === "set" ? { set: qty } : { delta: mode === "remove" ? -Math.abs(qty) : Math.abs(qty) }, String(f.get("reason") || "") || "Manual adjustment");
    revalidatePath("/admin/products");
    revalidatePath("/admin");
    return ok("/admin/inventory", `${r.product}: ${r.before} → ${r.after}`);
  } catch (e) {
    return fail(e);
  }
}

/* ───────────── Delivery zones ───────────── */

export async function saveZoneAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("shipping.edit");
    const charge = Math.round(Number(f.get("charge")));
    if (!Number.isFinite(charge) || charge < 0) return { ok: false, message: "Enter a valid delivery charge" };
    await ops.setZone(admin, String(f.get("slug")), {
      charge,
      freeOver: num(f.get("freeOver")),
      eta: String(f.get("eta") || "").trim() || "2–4 days",
      codAvailable: f.get("codAvailable") === "on",
      active: f.get("active") === "on",
    });
    revalidatePath("/", "layout");
    return ok("/admin/shipping", "Delivery charge saved");
  } catch (e) {
    return fail(e);
  }
}

export async function createZoneAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("shipping.edit");
    const name = String(f.get("name") || "").trim();
    if (!name) return { ok: false, message: "Zone name is required" };
    const slug = slugify(name);
    const [dup] = await db().select({ id: t.shippingZones.id }).from(t.shippingZones).where(eq(t.shippingZones.slug, slug));
    if (dup) return { ok: false, message: "A zone with this name already exists" };
    await db().insert(t.shippingZones).values({ slug, name, charge: Math.max(0, Math.round(Number(f.get("charge")) || 0)), freeOver: num(f.get("freeOver")), eta: String(f.get("eta") || "").trim() || "2–4 days", sort: 99 });
    await logActivity(admin, "shipping.create", "zone", slug, `Created zone ${name}`);
    revalidatePath("/", "layout");
    return ok("/admin/shipping", `Zone “${name}” added`);
  } catch (e) {
    return fail(e);
  }
}

/* ───────────── Messages ───────────── */

export async function messageStatusAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("content.edit");
    const status = String(f.get("status")) as "new" | "in_progress" | "closed";
    await ops.setMessageStatus(admin, Number(f.get("id")), status);
    return ok("/admin/messages", "Message updated");
  } catch (e) {
    return fail(e);
  }
}

/* ───────────── Block list ───────────── */

export async function blockListAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("customers.edit");
    const r = await ops.editBlockList(admin, String(f.get("kind")) as "phone" | "ip", String(f.get("value") || ""), String(f.get("action")) as "add" | "remove");
    return ok("/admin/blocklist", `${r.value} ${r.action === "add" ? "blocked" : "unblocked"}`);
  } catch (e) {
    return fail(e);
  }
}

/* ───────────── Coupons ───────────── */

export async function couponToggleAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("coupons.edit");
    const r = await ops.setCouponActive(admin, String(f.get("code")), f.get("active") === "true");
    return ok("/admin/coupons", `${r.code} ${r.active ? "enabled" : "disabled"}`);
  } catch (e) {
    return fail(e);
  }
}

export async function couponDeleteAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("coupons.edit");
    const r = await ops.deleteCoupon(admin, String(f.get("code")));
    return ok("/admin/coupons", `${r.code} deleted`);
  } catch (e) {
    return fail(e);
  }
}

/* ───────────── Categories ───────────── */

export async function categoryToggleAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("categories.edit");
    const id = Number(f.get("id"));
    const field = String(f.get("field")) === "featured" ? "featured" : "active";
    const value = f.get("value") === "true";
    await db().update(t.categories).set({ [field]: value }).where(eq(t.categories.id, id));
    await logActivity(admin, "category.update", "category", id, `${field} → ${value}`);
    revalidatePath("/", "layout");
    return ok("/admin/categories", "Category updated");
  } catch (e) {
    return fail(e);
  }
}

export async function saveCategoryAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("categories.edit");
    const name = String(f.get("name") || "").trim();
    if (!name) return { ok: false, message: "Category name is required" };
    const id = num(f.get("id"));
    const values = { name, nameBn: String(f.get("nameBn") || "").trim() || null, description: String(f.get("description") || "").trim() || null, image: String(f.get("image") || "").trim() || null };
    if (id) await db().update(t.categories).set(values).where(eq(t.categories.id, id));
    else await db().insert(t.categories).values({ ...values, slug: slugify(name), subCategories: [], sort: 99 });
    await logActivity(admin, id ? "category.update" : "category.create", "category", id ?? name, name);
    revalidatePath("/", "layout");
    return ok("/admin/categories", id ? "Category saved" : `Category “${name}” created`);
  } catch (e) {
    return fail(e);
  }
}

/* ───────────── Products ───────────── */

export async function saveProductAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  let productId = 0;
  try {
    const admin = await requirePermission(f.get("id") ? "products.edit" : "products.create");
    const id = num(f.get("id"));
    const name = String(f.get("name") || "").trim();
    const categoryId = Number(f.get("categoryId"));
    if (!name) return { ok: false, message: "Product name is required" };
    if (!categoryId) return { ok: false, message: "Choose a category" };

    const labels = f.getAll("v_label").map(String);
    const skus = f.getAll("v_sku").map(String);
    const prices = f.getAll("v_price").map(Number);
    const compare = f.getAll("v_compare").map((x) => (x === "" ? null : Number(x)));
    const costs = f.getAll("v_cost").map((x) => (x === "" ? null : Number(x)));
    const stocks = f.getAll("v_stock").map(Number);
    const vids = f.getAll("v_id").map((x) => (x === "" ? null : Number(x)));
    const variants = labels
      .map((label, i) => ({ id: vids[i], label: label.trim(), sku: skus[i]?.trim(), price: Math.round(prices[i]), compareAtPrice: compare[i], costPrice: costs[i], stock: Math.round(stocks[i] || 0) }))
      .filter((v) => v.label || v.sku || v.price);
    if (!variants.length) return { ok: false, message: "Add at least one variant (size / pack) with a price" };
    for (const v of variants) if (!v.label || !v.sku || !Number.isFinite(v.price) || v.price <= 0) return { ok: false, message: "Every variant needs a label, a SKU and a price" };
    if (new Set(variants.map((v) => v.sku)).size !== variants.length) return { ok: false, message: "SKUs must be unique" };

    const images = String(f.get("images") || "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    const base = {
      name,
      nameBn: String(f.get("nameBn") || "").trim() || null,
      subtitle: String(f.get("subtitle") || "").trim(),
      shortDescription: String(f.get("shortDescription") || "").trim(),
      descriptionHtml: String(f.get("descriptionHtml") || "").trim() || null,
      categoryId,
      status: (String(f.get("status")) || "draft") as "draft" | "published" | "archived",
      badgeText: String(f.get("badgeText") || "").trim() || null,
    };

    await db().transaction(async (tx) => {
      if (id) {
        await tx.update(t.products).set(base).where(eq(t.products.id, id));
        productId = id;
      } else {
        let slug = slugify(String(f.get("slug") || "") || name) || `product-${Date.now()}`;
        const [dup] = await tx.select({ id: t.products.id }).from(t.products).where(eq(t.products.slug, slug));
        if (dup) slug = `${slug}-${Date.now().toString(36)}`;
        const [r] = await tx.insert(t.products).values({ ...base, slug, tags: [] });
        productId = r.insertId;
      }
      // variants: update existing, insert new, deactivate removed
      const keep = variants.filter((v) => v.id).map((v) => v.id!);
      if (id) {
        const existing = await tx.select({ id: t.productVariants.id }).from(t.productVariants).where(eq(t.productVariants.productId, productId));
        for (const e of existing) if (!keep.includes(e.id)) await tx.update(t.productVariants).set({ active: false }).where(eq(t.productVariants.id, e.id));
      }
      let sort = 0;
      for (const v of variants) {
        const row = { label: v.label, sku: v.sku, price: v.price, compareAtPrice: v.compareAtPrice, costPrice: v.costPrice, sort: sort++, active: true };
        let variantId = v.id;
        if (variantId) await tx.update(t.productVariants).set(row).where(eq(t.productVariants.id, variantId));
        else {
          const [ins] = await tx.insert(t.productVariants).values({ ...row, productId, stockOnHand: 0 });
          variantId = ins.insertId;
        }
        // stock changes go through the ledger so reports and history stay correct
        const [cur] = await tx.select({ s: t.productVariants.stockOnHand }).from(t.productVariants).where(eq(t.productVariants.id, variantId));
        const delta = Math.max(0, v.stock) - (cur?.s ?? 0);
        if (delta !== 0) await moveStock(tx, { variantId, qty: delta, type: delta > 0 ? "in" : "adjust", reason: "Set from product form", adminId: admin.id });
      }
      if (images.length) {
        await tx.delete(t.productImages).where(eq(t.productImages.productId, productId));
        let i = 0;
        for (const src of images) await tx.insert(t.productImages).values({ productId, src, alt: name, sort: i++ });
      }
    });
    await logActivity(admin, id ? "product.update" : "product.create", "product", productId, name);
    revalidatePath("/", "layout");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    return { ok: false, message: /Duplicate entry/.test(msg) ? "That SKU or slug is already used by another product" : (fail(e)?.message ?? "Something went wrong") };
  }
  redirect(`/admin/products?saved=${productId}`);
}

export async function deleteProductAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("products.delete");
    const id = Number(f.get("id"));
    const [used] = await db().select({ n: sql<number>`count(*)` }).from(t.orderItems).where(eq(t.orderItems.productId, id));
    if (Number(used.n) > 0) {
      await ops.setProductStatus(admin, id, "archived");
      return ok("/admin/products", "This product has orders, so it was archived instead of deleted");
    }
    await db().delete(t.productImages).where(eq(t.productImages.productId, id));
    await db().delete(t.productVariants).where(eq(t.productVariants.productId, id));
    await db().delete(t.products).where(eq(t.products.id, id));
    await logActivity(admin, "product.delete", "product", id, "Deleted product");
    revalidatePath("/", "layout");
    return ok("/admin/products", "Product deleted");
  } catch (e) {
    return fail(e);
  }
}

/* ───────────── Admin users ───────────── */

export async function createAdminUserAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("users.edit");
    const name = String(f.get("name") || "").trim();
    const email = String(f.get("email") || "").trim().toLowerCase();
    const password = String(f.get("password") || "");
    const roleId = Number(f.get("roleId"));
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) return { ok: false, message: "Enter a name and a valid email" };
    if (password.length < 8) return { ok: false, message: "Password must be at least 8 characters" };
    const [role] = await db().select().from(t.roles).where(eq(t.roles.id, roleId));
    if (!role) return { ok: false, message: "Choose a role" };
    if (role.permissions.includes("*") && !admin.permissions.includes("*")) return { ok: false, message: "Only a Super Admin can create another Super Admin" };
    const [dup] = await db().select({ id: t.adminUsers.id }).from(t.adminUsers).where(eq(t.adminUsers.email, email));
    if (dup) return { ok: false, message: "An admin with this email already exists" };
    await db().insert(t.adminUsers).values({ name, email, passwordHash: await bcrypt.hash(password, 10), roleId });
    await logActivity(admin, "user.create", "admin", email, `${name} (${role.name})`);
    return ok("/admin/users", `${name} added as ${role.name}`);
  } catch (e) {
    return fail(e);
  }
}

export async function updateAdminUserAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("users.edit");
    const id = Number(f.get("id"));
    if (id === admin.id && f.get("active") === "false") return { ok: false, message: "You can’t deactivate your own account" };
    const [target] = await db().select({ perms: t.roles.permissions }).from(t.adminUsers).innerJoin(t.roles, eq(t.roles.id, t.adminUsers.roleId)).where(eq(t.adminUsers.id, id));
    if (!target) return { ok: false, message: "User not found" };
    if (target.perms.includes("*") && !admin.permissions.includes("*")) return { ok: false, message: "Only a Super Admin can change a Super Admin" };
    const patch: Partial<typeof t.adminUsers.$inferInsert> = {};
    if (f.has("active")) patch.active = f.get("active") === "true";
    if (f.get("roleId")) {
      if (id === admin.id) return { ok: false, message: "You can’t change your own role" };
      const [role] = await db().select().from(t.roles).where(eq(t.roles.id, Number(f.get("roleId"))));
      if (!role) return { ok: false, message: "Unknown role" };
      if (role.permissions.includes("*") && !admin.permissions.includes("*")) return { ok: false, message: "Only a Super Admin can grant Super Admin" };
      patch.roleId = role.id;
    }
    const pw = String(f.get("password") || "");
    if (pw) {
      if (pw.length < 8) return { ok: false, message: "Password must be at least 8 characters" };
      patch.passwordHash = await bcrypt.hash(pw, 10);
      patch.failedLogins = 0;
      patch.lockedUntil = null;
    }
    if (!Object.keys(patch).length) return { ok: false, message: "Nothing to change" };
    await db().update(t.adminUsers).set(patch).where(eq(t.adminUsers.id, id));
    await logActivity(admin, "user.update", "admin", id, Object.keys(patch).join(", "));
    return ok("/admin/users", "User updated");
  } catch (e) {
    return fail(e);
  }
}
