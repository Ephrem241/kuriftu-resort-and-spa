import { describe, expect, it } from "vitest"

import { addDays, isIsoDate, nightsBetween, todayInResortZone } from "./dates"

describe("todayInResortZone", () => {
  it("uses Addis Ababa (UTC+3), not the browser zone", () => {
    // 22:30 UTC on 21 Nov is 01:30 on 22 Nov in Addis Ababa.
    expect(todayInResortZone(new Date("2026-11-21T22:30:00Z"))).toBe("2026-11-22")
    expect(todayInResortZone(new Date("2026-11-21T20:59:00Z"))).toBe("2026-11-21")
  })
})

describe("isIsoDate", () => {
  it("accepts real calendar dates only", () => {
    expect(isIsoDate("2026-12-01")).toBe(true)
    expect(isIsoDate("2026-02-30")).toBe(false)
    expect(isIsoDate("01/12/2026")).toBe(false)
    expect(isIsoDate("")).toBe(false)
  })
})

describe("addDays / nightsBetween", () => {
  it("crosses month and year boundaries", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01")
    expect(nightsBetween("2026-12-30", "2027-01-02")).toBe(3)
  })
})
