"use server";

import bcrypt from "bcryptjs";
import { eq, or, desc, inArray } from "drizzle-orm";
import { db, hasDatabase, t } from "@/db";
import {
  createCustomerSession,
  destroyCustomerSession,
  readCustomerSession,
} from "@/lib/customer/session";
import type { Customer } from "@/stores/auth";
import { providerConfigured } from "@/lib/customer/oauth";

export async function getCurrentCustomerAction(): Promise<Customer | null> {
  const session = await readCustomerSession();
  if (!session || !hasDatabase) return null;

  try {
    const [cust] = await db()
      .select()
      .from(t.customers)
      .where(eq(t.customers.id, session.id))
      .limit(1);

    if (!cust || cust.blocked) {
      await destroyCustomerSession();
      return null;
    }
    return {
      id: String(cust.id),
      name: cust.name,
      phone: cust.phone || undefined,
      email: cust.email || undefined,
      provider: cust.provider === "guest" ? "password" : cust.provider,
    };
  } catch (e) {
    console.error("Failed to load current customer:", e);
    return null;
  }
}

/** Which social sign-in buttons to show (only providers with real credentials on the server). */
export async function getSocialProvidersAction(): Promise<{ google: boolean; facebook: boolean }> {
  if (!hasDatabase) return { google: false, facebook: false };
  return { google: providerConfigured("google"), facebook: providerConfigured("facebook") };
}

const NO_DB = {
  ok: false as const,
  error: "Accounts are temporarily unavailable. You can still order as a guest.",
};

export async function registerCustomerAction(input: {
  name: string;
  phone: string;
  email?: string;
  password: string;
}): Promise<{ ok: boolean; customer?: Customer; error?: string }> {
  const cleanPhone = input.phone.replace(/[\s-]/g, "").replace(/^\+?88/, "");
  if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
    return { ok: false, error: "Please provide a valid 11-digit Bangladeshi phone number" };
  }
  if (!input.name.trim()) {
    return { ok: false, error: "Name is required" };
  }
  if (input.password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters" };
  }

  if (!hasDatabase) {
    console.error("registerCustomerAction: DATABASE_URL is not set");
    return NO_DB;
  }

  const hash = await bcrypt.hash(input.password, 10);
  const cleanEmail = input.email?.trim().toLowerCase() || null;

  if (hasDatabase) {
    try {
      const conditions = [eq(t.customers.phone, cleanPhone)];
      if (cleanEmail) conditions.push(eq(t.customers.email, cleanEmail));

      const existing = await db()
        .select()
        .from(t.customers)
        .where(or(...conditions))
        .limit(1);

      let custId: number;

      if (existing.length > 0) {
        const cust = existing[0];
        if (cust.passwordHash || cust.provider !== "guest") {
          return {
            ok: false,
            error:
              cust.provider === "google" || cust.provider === "facebook"
                ? `This email is linked to a ${cust.provider === "google" ? "Google" : "Facebook"} account. Please continue with ${cust.provider === "google" ? "Google" : "Facebook"}.`
                : "An account already exists with this phone number or email. Please log in.",
          };
        }
        if (cust.blocked) {
          return { ok: false, error: "This account has been suspended. Please contact support." };
        }
        // Upgrade existing guest customer to registered user
        await db()
          .update(t.customers)
          .set({
            name: input.name.trim(),
            email: cleanEmail ?? cust.email,
            passwordHash: hash,
            provider: "password",
          })
          .where(eq(t.customers.id, cust.id));
        custId = cust.id;
      } else {
        const [res] = await db().insert(t.customers).values({
          name: input.name.trim(),
          phone: cleanPhone,
          email: cleanEmail,
          passwordHash: hash,
          provider: "password",
          group: "new",
        });
        custId = res.insertId;
      }

      await createCustomerSession({
        id: custId,
        name: input.name.trim(),
        phone: cleanPhone,
        email: cleanEmail || undefined,
      });

      return {
        ok: true,
        customer: {
          id: String(custId),
          name: input.name.trim(),
          phone: cleanPhone,
          email: cleanEmail || undefined,
          provider: "password",
        },
      };
    } catch (err) {
      console.error("Database registration failed:", err);
      return { ok: false, error: "Registration failed. Please try again." };
    }
  }

  return NO_DB;
}

