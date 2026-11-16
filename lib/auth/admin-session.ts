import "server-only";
import crypto from "node:crypto";

/**
 * Signed admin session cookies.
 *
 * Interim bootstrap auth (until Clerk integration):
 *  - The first Owner account is claimed with a one-time ADMIN_SETUP_TOKEN
 *    from the environment; afterwards the cookie holds a random opaque
 *    session id stored in the signed payload.
 *  - Cookies are HMAC-SHA256 signed with SESSION_SECRET and expire.
 *  - Roles are NOT taken from the cookie: every request re-reads the
 *    admin_users row, so revoked or demoted admins lose access at once.
 *  - All verification happens server-side only.
 */

export interface AdminSessionPayload {
  sub: string; // admin_users.id
  sid: string; // session id (for future revocation)
  exp: number; // unix seconds
}

const COOKIE_NAME = "cb_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function secret(): Buffer {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("SESSION_SECRET missing or too short (need >= 32 hex chars)");
  }
  return Buffer.from(s, "hex").length === 32
    ? Buffer.from(s, "hex")
    : Buffer.from(s, "utf-8");
}

function sign(data: string): string {
  return crypto.createHmac("sha256", secret()).update(data).digest("base64url");
}

export function encodeSessionCookie(payload: AdminSessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function decodeSessionCookie(cookie: string | undefined): AdminSessionPayload | null {
  if (!cookie) return null;
  const [body, sig] = cookie.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8")) as AdminSessionPayload;
    if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) return null;
    if (typeof payload.sub !== "string" || typeof payload.sid !== "string") return null;
    return payload;
  } catch {
    return null;
  }
}

export function newAdminSession(adminId: string): { cookie: string; maxAge: number; name: string } {
  const payload: AdminSessionPayload = {
    sub: adminId,
    sid: crypto.randomBytes(16).toString("hex"),
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  };
  return { cookie: encodeSessionCookie(payload), maxAge: MAX_AGE_SECONDS, name: COOKIE_NAME };
}

export const adminCookieName = COOKIE_NAME;
