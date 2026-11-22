/**
 * Fixed-window rate limiter held in memory. On serverless each instance
 * has its own memory, so this is a speed bump, not a hard limit.
 */
export function createRateLimiter({
  limit,
  windowMs,
  now = Date.now,
  maxKeys = 10_000,
}: {
  limit: number
  windowMs: number
  now?: () => number
  maxKeys?: number
}) {
  const windows = new Map<string, { start: number; count: number }>()

  return {
    /** Counts a hit. Returns whether it's allowed and, if not, seconds to wait. */
    hit(key: string): { allowed: true } | { allowed: false; retryAfter: number } {
      const t = now()
      const w = windows.get(key)
      if (!w || t - w.start >= windowMs) {
        if (windows.size >= maxKeys) prune(t)
        windows.set(key, { start: t, count: 1 })
        return { allowed: true }
      }
      if (w.count >= limit) {
        return { allowed: false, retryAfter: Math.max(1, Math.ceil((w.start + windowMs - t) / 1000)) }
      }
      w.count += 1
      return { allowed: true }
    },
  }

  function prune(t: number) {
    for (const [key, w] of windows) if (t - w.start >= windowMs) windows.delete(key)
    // Still full: drop the oldest entries (Map keeps insertion order).
    for (const key of windows.keys()) {
      if (windows.size < maxKeys) break
      windows.delete(key)
    }
  }
}
