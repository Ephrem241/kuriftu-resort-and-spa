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

  describe("event and meeting enquiries", () => {
    const event = { type: "event", name: "Abebe", phone: "+251 911 123 456" }

    it("needs only name and phone", () => {
      expect(errorsOf(event)).toEqual({})
      expect(errorsOf({ type: "event" })).toEqual({ name: "Enter your name", phone: "Enter your phone number" })
      expect(errorsOf({ ...event, email: "", startDate: "", message: "", eventType: "", package: "" })).toEqual({})
    })

    it("checks a given email, package and event type", () => {
      expect(errorsOf({ ...event, email: "nope" })).toEqual({ email: "Enter a valid email address" })
      expect(errorsOf({ ...event, package: "Weddings Bishoftu" })).toEqual({ package: "Choose a package" })
      expect(errorsOf({ ...event, eventType: "funeral" })).toEqual({ eventType: "Choose an event type" })
    })

    it("matches the event type to the enquiry type", () => {
      expect(errorsOf({ ...event, eventType: "wedding" })).toEqual({})
      expect(errorsOf({ ...event, eventType: "conference" })).toEqual({ eventType: "Choose an event type" })
      expect(errorsOf({ ...event, type: "meeting", eventType: "conference" })).toEqual({})
      expect(errorsOf({ ...event, type: "meeting", eventType: "wedding" })).toEqual({ eventType: "Choose an event type" })
    })

    it("rejects past dates and an end before the start", () => {
      const meeting = { ...event, type: "meeting", guests: 20 }
      expect(errorsOf({ ...meeting, startDate: "2026-11-21" })).toEqual({ startDate: "Date can't be in the past" })
      expect(errorsOf({ ...meeting, startDate: "2026-12-10", endDate: "2026-12-09" })).toEqual({
        endDate: "End date must be on or after the start date",
      })
      expect(errorsOf({ ...meeting, startDate: today, endDate: today })).toEqual({})
    })

    it("rejects impossible dates", () => {
      expect(errorsOf({ ...event, startDate: "2026-02-30" })).toHaveProperty("startDate")
    })
  })

  describe("spa requests", () => {
    const spa = { type: "spa", name: "Abebe", phone: "+251 911 123 456", treatment: "massage-cave", startDate: today }

    it("needs name, phone, treatment and date, but not email", () => {
      expect(errorsOf(spa)).toEqual({})
      expect(errorsOf({ type: "spa" })).toEqual({
        name: "Enter your name",
        phone: "Enter your phone number",
        treatment: "Choose a treatment",
        startDate: "Choose a date",
      })
    })

    it("requires a phone and checks its shape", () => {
      expect(errorsOf({ ...spa, phone: "" })).toEqual({ phone: "Enter your phone number" })
      expect(errorsOf({ ...spa, phone: "call me" })).toEqual({ phone: "Enter a valid phone number" })
    })

    it("accepts an empty email and checks a given one", () => {
      expect(errorsOf({ ...spa, email: "" })).toEqual({})
      expect(errorsOf({ ...spa, email: "nope" })).toEqual({ email: "Enter a valid email address" })
    })

    it("checks the treatment and optional resort slugs", () => {
      expect(errorsOf({ ...spa, treatment: "Massage Cave" })).toEqual({ treatment: "Choose a treatment" })
      expect(errorsOf({ ...spa, resort: "Boston Spa" })).toEqual({ resort: "Choose a resort" })
      expect(errorsOf({ ...spa, resort: "boston" })).toEqual({})
    })

    it("rejects a past date", () => {
      expect(errorsOf({ ...spa, startDate: "2020-01-01" })).toEqual({ startDate: "Date can't be in the past" })
    })

    it("accepts an empty or HH:MM time only", () => {
      expect(errorsOf({ ...spa, time: "" })).toEqual({})
      expect(errorsOf({ ...spa, time: "09:30" })).toEqual({})
      expect(errorsOf({ ...spa, time: "23:59" })).toEqual({})
      expect(errorsOf({ ...spa, time: "24:00" })).toEqual({ time: "Choose a valid time" })
      expect(errorsOf({ ...spa, time: "9am" })).toEqual({ time: "Choose a valid time" })
    })
  })

  it("caps guests", () => {
    expect(
      errorsOf({ type: "spa", name: "Abebe", phone: "0911123456", treatment: "facial", startDate: today, guests: 21 })
    ).toHaveProperty("guests")
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
    const messages = Object.values(
      errorsOf({ type: "spa", name: evil, email: evil, resort: evil, phone: evil, treatment: evil, time: evil })
    )
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
