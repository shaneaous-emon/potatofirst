import "server-only";

/**
 * Real Google / Facebook sign-in (OAuth 2.0 authorization-code flow).
 * A provider is only offered when its credentials are set on the server:
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 *   FACEBOOK_APP_ID,  FACEBOOK_APP_SECRET
 * Redirect URI to register with each provider:
 *   {SITE_URL}/api/auth/google/callback
 *   {SITE_URL}/api/auth/facebook/callback
 */

export type OAuthProvider = "google" | "facebook";

export type OAuthProfile = { email: string; name: string };

const FB_VERSION = "v21.0";

export function isOAuthProvider(p: string): p is OAuthProvider {
  return p === "google" || p === "facebook";
}

export function providerConfigured(p: OAuthProvider): boolean {
  if (p === "google") return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);
}

/** Public base URL of the site, as the browser sees it (works behind cPanel/LiteSpeed proxy). */
export function siteOrigin(req: Request): string {
  const env = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  if (env) return env;
  const h = req.headers;
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "https";
  if (host) return `${proto.split(",")[0].trim()}://${host.split(",")[0].trim()}`;
  return new URL(req.url).origin;
}

export function redirectUri(req: Request, p: OAuthProvider) {
  return `${siteOrigin(req)}/api/auth/${p}/callback`;
}

export function authorizeUrl(p: OAuthProvider, redirect: string, state: string): string {
  if (p === "google") {
    const q = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: redirect,
      response_type: "code",
      scope: "openid email profile",
      state,
      prompt: "select_account",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
  }
  const q = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID!,
    redirect_uri: redirect,
    response_type: "code",
    scope: "email,public_profile",
    state,
  });
  return `https://www.facebook.com/${FB_VERSION}/dialog/oauth?${q}`;
}

/** Exchanges the authorization code and returns the verified email + name. */
export async function fetchProfile(p: OAuthProvider, code: string, redirect: string): Promise<OAuthProfile> {
  if (p === "google") {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirect,
        grant_type: "authorization_code",
      }),
    });
    const token = (await tokenRes.json()) as { access_token?: string; error?: string };
    if (!tokenRes.ok || !token.access_token) throw new Error(`Google token exchange failed: ${token.error ?? tokenRes.status}`);

    const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const info = (await infoRes.json()) as { email?: string; email_verified?: boolean; name?: string };
    if (!infoRes.ok || !info.email) throw new Error("Google did not return an email address");
    if (info.email_verified === false) throw new Error("Google email is not verified");
    return { email: info.email.toLowerCase(), name: info.name?.trim() || info.email.split("@")[0] };
  }

  const tq = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID!,
    client_secret: process.env.FACEBOOK_APP_SECRET!,
    redirect_uri: redirect,
    code,
  });
  const tokenRes = await fetch(`https://graph.facebook.com/${FB_VERSION}/oauth/access_token?${tq}`);
  const token = (await tokenRes.json()) as { access_token?: string; error?: { message?: string } };
  if (!tokenRes.ok || !token.access_token) throw new Error(`Facebook token exchange failed: ${token.error?.message ?? tokenRes.status}`);

  const meRes = await fetch(
    `https://graph.facebook.com/${FB_VERSION}/me?${new URLSearchParams({ fields: "id,name,email", access_token: token.access_token })}`,
  );
  const me = (await meRes.json()) as { email?: string; name?: string };
  if (!meRes.ok) throw new Error("Facebook profile request failed");
  if (!me.email) throw new Error("NO_EMAIL");
  return { email: me.email.toLowerCase(), name: me.name?.trim() || me.email.split("@")[0] };
}
