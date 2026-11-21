import { describe, expect, it } from "vitest"

import { createSearchSchema } from "./search-schema"

const schema = createSearchSchema({
  bookableSlugs: ["bishoftu", "entoto"],
  today: "2026-11-21",
})

const valid = {
  destination: "bishoftu",
  checkIn: "2026-11-21",
  checkOut: "2026-11-23",
  adults: 2,
  children: 1,
}

function errorPaths(input: unknown) {
  const result = schema.safeParse(input)
  return result.success ? [] : result.error.issues.map((i) => i.path.join("."))
}

describe("availability search schema", () => {
  it("accepts a valid search starting today", () => {
    expect(schema.safeParse(valid).success).toBe(true)
  })

  it("rejects unknown or non-bookable destinations", () => {
    expect(errorPaths({ ...valid, destination: "waterpark" })).toContain("destination")
    expect(errorPaths({ ...valid, destination: "" })).toContain("destination")
  })

  it("rejects past check-in", () => {
    expect(errorPaths({ ...valid, checkIn: "2026-11-20" })).toContain("checkIn")
  })

  it("requires check-out after check-in", () => {
    expect(errorPaths({ ...valid, checkOut: "2026-11-21" })).toContain("checkOut")
    expect(errorPaths({ ...valid, checkOut: "2026-11-19" })).toContain("checkOut")
  })

  it("enforces guest limits", () => {
    expect(errorPaths({ ...valid, adults: 0 })).toContain("adults")
    expect(errorPaths({ ...valid, adults: 9 })).toContain("adults")
    expect(errorPaths({ ...valid, children: -1 })).toContain("children")
    expect(errorPaths({ ...valid, children: 7 })).toContain("children")
  })

  it("rejects malformed dates", () => {
    expect(errorPaths({ ...valid, checkIn: "21/11/2026" })).toContain("checkIn")
  })
})
