"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, t } from "@/db";
import { logActivity, requirePermission } from "@/lib/admin/auth";
import { getSettings, saveSetting } from "@/lib/settings";
import type { ActionResult } from "@/components/admin/action-form";

const done = (path: string, message: string): ActionResult => {
  revalidatePath(path);
  return { ok: true, message };
};

const fail = (e: unknown): ActionResult => ({
  ok: false,
  message: e instanceof Error ? e.message : "Something went wrong",
});

/* ───────────── Courier Settings ───────────── */

export async function saveCourierSettingsAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("shipping.edit");
    const { couriers } = await getSettings("couriers");

    const steadfast = {
      enabled: f.get("steadfast_enabled") === "on",
      mode: (f.get("steadfast_mode") as "manual" | "api") || "manual",
      apiKey: String(f.get("steadfast_apiKey") || "").trim(),
      secretKey: String(f.get("steadfast_secretKey") || "").trim(),
    };

    const pathao = {
      enabled: f.get("pathao_enabled") === "on",
      mode: (f.get("pathao_mode") as "manual" | "api") || "manual",
      clientId: String(f.get("pathao_clientId") || "").trim(),
      clientSecret: String(f.get("pathao_clientSecret") || "").trim(),
      username: String(f.get("pathao_username") || "").trim(),
      password: String(f.get("pathao_password") || "").trim(),
      storeId: String(f.get("pathao_storeId") || "").trim(),
    };

    const redx = {
      enabled: f.get("redx_enabled") === "on",
      mode: (f.get("redx_mode") as "manual" | "api") || "manual",
      token: String(f.get("redx_token") || "").trim(),
    };

    await saveSetting("couriers", { steadfast, pathao, redx });
    await logActivity(admin, "couriers.update", "settings", null, "Updated courier configuration");
    return done("/admin/couriers", "Courier configurations saved successfully");
  } catch (e) {
    return fail(e);
  }
}

/* ───────────── Marketing & Pixels ───────────── */

export async function saveMarketingSettingsAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("marketing.edit");

    const tracking = {
      metaPixelId: String(f.get("metaPixelId") || "").trim(),
      gtmId: String(f.get("gtmId") || "").trim(),
      ga4Id: String(f.get("ga4Id") || "").trim(),
      purchaseOn: (f.get("purchaseOn") as "placed" | "confirmed") || "placed",
    };

    await saveSetting("tracking", tracking);
    await logActivity(admin, "marketing.update", "settings", null, "Updated tracking and pixel IDs");
    revalidatePath("/", "layout");
    return done("/admin/marketing", "Tracking and Pixel settings saved successfully");
  } catch (e) {
    return fail(e);
  }
}

/* ───────────── Store Settings ───────────── */

export async function saveStoreSettingsAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("settings.edit");

    const store = {
      name: String(f.get("name") || "").trim(),
      tagline: String(f.get("tagline") || "").trim(),
      hotline: String(f.get("hotline") || "").trim(),
      whatsapp: String(f.get("whatsapp") || "").trim(),
      email: String(f.get("email") || "").trim(),
      address: String(f.get("address") || "").trim(),
      hours: String(f.get("hours") || "").trim(),
      facebook: String(f.get("facebook") || "").trim(),
      instagram: String(f.get("instagram") || "").trim(),
    };

    const checkout = {
      guestCheckout: f.get("guestCheckout") === "on",
      minOrder: Number(f.get("minOrder")) || 0,
      maxQtyPerItem: Number(f.get("maxQtyPerItem")) || 20,
      orderPrefix: String(f.get("orderPrefix") || "PF-").trim(),
      bkashNumber: String(f.get("bkashNumber") || "").trim(),
      bkashType: (f.get("bkashType") as "Personal" | "Merchant" | "Agent") || "Personal",
      codEnabled: f.get("codEnabled") === "on",
      bkashEnabled: f.get("bkashEnabled") === "on",
    };

    await saveSetting("store", store);
    await saveSetting("checkout", checkout);
    await logActivity(admin, "store.update", "settings", null, "Updated store & checkout settings");
    revalidatePath("/", "layout");
    return done("/admin/settings", "Store settings saved successfully");
  } catch (e) {
    return fail(e);
  }
}

/* ───────────── Customers ───────────── */

export async function toggleCustomerBlockAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("customers.edit");
    const id = Number(f.get("id"));
    const block = f.get("block") === "true";
    const reason = String(f.get("reason") || "").trim();

    await db()
      .update(t.customers)
      .set({
        blocked: block,
        blockReason: block ? reason || "Blocked by admin" : null,
        group: block ? "risk" : "returning",
      })
      .where(eq(t.customers.id, id));

    await logActivity(admin, block ? "customer.block" : "customer.unblock", "customer", id, reason);
    return done("/admin/customers", block ? "Customer has been blocked" : "Customer has been unblocked");
  } catch (e) {
    return fail(e);
  }
}

/* ───────────── Products ───────────── */

export async function toggleProductStatusAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("products.edit");
    const id = Number(f.get("id"));
    const status = String(f.get("status")) as "published" | "draft" | "archived";

    await db()
      .update(t.products)
      .set({ status })
      .where(eq(t.products.id, id));

    await logActivity(admin, "product.status", "product", id, `Status changed to ${status}`);
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return done("/admin/products", `Product is now ${status}`);
  } catch (e) {
    return fail(e);
  }
}

/* ───────────── Coupons ───────────── */

export async function createCouponAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("coupons.edit");
    const code = String(f.get("code") || "").trim().toUpperCase();
    const type = String(f.get("type")) as "percent" | "fixed" | "free_delivery";
    const value = Math.max(0, Number(f.get("value")) || 0);
    const minOrder = Math.max(0, Number(f.get("minOrder")) || 0);
    const maxDiscount = Number(f.get("maxDiscount")) || null;
    const usageLimit = Number(f.get("usageLimit")) || null;
    const firstOrderOnly = f.get("firstOrderOnly") === "on";

    if (!code) return { ok: false, message: "Coupon code is required" };

    await db().insert(t.coupons).values({
      code,
      type,
      value,
      minOrder,
      maxDiscount,
      usageLimit,
      firstOrderOnly,
      active: true,
    });

    await logActivity(admin, "coupon.create", "coupon", null, `Created coupon ${code}`);
    return done("/admin/coupons", `Coupon ${code} created successfully`);
  } catch (e) {
    return fail(e);
  }
}
