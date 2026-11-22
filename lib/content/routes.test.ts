import { describe, expect, it } from "vitest"

import { hrefFor, pathForDocument } from "./routes"

describe("pathForDocument", () => {
  it.each([
    [{ _type: "resort", slug: "bishoftu" }, "/resorts/bishoftu"],
    [{ _type: "room", slug: "deluxe-room", resortSlug: "bishoftu" }, "/resorts/bishoftu/rooms/deluxe-room"],
    [{ _type: "experience", slug: "boat-ride" }, "/experience/boat-ride"],
    [{ _type: "spaTreatment", slug: "hot-stone" }, "/wellness?treatment=hot-stone#spa-booking"],
    [{ _type: "eventPackage", slug: "weddings" }, "/event/weddings"],
    [{ _type: "offer", slug: "november" }, "/offers/november"],
    [{ _type: "page", slug: "about" }, "/about"],
  ])("maps %o", (target, expected) => {
    expect(pathForDocument(target)).toBe(expected)
  })

  it("returns null for missing slugs, rooms without a resort, and unknown types", () => {
    expect(pathForDocument(null)).toBeNull()
    expect(pathForDocument({ _type: "resort", slug: null })).toBeNull()
    expect(pathForDocument({ _type: "room", slug: "x", resortSlug: null })).toBeNull()
    expect(pathForDocument({ _type: "enquiry", slug: "x" })).toBeNull()
  })
})

describe("hrefFor", () => {
  it("resolves internal, path and external links", () => {
    expect(hrefFor({ linkType: "internal", target: { _type: "resort", slug: "awash" } })).toBe("/resorts/awash")
    expect(hrefFor({ linkType: "path", path: "/experience" })).toBe("/experience")
    expect(hrefFor({ linkType: "external", url: "https://example.com/x" })).toBe("https://example.com/x")
    expect(hrefFor({ linkType: "external", url: "tel:+251999222211" })).toBe("tel:+251999222211")
  })

  it("refuses unsafe or incomplete links", () => {
    expect(hrefFor({ linkType: "external", url: "javascript:alert(1)" })).toBe("#")
    expect(hrefFor({ linkType: "external", url: "not a url" })).toBe("#")
    expect(hrefFor({ linkType: "path", path: "//evil.example" })).toBe("#")
    expect(hrefFor({ linkType: "path", path: "relative" })).toBe("#")
    expect(hrefFor({ linkType: "internal", target: null })).toBe("#")
    expect(hrefFor(null)).toBe("#")
  })
})
