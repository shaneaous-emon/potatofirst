import type { Customer } from "@/stores/auth";
import {
  registerCustomerAction,
  loginCustomerAction,
  logoutCustomerAction,
  getCurrentCustomerAction,
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

export async function socialLogin(provider: "google" | "facebook"): Promise<Customer> {
  // Social login simulation connecting with database/session
  const name = provider === "google" ? "Google User" : "Facebook User";
  const email = `${provider}_user@potatofirst.com`;
  const res = await registerCustomerAction({
    name,
    phone: `017${Math.floor(10000000 + Math.random() * 89999999)}`,
    email,
    password: `SocialAuth_${Math.random().toString(36).slice(2)}`,
  });
  if (res.customer) {
    return { ...res.customer, provider };
  }
  return { id: `CU-${Date.now()}`, name, provider };
}

export async function logoutCustomer() {
  await logoutCustomerAction();
}

export async function getSessionCustomer(): Promise<Customer | null> {
  return getCurrentCustomerAction();
}
