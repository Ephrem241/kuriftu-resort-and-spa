import { describe, expect, it } from "vitest"

import { cleanLine, cleanMultiline, createEnquirySchema, fieldErrors } from "./schema"

const today = "2026-11-22"
const schema = createEnquirySchema({ today })
const errorsOf = (input: unknown) => {
  const r = schema.safeParse(input)
  return r.success ? {} : fieldErrors(r.error)
}

const contact = { type: "contact", name: "Abebe Kebede", email: "abebe@example.com", message: "Do you host school trips?" }

describe("enquiry schema", () => {
  it("accepts a valid contact enquiry and trims input", () => {
    const r = schema.parse({ ...contact, name: "  Abebe Kebede  ", email: " abebe@example.com " })
    expect(r).toMatchObject({ type: "contact", name: "Abebe Kebede", email: "abebe@example.com" })
  })

  it("requires name, a valid email and a real message for contact", () => {
    expect(errorsOf({ type: "contact", name: "A", email: "x", message: "hi" })).toEqual({
      name: "Enter your name",
      email: "Enter a valid email address",
      message: "Tell us a little more",
    })
  })

  it("rejects an unknown type", () => {
    expect(errorsOf({ ...contact, type: "booking" })).toHaveProperty("type")
  })

  it("requires dates and guests for events", () => {
    const errors = errorsOf({ type: "event", name: "Abebe", email: "a@b.co" })
    expect(errors).toHaveProperty("startDate")
    expect(errors).toHaveProperty("guests")
  })

  it("rejects past dates and an end before the start", () => {
    const base = { type: "meeting", name: "Abebe", email: "a@b.co", guests: 20 }
    expect(errorsOf({ ...base, startDate: "2026-11-21" })).toEqual({ startDate: "Date can't be in the past" })
    expect(errorsOf({ ...base, startDate: "2026-12-10", endDate: "2026-12-09" })).toEqual({
      endDate: "End date must be on or after the start date",
    })
    expect(errorsOf({ ...base, startDate: today, endDate: today })).toEqual({})
  })

  it("rejects impossible dates", () => {
    expect(errorsOf({ type: "event", name: "Abebe", email: "a@b.co", guests: 2, startDate: "2026-02-30" })).toHaveProperty(
      "startDate"
    )
  })

  it("requires a resort for spa and checks the slug shape", () => {
    const base = { type: "spa", name: "Abebe", email: "a@b.co" }
    expect(errorsOf(base)).toHaveProperty("resort")
    expect(errorsOf({ ...base, resort: "Boston Spa" })).toEqual({ resort: "Choose a resort" })
    expect(errorsOf({ ...base, resort: "boston" })).toEqual({})
  })

  it("caps guests", () => {
    expect(errorsOf({ type: "spa", name: "Abebe", email: "a@b.co", resort: "boston", guests: 21 })).toHaveProperty("guests")
    expect(errorsOf({ type: "event", name: "Abebe", email: "a@b.co", startDate: today, guests: 1.5 })).toHaveProperty("guests")
  })

  it("validates an optional phone", () => {
    expect(errorsOf({ ...contact, phone: "" })).toEqual({})
    expect(errorsOf({ ...contact, phone: "+251 (0) 999-222-211" })).toEqual({})
    expect(errorsOf({ ...contact, phone: "call me" })).toEqual({ phone: "Enter a valid phone number" })
  })

  it("treats a non-string honeypot as filled", () => {
    expect(schema.parse({ ...contact, website: 42 }).website).toBe("filled")
    expect(schema.parse(contact).website).toBeUndefined()
  })

  it("never puts input into error messages", () => {
    const evil = "<script>alert(1)</script>"
    const messages = Object.values(errorsOf({ type: "spa", name: evil, email: evil, resort: evil, phone: evil }))
    for (const m of messages) expect(m).not.toContain("script")
  })
})

describe("text cleaning", () => {
  it("collapses line breaks and strips control characters in single-line fields", () => {
    expect(cleanLine("Abebe\r\nBcc: x@y.z\u0000")).toBe("Abebe Bcc: x@y.z")
  })

  it("keeps newlines in messages", () => {
    expect(cleanMultiline(" Line 1\r\nLine 2\u0007 ")).toBe("Line 1\nLine 2")
  })
})
