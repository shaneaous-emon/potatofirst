import type { Customer } from "@/stores/auth";
import {
  registerCustomerAction,
  loginCustomerAction,
  logoutCustomerAction,
  getCurrentCustomerAction,
  getSocialProvidersAction,
} from "@/app/(store)/account/actions";

export async function registerCustomer(v: {
  name: string;
  phone: string;
  email?: string;
  password: string;
}): Promise<Customer> {
  const res = await registerCustomerAction(v);
  if (!res.ok || !res.customer) {
    throw new Error(res.error || "Registration failed");
  }
  return res.customer;
}

export async function loginCustomer(v: {
  identifier: string;
  password: string;
}): Promise<Customer> {
  const res = await loginCustomerAction(v);
  if (!res.ok || !res.customer) {
    throw new Error(res.error || "Login failed");
  }
  return res.customer;
}

/** Starts real Google / Facebook OAuth: the browser leaves the site and returns to /account. */
export function socialLogin(provider: "google" | "facebook") {
  window.location.href = `/api/auth/${provider}`;
}

export async function logoutCustomer() {
  await logoutCustomerAction();
}

export async function getSessionCustomer(): Promise<Customer | null> {
  return getCurrentCustomerAction();
}

export async function getSocialProviders() {
  return getSocialProvidersAction();
}
