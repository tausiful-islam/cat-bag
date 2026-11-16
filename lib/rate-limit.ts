import "server-only";

/**
 * Minimal in-memory sliding-window rate limiter.
 * Adequate for a single Vercel instance; swap for Upstash if the
 * app scales out. Applied to login attempts and order submission.
 */

const buckets = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    const retryAfterMs = windowMs - (now - hits[0]);
    buckets.set(key, hits);
    return { ok: false, retryAfterMs };
  }
  hits.push(now);
  buckets.set(key, hits);
  return { ok: true, retryAfterMs: 0 };
}

// Periodic cleanup to bound memory
if (typeof setInterval === "function" && !(globalThis as Record<string, unknown>).__cbRateCleanup) {
  (globalThis as Record<string, unknown>).__cbRateCleanup = setInterval(() => {
    const now = Date.now();
    for (const [k, hits] of buckets) {
      const live = hits.filter((t) => now - t < 60 * 60 * 1000);
      if (live.length === 0) buckets.delete(k);
      else buckets.set(k, live);
    }
  }, 10 * 60 * 1000);
  if (typeof (globalThis as Record<string, unknown>).__cbRateCleanup === "object" && "unref" in ((globalThis as Record<string, unknown>).__cbRateCleanup as object)) {
    ((globalThis as Record<string, unknown>).__cbRateCleanup as { unref: () => void }).unref();
  }
}
