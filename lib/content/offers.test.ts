import { describe, expect, it } from "vitest"

import {
  MAX_CACHE_SECONDS,
  MIN_CACHE_SECONDS,
  cacheSeconds,
  formatOfferDate,
  isLive,
  nextBoundary,
  offerAction,
  offerSubtitle,
  pickPopupOffer,
} from "./offers"

const now = new Date("2026-11-22T12:00:00Z")
const november = { startDate: "2026-11-01T00:00:00+03:00", endDate: "2026-11-30T23:59:00+03:00" }

describe("isLive", () => {
  it("is live between start and end", () => {
    expect(isLive(november, now)).toBe(true)
  })

  it("is live exactly at the start and not exactly at the end", () => {
    expect(isLive(november, new Date(november.startDate))).toBe(true)
    expect(isLive(november, new Date(november.endDate))).toBe(false)
  })

  it("is not live before the start or after the end", () => {
    expect(isLive(november, new Date("2026-10-31T20:59:59Z"))).toBe(false)
    expect(isLive(november, new Date("2026-12-01T00:00:00Z"))).toBe(false)
  })

  it("treats invalid dates as not live", () => {
    expect(isLive({ startDate: "nope", endDate: november.endDate }, now)).toBe(false)
  })
})

describe("nextBoundary", () => {
  it("picks the soonest future start or end", () => {
    const upcoming = { startDate: "2026-11-25T00:00:00Z", endDate: "2026-12-25T00:00:00Z" }
    expect(nextBoundary([november, upcoming], now)).toBe(Date.parse(upcoming.startDate))
  })

  it("is null when nothing is ahead", () => {
    expect(nextBoundary([], now)).toBeNull()
  })
})

describe("cacheSeconds", () => {
  it("is the maximum with no offers", () => {
    expect(cacheSeconds([], now)).toBe(MAX_CACHE_SECONDS)
  })

  it("is the seconds until a boundary within a day", () => {
    const soon = { startDate: november.startDate, endDate: "2026-11-22T13:00:00Z" }
    expect(cacheSeconds([soon], now)).toBe(3600)
  })

  it("never drops below the floor", () => {
    const now2 = new Date(Date.parse(november.endDate) - 10_000)
    expect(cacheSeconds([november], now2)).toBe(MIN_CACHE_SECONDS)
  })

  it("never exceeds the ceiling", () => {
    expect(cacheSeconds([november], now)).toBe(MAX_CACHE_SECONDS)
  })
})

describe("pickPopupOffer", () => {
  it("picks the popup offer that ends soonest", () => {
    const a = { ...november, showAsPopup: true, id: "a" }
    const b = { startDate: november.startDate, endDate: "2026-11-25T00:00:00Z", showAsPopup: true, id: "b" }
    const c = { startDate: november.startDate, endDate: "2026-11-23T00:00:00Z", showAsPopup: false, id: "c" }
    expect(pickPopupOffer([a, b, c])?.id).toBe("b")
  })

  it("is null without a popup offer", () => {
    expect(pickPopupOffer([{ ...november, showAsPopup: false }])).toBeNull()
  })
})

describe("formatOfferDate", () => {
  it("formats in Addis Ababa time, not UTC", () => {
    // 30 Nov 23:59 +03:00 is 20:59 UTC; 21:30 UTC on 30 Nov is already 1 Dec in Addis Ababa.
    expect(formatOfferDate(november.endDate)).toBe("30 Nov 2026")
    expect(formatOfferDate("2026-11-30T21:30:00Z")).toBe("1 Dec 2026")
  })

  it("is empty for an invalid date", () => {
    expect(formatOfferDate("nope")).toBe("")
  })
})

describe("offerAction", () => {
  const resort = (slug: string, bookable: boolean) => ({
    name: slug,
    heading: slug,
    slug,
    bookable,
    bookingPropertyId: null,
    phone: null,
    email: null,
  })

  it("books the group engine when the offer applies everywhere", () => {
    expect(offerAction([])).toEqual({ kind: "book", resort: null })
  })

  it("books the one resort when it is bookable", () => {
    expect(offerAction([resort("arba-minch", true)])).toMatchObject({ kind: "book", resort: { slug: "arba-minch" } })
  })

  it("contacts the one resort when it is not bookable", () => {
    expect(offerAction([resort("water-park", false)])).toMatchObject({ kind: "contact", resort: { slug: "water-park" } })
  })

  it("books the group engine when any of several resorts is bookable", () => {
    expect(offerAction([resort("a", false), resort("b", true)])).toEqual({ kind: "book", resort: null })
  })

  it("falls back to site reservations when none of several is bookable", () => {
    expect(offerAction([resort("a", false), resort("b", false)])).toEqual({ kind: "contact", resort: null })
  })
})

describe("offerSubtitle", () => {
  it("drops a short line that repeats the title", () => {
    expect(offerSubtitle("Up to 25% off your November stay", "Enjoy up to 25% off your November stay")).toBe("")
  })

  it("keeps a different short line", () => {
    expect(offerSubtitle("Lake Tana Escape", "Two nights with breakfast")).toBe("Two nights with breakfast")
  })
})
