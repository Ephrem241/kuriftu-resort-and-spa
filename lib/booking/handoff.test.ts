import { describe, expect, it } from "vitest"

import type { BookingConfig } from "./config"
import { buildBookingUrl } from "./handoff"

const GROUP_URL =
  "https://book.travelbookgroup.com/premium/group_index.html?id_stile=22372&tst_prntz=si&headvar=ok&lingua_int=eng&id_gruppo=31028&dc_gruppo=2281"
const config: BookingConfig = { baseUrl: GROUP_URL }

const bishoftu = { id: "29728", code: "2392" }
const stay = { checkIn: "2027-01-05", checkOut: "2027-01-08", adults: 2, children: 0 }

const params = (url: string) => Object.fromEntries(new URL(url).searchParams)

describe("buildBookingUrl", () => {
  it("opens the group page unchanged without a property", () => {
    expect(buildBookingUrl({}, config)).toBe(GROUP_URL)
    expect(buildBookingUrl({ property: null, stay }, config)).toBe(GROUP_URL)
  })

  it("opens the property calendar when there is no stay", () => {
    const url = buildBookingUrl({ property: bishoftu }, config)
    expect(url.startsWith("https://book.travelbookgroup.com/premium/index.html?")).toBe(true)
    expect(params(url)).toEqual({ id_albergo: "29728", dc: "2392", id_stile: "22372", lingua_int: "eng" })
  })

  it("opens the property's room results with dates and guests", () => {
    const url = buildBookingUrl({ property: bishoftu, stay }, config)
    expect(url.startsWith("https://book.travelbookgroup.com/premium/index2.html?")).toBe(true)
    expect(params(url)).toEqual({
      id_albergo: "29728",
      dc: "2392",
      id_stile: "22372",
      lingua_int: "eng",
      gg: "05",
      mm: "01",
      aa: "2027",
      ggf: "08",
      mmf: "01",
      aaf: "2027",
      notti_1: "3",
      tot_camere: "1",
      tot_adulti: "2",
      tot_bambini: "0",
      adulti1: "2",
      bambini1: "0",
    })
  })

  it("sends the children count without ages, across a month and year end", () => {
    const url = buildBookingUrl(
      { property: bishoftu, stay: { checkIn: "2026-12-30", checkOut: "2027-01-02", adults: 1, children: 2 } },
      config
    )
    const p = params(url)
    expect([p.gg, p.mm, p.aa, p.ggf, p.mmf, p.aaf, p.notti_1]).toEqual(["30", "12", "2026", "02", "01", "2027", "3"])
    expect([p.tot_bambini, p.bambini1]).toEqual(["2", "2"])
    expect(Object.keys(p).some((k) => k.startsWith("st1bamb"))).toBe(false)
  })

  it("falls back to the property calendar for an invalid stay", () => {
    const backwards = { ...stay, checkIn: "2027-01-08", checkOut: "2027-01-05" }
    const badDate = { ...stay, checkIn: "2027-02-30" }
    const noAdults = { ...stay, adults: 0 }
    for (const s of [backwards, badDate, noAdults]) {
      expect(buildBookingUrl({ property: bishoftu, stay: s }, config)).toContain("/premium/index.html?")
    }
  })

  it("ignores property codes that are not digits, so they cannot inject params", () => {
    expect(buildBookingUrl({ property: { id: "1&evil=1", code: "2392" }, stay }, config)).toBe(GROUP_URL)
    expect(buildBookingUrl({ property: { id: "29728", code: "" }, stay }, config)).toBe(GROUP_URL)
  })

  it("never leaves the configured engine host", () => {
    const url = new URL(buildBookingUrl({ property: bishoftu, stay }, config))
    expect(url.origin).toBe("https://book.travelbookgroup.com")
  })

  it("returns empty string for a missing, invalid, non-https or non-engine base URL", () => {
    for (const baseUrl of [
      "",
      "not a url",
      "http://book.travelbookgroup.com/premium/group_index.html",
      "javascript:alert(1)",
      "https://example.com/",
    ]) {
      expect(buildBookingUrl({ property: bishoftu, stay }, { baseUrl })).toBe("")
    }
  })
})
