import { describe, expect, it } from "vitest"

import { formatFromPrice, formatSize, roomFacts } from "./room-facts"

const empty = { bedConfiguration: "", maxGuests: null, sizeSqm: null, view: "" }

describe("roomFacts", () => {
  it("returns nothing when no fact was entered", () => {
    expect(roomFacts(empty)).toEqual([])
  })

  it("keeps design order and skips empty facts", () => {
    expect(
      roomFacts({ bedConfiguration: "1 King / 2 Twin Beds", maxGuests: 2, sizeSqm: 35, view: "Lake or Garden View" })
    ).toEqual([
      { key: "bed", label: "1 King / 2 Twin Beds" },
      { key: "guests", label: "2 Guests" },
      { key: "size", label: "35 m² (377 ft²)" },
      { key: "view", label: "Lake or Garden View" },
    ])
    expect(roomFacts({ ...empty, view: "Forest View" }).map((f) => f.key)).toEqual(["view"])
  })

  it("uses the singular for one guest and ignores zero", () => {
    expect(roomFacts({ ...empty, maxGuests: 1 })[0].label).toBe("1 Guest")
    expect(roomFacts({ ...empty, maxGuests: 0, sizeSqm: 0 })).toEqual([])
  })
})

describe("formatSize", () => {
  it("converts m² to rounded ft²", () => {
    expect(formatSize(35)).toBe("35 m² (377 ft²)")
    expect(formatSize(120.25)).toBe("120.3 m² (1,294 ft²)")
  })
})

describe("formatFromPrice", () => {
  it("is null without an editor-entered price", () => {
    expect(formatFromPrice(null)).toBeNull()
    expect(formatFromPrice({ amount: 0, currency: "ETB", unit: "" })).toBeNull()
  })

  it("formats amount, currency and unit, defaulting to night", () => {
    expect(formatFromPrice({ amount: 120, currency: "USD", unit: "" })).toEqual({ amount: "USD 120", unit: "night" })
    expect(formatFromPrice({ amount: 4500, currency: "ETB", unit: "per night" })).toEqual({ amount: "ETB 4,500", unit: "night" })
    expect(formatFromPrice({ amount: 90, currency: "USD", unit: "person" })).toEqual({ amount: "USD 90", unit: "person" })
  })
})
