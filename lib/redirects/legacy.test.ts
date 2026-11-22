import { describe, expect, it } from "vitest"

import { legacyRedirects } from "./legacy"

/** Converts a Next.js source pattern to a RegExp (supports :param and :param*). */
function toRegExp(source: string): RegExp {
  const pattern = source
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\/:\w+\*/g, "(?:/.*)?")
    .replace(/:\w+/g, "[^/]+")
  return new RegExp(`^${pattern}$`)
}

describe("legacy redirects", () => {
  it("has entries", () => {
    expect(legacyRedirects.length).toBeGreaterThan(0)
  })

  it("has no duplicate sources", () => {
    const sources = legacyRedirects.map((r) => r.source)
    expect(new Set(sources).size).toBe(sources.length)
  })

  it("only redirects to relative paths on this site", () => {
    for (const { destination } of legacyRedirects) {
      expect(destination.startsWith("/")).toBe(true)
      expect(destination.startsWith("//")).toBe(false)
    }
  })

  it("never redirects to a path that is itself redirected (no chains or loops)", () => {
    const matchers = legacyRedirects.map((r) => toRegExp(r.source))
    for (const { source, destination } of legacyRedirects) {
      const concrete = destination.replace(/\/:\w+\*/g, "/x").replace(/:\w+/g, "x")
      const hit = matchers.find((m) => m.test(concrete))
      expect(hit, `${source} → ${destination} lands on another redirect`).toBeUndefined()
    }
  })

  it("lists specific camel-case room paths before the camel-case catch-all", () => {
    const catchAll = legacyRedirects.findIndex((r) => r.source === "/resorts/africanVillage/:path*")
    const room = legacyRedirects.findIndex((r) => r.source.startsWith("/resorts/africanVillage/acc/"))
    expect(catchAll).toBeGreaterThan(-1)
    expect(room).toBeGreaterThan(-1)
    expect(room).toBeLessThan(catchAll)
  })

  it("moves the camel-case resort slug to kebab case", () => {
    expect(legacyRedirects).toContainEqual({ source: "/resorts/africanVillage", destination: "/resorts/african-village" })
  })
})
