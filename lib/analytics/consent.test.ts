import { describe, expect, it } from "vitest"

import { CONSENT_KEY, readConsent, writeConsent } from "./consent"

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    data,
  }
}

describe("readConsent", () => {
  it("is undecided with no storage or no value", () => {
    expect(readConsent(undefined)).toBe("undecided")
    expect(readConsent(memoryStorage())).toBe("undecided")
  })

  it("reads a stored choice", () => {
    const s = memoryStorage({ [CONSENT_KEY]: JSON.stringify({ v: 1, choice: "granted", at: "x" }) })
    expect(readConsent(s)).toBe("granted")
  })

  it("treats junk, other versions and unknown choices as undecided", () => {
    for (const raw of ["not json", "null", "{}", '{"v":2,"choice":"granted"}', '{"v":1,"choice":"maybe"}']) {
      expect(readConsent(memoryStorage({ [CONSENT_KEY]: raw }))).toBe("undecided")
    }
  })

  it("treats throwing storage as undecided", () => {
    const s = {
      getItem: () => {
        throw new Error("blocked")
      },
      setItem: () => {},
    }
    expect(readConsent(s)).toBe("undecided")
  })
})

describe("writeConsent", () => {
  it("round-trips a choice with a timestamp", () => {
    const s = memoryStorage()
    expect(writeConsent(s, "denied", new Date("2026-11-22T10:00:00Z"))).toBe(true)
    expect(JSON.parse(s.data.get(CONSENT_KEY)!)).toEqual({
      v: 1,
      choice: "denied",
      at: "2026-11-22T10:00:00.000Z",
    })
    expect(readConsent(s)).toBe("denied")
  })

  it("returns false when storage is missing or throws", () => {
    expect(writeConsent(undefined, "granted")).toBe(false)
    const s = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota")
      },
    }
    expect(writeConsent(s, "granted")).toBe(false)
  })
})
