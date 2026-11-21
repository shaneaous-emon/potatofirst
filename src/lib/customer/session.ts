import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { customerSecret } from "@/lib/secrets";

const COOKIE_NAME = "pf_customer";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const secret = customerSecret;

export type CustomerJwtPayload = {
  id: number;
  name: string;
  phone: string;
  email?: string;
};

export async function createCustomerSession(payload: CustomerJwtPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function readCustomerSession(): Promise<CustomerJwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: Number(payload.id),
      name: String(payload.name),
      phone: String(payload.phone),
      email: payload.email ? String(payload.email) : undefined,
    };
  } catch {
    return null;
  }
}

export async function destroyCustomerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
