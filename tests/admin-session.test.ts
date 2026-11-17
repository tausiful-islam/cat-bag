import { describe, expect, it } from "vitest";
import {
  encodeSessionCookie,
  decodeSessionCookie,
  newAdminSession,
  type AdminSessionPayload,
} from "@/lib/auth/admin-session";

process.env.SESSION_SECRET = "a".repeat(64);

describe("admin session cookies", () => {
  it("round-trips a valid session", () => {
    const { cookie } = newAdminSession("admin-123");
    const payload = decodeSessionCookie(cookie);
    expect(payload?.sub).toBe("admin-123");
    expect(payload?.sid).toBeTruthy();
    expect(payload?.exp).toBeGreaterThan(Date.now() / 1000);
  });

  it("rejects tampered cookies", () => {
    const { cookie } = newAdminSession("admin-123");
    const tampered = cookie.slice(0, -4) + "AAAA";
    expect(decodeSessionCookie(tampered)).toBeNull();
  });

  it("rejects garbage", () => {
    expect(decodeSessionCookie("garbage")).toBeNull();
    expect(decodeSessionCookie(undefined)).toBeNull();
  });

  it("rejects expired sessions", () => {
    const payload: AdminSessionPayload = {
      sub: "admin-123",
      sid: "sid",
      exp: Math.floor(Date.now() / 1000) - 10,
    };
    const cookie = encodeSessionCookie(payload);
    expect(decodeSessionCookie(cookie)).toBeNull();
  });
});