export async function loginCustomerAction(input: {
  identifier: string;
  password: string;
}): Promise<{ ok: boolean; customer?: Customer; error?: string }> {
  const ident = input.identifier.trim();
  const cleanPhone = ident.replace(/[\s-]/g, "").replace(/^\+?88/, "");
  const isEmail = ident.includes("@");

  if (hasDatabase) {
    try {
      const condition = isEmail
        ? eq(t.customers.email, ident.toLowerCase())
        : eq(t.customers.phone, cleanPhone);

      const [cust] = await db().select().from(t.customers).where(condition).limit(1);

      if (!cust) {
        return { ok: false, error: "No account found with this phone number or email." };
      }
      if (cust.blocked) {
        return {
          ok: false,
          error: `This account has been suspended${cust.blockReason ? `: ${cust.blockReason}` : ""}.`,
        };
      }
      if (!cust.passwordHash) {
        return {
          ok: false,
          error:
            cust.provider === "google" || cust.provider === "facebook"
              ? `This account uses ${cust.provider === "google" ? "Google" : "Facebook"} sign-in. Please continue with ${cust.provider === "google" ? "Google" : "Facebook"}.`
              : "No password set for this account. Please sign up to activate your account.",
        };
      }

      const match = await bcrypt.compare(input.password, cust.passwordHash);
      if (!match) {
        return { ok: false, error: "Incorrect password. Please try again." };
      }

      await createCustomerSession({
        id: cust.id,
        name: cust.name,
        phone: cust.phone || cleanPhone,
        email: cust.email || undefined,
      });

      return {
        ok: true,
        customer: {
          id: String(cust.id),
          name: cust.name,
          phone: cust.phone || undefined,
          email: cust.email || undefined,
          provider: "password",
        },
      };
    } catch (err) {
      console.error("Database login failed:", err);
      return { ok: false, error: "Login failed. Please try again." };
    }
  }

  console.error("loginCustomerAction: DATABASE_URL is not set");
  return NO_DB;
}

export async function logoutCustomerAction(): Promise<{ ok: boolean }> {
  await destroyCustomerSession();
  return { ok: true };
}

export type CustomerOrderRecord = {
  id: string;
  number: string;
  createdAt: string;
  status: string;
  total: number;
  itemCount: number;
  paymentMethod: string;
  paymentStatus: string;
  zoneLabel: string;
  courier?: string | null;
  trackingId?: string | null;
  items: {
    name: string;
    variantLabel: string;
    quantity: number;
    unitPrice: number;
    image?: string | null;
  }[];
};

export async function getCustomerOrdersAction(phone?: string): Promise<CustomerOrderRecord[]> {
  const session = await readCustomerSession();
  const searchPhone = phone || session?.phone;

  if (!hasDatabase || (!session?.id && !searchPhone)) {
    return [];
  }

  try {
    const conditions = [];
    if (session?.id) conditions.push(eq(t.orders.customerId, session.id));
    if (searchPhone) conditions.push(eq(t.orders.phone, searchPhone));

    const orderRows = await db()
      .select()
      .from(t.orders)
      .where(or(...conditions))
      .orderBy(desc(t.orders.createdAt))
      .limit(50);

    if (!orderRows.length) return [];

    const orderIds = orderRows.map((o) => o.id);
    const items = await db()
      .select()
      .from(t.orderItems)
      .where(inArray(t.orderItems.orderId, orderIds));

    return orderRows.map((o) => {
      const orderItemsList = items.filter((it) => it.orderId === o.id);
      const itemCount = orderItemsList.reduce((acc, it) => acc + it.quantity, 0);

      return {
        id: String(o.id),
        number: o.number,
        createdAt: o.createdAt.toISOString(),
        status: o.status,
        total: o.total,
        itemCount,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        zoneLabel: o.zoneLabel,
        courier: o.courier,
        trackingId: o.trackingId,
        items: orderItemsList.map((it) => ({
          name: it.name,
          variantLabel: it.variantLabel,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          image: it.image,
        })),
      };
    });
  } catch (err) {
    console.error("Failed to fetch customer orders:", err);
    return [];
  }
}
