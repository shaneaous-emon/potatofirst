import type { Customer } from "@/stores/auth";

/**
 * MOCK customer auth. Phase 2 (Laravel):
 *  - POST /api/auth/register  { name, phone, email?, password }
 *  - POST /api/auth/login     { identifier (phone or email), password }
 *  - GET  /api/auth/{google|facebook}/redirect → Socialite → callback sets session
 *  - POST /api/auth/logout
 * Guest checkout stays available; orders placed with the same phone are linked to the account.
 */
const wait = (ms = 500) => new Promise((r) => setTimeout(r, ms));
const uid = () => `CU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export async function registerCustomer(v: { name: string; phone: string; email?: string; password: string }): Promise<Customer> {
  await wait();
  return { id: uid(), name: v.name.trim(), phone: v.phone, email: v.email || undefined, provider: "password" };
}

export async function loginCustomer(v: { identifier: string; password: string }): Promise<Customer> {
  await wait();
  const isEmail = v.identifier.includes("@");
  return { id: uid(), name: isEmail ? v.identifier.split("@")[0] : "Customer", ...(isEmail ? { email: v.identifier } : { phone: v.identifier }), provider: "password" };
}

export async function socialLogin(provider: "google" | "facebook"): Promise<Customer> {
  await wait(700);
  return { id: uid(), name: provider === "google" ? "Google User" : "Facebook User", provider };
}

export async function logoutCustomer() {
  await wait(200);
}
