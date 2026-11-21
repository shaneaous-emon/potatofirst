import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db, hasDatabase, t } from "@/db";
import { fetchProfile, isOAuthProvider, providerConfigured, redirectUri, siteOrigin } from "@/lib/customer/oauth";
import { createCustomerSession } from "@/lib/customer/session";

const STATE_COOKIE = "pf_oauth_state";

/** Provider redirects here with ?code&state. Verifies state, fetches the profile, signs the customer in. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params;
  const origin = siteOrigin(req);
  const fail = (code: string) => {
    const r = NextResponse.redirect(`${origin}/account?auth_error=${code}`);
    r.cookies.delete(STATE_COOKIE);
    return r;
  };

  if (!isOAuthProvider(provider) || !providerConfigured(provider) || !hasDatabase) return fail("unavailable");

  const sp = req.nextUrl.searchParams;
  if (sp.get("error")) return fail("cancelled");
  const code = sp.get("code");
  const state = sp.get("state");
  const expected = req.cookies.get(STATE_COOKIE)?.value;
  if (!code || !state || expected !== `${provider}:${state}`) return fail("state");

  try {
    const profile = await fetchProfile(provider, code, redirectUri(req, provider));

    const [existing] = await db().select().from(t.customers).where(eq(t.customers.email, profile.email)).limit(1);
    let id: number;
    let name = profile.name;
    let phone = "";

    if (existing) {
      if (existing.blocked) return fail("blocked");
      id = existing.id;
      name = existing.name || profile.name;
      phone = existing.phone ?? "";
      if (existing.provider === "guest") {
        await db().update(t.customers).set({ provider }).where(eq(t.customers.id, id));
      }
    } else {
      const [ins] = await db().insert(t.customers).values({
        name: profile.name,
        email: profile.email,
        provider,
        group: "new",
      });
      id = ins.insertId;
    }

    await createCustomerSession({ id, name, phone, email: profile.email });
    const r = NextResponse.redirect(`${origin}/account?signed_in=${provider}`);
    r.cookies.delete(STATE_COOKIE);
    return r;
  } catch (err) {
    console.error(`OAuth ${provider} callback failed:`, err);
    return fail(err instanceof Error && err.message === "NO_EMAIL" ? "no_email" : "failed");
  }
}
