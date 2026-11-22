import { describe, expect, it, vi } from "vitest"

import { buildEnquiryEmail, sendEmail } from "./email"
import type { EnquiryInput } from "./schema"

const event: EnquiryInput = {
  type: "event",
  name: "Abebe Kebede",
  email: "abebe@example.com",
  phone: "+251 999 222 211",
  startDate: "2026-12-10",
  endDate: "2026-12-11",
  guests: 120,
  message: "Wedding reception.\nOutdoor if possible.",
}

describe("buildEnquiryEmail", () => {
  it("builds a plain-text summary with a Studio link", () => {
    const { subject, text } = buildEnquiryEmail({
      enquiry: event,
      enquiryId: "abc123",
      resortName: "Kuriftu Resort & Spa Bishoftu",
      studioUrl: "https://kuriftu.sanity.studio/",
    })
    expect(subject).toBe("New event or wedding enquiry — Kuriftu Resort & Spa Bishoftu")
    expect(text).toContain("Name: Abebe Kebede")
    expect(text).toContain("Guests: 120")
    expect(text).toContain("Date to: 2026-12-11")
    expect(text).toContain("Message:\nWedding reception.\nOutdoor if possible.")
    expect(text).toContain("https://kuriftu.sanity.studio/intent/edit/id=abc123;type=enquiry")
  })

  it("leaves out empty fields and the Studio link when not configured", () => {
    const { subject, text } = buildEnquiryEmail({
      enquiry: { type: "contact", name: "Abebe", email: "a@b.co", phone: "", message: "Hello there, a question." },
      enquiryId: "x",
      resortName: null,
    })
    expect(subject).toBe("New general enquiry — Kuriftu")
    expect(text).not.toContain("Phone:")
    expect(text).not.toContain("Resort:")
    expect(text).not.toContain("Studio")
  })

  it("keeps the subject on one line", () => {
    const { subject } = buildEnquiryEmail({ enquiry: event, enquiryId: "x", resortName: "A\r\nBcc: evil@x.y" })
    expect(subject).not.toMatch(/[\r\n]/)
  })
})

describe("sendEmail", () => {
  const message = { to: "info@example.com", replyTo: "a@b.co", subject: "S", text: "T" }

  it("returns false without calling the provider when not configured", async () => {
    const fetchImpl = vi.fn()
    expect(await sendEmail(message, { apiKey: "", from: "x@y.z", fetchImpl })).toBe(false)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it("posts plain text to Resend with reply_to", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }))
    expect(await sendEmail(message, { apiKey: "key", from: "web@example.com", fetchImpl })).toBe(true)
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe("https://api.resend.com/emails")
    expect(JSON.parse(init.body as string)).toEqual({
      from: "web@example.com",
      to: ["info@example.com"],
      reply_to: "a@b.co",
      subject: "S",
      text: "T",
    })
  })

  it("returns false on a provider error or network failure", async () => {
    const rejected = vi.fn(async () => new Response("{}", { status: 422 }))
    expect(await sendEmail(message, { apiKey: "k", from: "f@x.y", fetchImpl: rejected })).toBe(false)
    const broken = vi.fn(async () => {
      throw new Error("network")
    })
    expect(await sendEmail(message, { apiKey: "k", from: "f@x.y", fetchImpl: broken })).toBe(false)
  })
})
