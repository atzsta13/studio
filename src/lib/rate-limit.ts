/**
 * In-memory rate limiter for Next.js API routes.
 * Keyed by IP address. Resets automatically after `windowMs`.
 * Note: resets on server restart / cold start — acceptable for serverless.
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export function rateLimit(
    key: string,
    options: { windowMs: number; maxRequests: number }
): boolean {
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + options.windowMs });
        return true;
    }

    if (entry.count >= options.maxRequests) {
        return false;
    }

    entry.count += 1;
    return true;
}
