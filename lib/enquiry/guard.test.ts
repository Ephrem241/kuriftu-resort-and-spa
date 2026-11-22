import { describe, expect, it } from "vitest"

import { BodyTooLargeError, allowedOrigins, checkRequest, clientKey, readJsonBody } from "./guard"

const origins = allowedOrigins("https://www.kurifturesorts.com", "production")
const json = { "content-type": "application/json" }

describe("checkRequest", () => {
  it("accepts same-origin JSON and requests without an Origin header", () => {
    expect(checkRequest(new Headers({ ...json, origin: "https://www.kurifturesorts.com" }), { allowedOrigins: origins })).toBeNull()
    expect(checkRequest(new Headers({ "content-type": "application/json; charset=utf-8" }), { allowedOrigins: origins })).toBeNull()
  })

  it("rejects other origins", () => {
    expect(checkRequest(new Headers({ ...json, origin: "https://evil.example" }), { allowedOrigins: origins })?.status).toBe(403)
  })

  it("rejects non-JSON and oversized bodies", () => {
    expect(
      checkRequest(new Headers({ "content-type": "application/x-www-form-urlencoded" }), { allowedOrigins: origins })?.status
    ).toBe(415)
    expect(checkRequest(new Headers({ ...json, "content-length": "20000" }), { allowedOrigins: origins })?.status).toBe(413)
  })
})

describe("allowedOrigins", () => {
  it("adds localhost only outside production", () => {
    expect(origins).toEqual(["https://www.kurifturesorts.com"])
    expect(allowedOrigins("http://localhost:3000", "development")).toEqual(["http://localhost:3000", "http://127.0.0.1:3000"])
  })
})

describe("clientKey", () => {
  it("hashes the first forwarded IP", () => {
    const a = clientKey(new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" }))
    expect(a).toMatch(/^[0-9a-f]{64}$/)
    expect(a).not.toContain("203.0.113.5")
    expect(a).toBe(clientKey(new Headers({ "x-real-ip": "203.0.113.5" })))
  })
})

describe("readJsonBody", () => {
  it("parses JSON and caps the real body size", async () => {
    expect(await readJsonBody(new Request("http://x", { method: "POST", body: '{"a":1}' }))).toEqual({ a: 1 })
    await expect(readJsonBody(new Request("http://x", { method: "POST", body: "x".repeat(20) }), 10)).rejects.toBeInstanceOf(
      BodyTooLargeError
    )
  })
})
