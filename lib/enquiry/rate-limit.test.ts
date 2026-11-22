import { describe, expect, it } from "vitest"

import { createRateLimiter } from "./rate-limit"

describe("createRateLimiter", () => {
  it("allows `limit` hits per window, then reports seconds to wait", () => {
    let t = 0
    const limiter = createRateLimiter({ limit: 5, windowMs: 600_000, now: () => t })
    for (let i = 0; i < 5; i++) expect(limiter.hit("a").allowed).toBe(true)
    t = 60_000
    expect(limiter.hit("a")).toEqual({ allowed: false, retryAfter: 540 })
    expect(limiter.hit("b").allowed).toBe(true)
  })

  it("resets after the window", () => {
    let t = 0
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, now: () => t })
    expect(limiter.hit("a").allowed).toBe(true)
    expect(limiter.hit("a").allowed).toBe(false)
    t = 1000
    expect(limiter.hit("a").allowed).toBe(true)
  })

  it("stays bounded in memory", () => {
    const t = 0
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, now: () => t, maxKeys: 2 })
    limiter.hit("a")
    limiter.hit("b")
    limiter.hit("c") // evicts "a"
    expect(limiter.hit("a").allowed).toBe(true)
  })
})
