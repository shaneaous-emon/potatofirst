import { NextResponse, type NextRequest } from "next/server";
import { authorizeUrl, isOAuthProvider, providerConfigured, redirectUri, siteOrigin } from "@/lib/customer/oauth";
import { hasDatabase } from "@/db";

const STATE_COOKIE = "pf_oauth_state";

/** Starts Google / Facebook sign-in: sets a CSRF state cookie and redirects to the provider. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params;
  const origin = siteOrigin(req);
  if (!isOAuthProvider(provider) || !providerConfigured(provider) || !hasDatabase) {
    return NextResponse.redirect(`${origin}/account?auth_error=unavailable`);
  }

  const state = crypto.randomUUID();
  const res = NextResponse.redirect(authorizeUrl(provider, redirectUri(req, provider), state));
  res.cookies.set(STATE_COOKIE, `${provider}:${state}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
