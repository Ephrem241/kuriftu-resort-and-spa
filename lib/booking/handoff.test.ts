import { describe, expect, it } from "vitest"

import { UNVERIFIED_PARAM_MAP, type BookingConfig } from "./config"
import { buildBookingUrl } from "./handoff"

const GROUP_URL =
  "https://book.travelbookgroup.com/premium/group_index.html?id_stile=22372&tst_prntz=si&headvar=ok&lingua_int=eng&id_gruppo=31028&dc_gruppo=2281"

const search = {
  propertyId: "1234",
  checkIn: "2026-12-01",
  checkOut: "2026-12-03",
  adults: 2,
  children: 1,
}

describe("buildBookingUrl", () => {
  it("opens the group page unchanged while params are unverified", () => {
    const config: BookingConfig = { baseUrl: GROUP_URL, paramMap: UNVERIFIED_PARAM_MAP }
    expect(buildBookingUrl(search, config)).toBe(GROUP_URL)
  })

  it("appends only params whose names are configured, keeping group ids", () => {
    const config: BookingConfig = {
      baseUrl: GROUP_URL,
      paramMap: { ...UNVERIFIED_PARAM_MAP, checkIn: "arrival", adults: "ad" },
    }
    const url = new URL(buildBookingUrl(search, config))
    expect(url.searchParams.get("id_gruppo")).toBe("31028")
    expect(url.searchParams.get("arrival")).toBe("2026-12-01")
    expect(url.searchParams.get("ad")).toBe("2")
    expect([...url.searchParams.keys()]).not.toContain("children")
  })

  it("skips empty values", () => {
    const config: BookingConfig = {
      baseUrl: GROUP_URL,
      paramMap: { ...UNVERIFIED_PARAM_MAP, property: "hotel" },
    }
    expect(buildBookingUrl({ propertyId: null }, config)).toBe(GROUP_URL)
  })

  it("encodes values so they cannot inject extra params", () => {
    const config: BookingConfig = {
      baseUrl: GROUP_URL,
      paramMap: { ...UNVERIFIED_PARAM_MAP, property: "hotel" },
    }
    const url = new URL(buildBookingUrl({ propertyId: "1&evil=1" }, config))
    expect(url.searchParams.get("hotel")).toBe("1&evil=1")
    expect(url.searchParams.has("evil")).toBe(false)
  })

  it("returns empty string for missing, invalid, or non-https base URLs", () => {
    const p = UNVERIFIED_PARAM_MAP
    expect(buildBookingUrl({}, { baseUrl: "", paramMap: p })).toBe("")
    expect(buildBookingUrl({}, { baseUrl: "not a url", paramMap: p })).toBe("")
    expect(buildBookingUrl({}, { baseUrl: "http://example.com", paramMap: p })).toBe("")
    expect(buildBookingUrl({}, { baseUrl: "javascript:alert(1)", paramMap: p })).toBe("")
  })
})
