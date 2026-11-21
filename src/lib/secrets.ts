import "server-only";

/**
 * Session signing secrets.
 *
 * The repository is public, so there must never be a hard-coded fallback in
 * production: anyone could read it and forge an admin or customer cookie.
 * In development a throwaway value is used so `npm run dev` works without setup.
 */
const DEV_FALLBACK = "potatofirst-dev-only-secret-not-for-production-use";

function resolve(...names: string[]): string | null {
  for (const n of names) {
    const v = process.env[n]?.trim();
    if (v && v.length >= 32) return v;
  }
  if (process.env.NODE_ENV !== "production") return DEV_FALLBACK;
  return null;
}

export class MissingSecretError extends Error {
  constructor(name: string) {
    super(`${name} is not set on the server (needs 32+ random characters).`);
    this.name = "MissingSecretError";
  }
}

/** Secret for admin session cookies. Throws in production when not configured. */
export function adminSecret(): Uint8Array {
  const s = resolve("ADMIN_SESSION_SECRET");
  if (!s) throw new MissingSecretError("ADMIN_SESSION_SECRET");
  return new TextEncoder().encode(s);
}

/** Secret for customer session cookies (falls back to the admin secret). */
export function customerSecret(): Uint8Array {
  const s = resolve("CUSTOMER_SESSION_SECRET", "ADMIN_SESSION_SECRET");
  if (!s) throw new MissingSecretError("CUSTOMER_SESSION_SECRET");
  return new TextEncoder().encode(s);
}
