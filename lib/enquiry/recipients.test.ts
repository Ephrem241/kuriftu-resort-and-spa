import { describe, expect, it } from "vitest"

import { pickFallbackPhone, pickRecipient, type EnquiryContacts } from "./recipients"

const resort = { emails: [{ address: "bishoftu@example.com" }], phones: [{ display: "+251 1", tel: "+2511" }] }
const reservations = { emails: [{ address: "reservations@example.com" }], phones: [{ display: "+251 2", tel: "+2512" }] }
const headOffice = { emails: [{ address: "info@example.com" }], phones: [{ display: "+251 3", tel: "+2513" }] }

const all: EnquiryContacts = { resort, reservations, headOffice }

describe("pickRecipient", () => {
  it("prefers the resort for event, meeting and spa", () => {
    for (const type of ["event", "meeting", "spa"] as const) {
      expect(pickRecipient(type, all)).toBe("bishoftu@example.com")
    }
  })

  it("falls back to reservations, then head office, for bookings", () => {
    expect(pickRecipient("event", { ...all, resort: null })).toBe("reservations@example.com")
    expect(pickRecipient("spa", { resort: null, reservations: { emails: [] }, headOffice })).toBe("info@example.com")
  })

  it("sends general contact to head office when no resort is chosen", () => {
    expect(pickRecipient("contact", { ...all, resort: null })).toBe("info@example.com")
    expect(pickRecipient("contact", all)).toBe("bishoftu@example.com")
    expect(pickRecipient("contact", { resort: null, reservations, headOffice: null })).toBe("reservations@example.com")
  })

  it("skips blank addresses and returns null when content has none", () => {
    expect(pickRecipient("event", { resort: { emails: [{ address: " " }, null] }, reservations: null, headOffice })).toBe(
      "info@example.com"
    )
    expect(pickRecipient("contact", { resort: null, reservations: null, headOffice: null })).toBeNull()
  })
})

describe("pickFallbackPhone", () => {
  it("uses the same order as the recipient", () => {
    expect(pickFallbackPhone("spa", all)).toEqual({ display: "+251 1", tel: "+2511" })
    expect(pickFallbackPhone("contact", { ...all, resort: null })).toEqual({ display: "+251 3", tel: "+2513" })
  })

  it("needs both a display and a dialable number", () => {
    expect(
      pickFallbackPhone("event", { resort: { phones: [{ display: "+251 1", tel: null }] }, reservations, headOffice })
    ).toEqual({ display: "+251 2", tel: "+2512" })
    expect(pickFallbackPhone("event", { resort: null, reservations: null, headOffice: null })).toBeNull()
  })
})
